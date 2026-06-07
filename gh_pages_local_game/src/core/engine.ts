import type {
  ArtifactConfig,
  ArtifactTriggerConfig,
  ChoiceHooks,
  EffectConfig,
  ExamLog,
  ExamState,
  GameOptions,
  LiveExamStatus,
  LiveScoreStatus,
  OwnedArtifact,
  QuestionModifier,
  RunResult,
  SubjectId,
  Timing,
  TriggerContext
} from "./types.js";
import { DEFAULT_ELECTIVE_SUBJECTS, ELECTIVE_SUBJECTS, REQUIRED_SUBJECTS, SUBJECT_EXAM_RULES, SUBJECT_LABELS } from "./types.js";
import { defaultSeed } from "./rng.js";
import { appendLog, createGameState, createOwnedArtifact, type GameState } from "./state.js";
import { evaluateCondition } from "./conditions.js";
import { applyEffect } from "./effects.js";
import { clamp } from "./math.js";
import { collectEventEntries, sortEventEntries } from "./eventBus.js";
import { calcLayerForEffects, phaseForTiming } from "./phases.js";
import { queryModifierValue } from "./modifierSystem.js";

const EVENT_TRIGGER_LIMIT = 20;
const NON_REPLAYABLE_SCORE_EFFECTS = new Set<EffectConfig["op"]>([
  "maximizeOnesDigit",
  "maximizeDigitSwap"
]);

export async function runGame(
  artifactConfigs: ArtifactConfig[],
  options: GameOptions = {},
  hooks: ChoiceHooks = {}
): Promise<RunResult> {
  const seed = options.seed ?? defaultSeed();
  const subjects = normalizeSubjects(options.subjects);
  const state = createGameState(seed, subjects, artifactConfigs);
  const year = options.year ?? 1;
  const threshold = options.threshold ?? 750;
  state.onLog = hooks.onLog;
  applyCarryoverStats(state, options.carryoverStats);

  if (options.initialArtifacts) {
    for (const artifactId of options.initialArtifacts) {
      if (options.initialArtifactMode === "load") {
        loadArtifact(state, artifactId);
      } else {
        await gainArtifact(state, artifactId, hooks, options);
      }
    }
    if (options.initialArtifactMode === "load") {
      emitArtifactsChanged(state, hooks);
    }
  } else {
    for (let i = 0; i < (options.openingDrafts ?? 6); i += 1) {
      await draftArtifact(state, hooks, options, 4, "开局遗物");
    }
  }

  for (let i = 0; i < subjects.length; i += 1) {
    if (options.preExamDrafts) {
      await draftArtifact(state, hooks, options, 4, `第 ${year} 年考前遗物`);
    }
    await runExam(state, subjects[i], i, hooks, options);
    if (options.postExamDrafts ?? true) {
      await draftArtifact(state, hooks, options, 4, "考试结束奖励");
    }
  }

  await triggerEvent(state, "RUN_END", undefined, hooks, options);
  const rawTotal = state.exams.reduce((sum, exam) => sum + exam.score, 0);
  const totalScore = Math.round(rawTotal + state.stats.currentTotalAdjustment);

  const result = {
    seed,
    subjects,
    year,
    threshold,
    artifactIds: state.artifacts.map((owned) => owned.artifactId),
    artifactNames: state.artifacts.map((owned) => artifactName(state, owned)),
    carryoverStats: captureCarryoverStats(state),
    exams: state.exams,
    totalScore,
    log: state.log
  };
  hooks.onRunEnd?.(result);
  return result;
}

function normalizeSubjects(subjects?: SubjectId[]): SubjectId[] {
  const electives = subjects?.filter((subject) => !REQUIRED_SUBJECTS.includes(subject as never));
  const selectedElectives = electives?.length === 3 ? electives : [...DEFAULT_ELECTIVE_SUBJECTS];
  return [...REQUIRED_SUBJECTS, ...selectedElectives];
}

function artifactName(state: GameState, owned: OwnedArtifact): string {
  return state.artifactById.get(owned.artifactId)?.name ?? owned.artifactId;
}

function applyCarryoverStats(state: GameState, carryoverStats?: Partial<GameState["stats"]>): void {
  if (!carryoverStats) {
    return;
  }
  state.stats = {
    ...state.stats,
    ...carryoverStats,
    currentTotalAdjustment: 0
  };
  state.stats.stamina = Math.max(state.stats.staminaFloor, state.stats.stamina);
}

function captureCarryoverStats(state: GameState): GameState["stats"] {
  return {
    ...state.stats,
    stamina: Math.max(state.stats.staminaFloor, state.stats.baseStamina),
    currentTotalAdjustment: 0
  };
}

function loadArtifact(state: GameState, artifactId: string): void {
  const config = state.artifactById.get(artifactId);
  if (!config) {
    throw new Error(`Unknown artifact: ${artifactId}`);
  }
  state.artifacts.push(createOwnedArtifact(state, artifactId));
}

function ownedArtifactConfigs(state: GameState): ArtifactConfig[] {
  return state.artifacts
    .map((owned) => state.artifactById.get(owned.artifactId))
    .filter((artifact): artifact is ArtifactConfig => Boolean(artifact));
}

function emitArtifactsChanged(state: GameState, hooks: ChoiceHooks): void {
  hooks.onArtifactsChanged?.(ownedArtifactConfigs(state));
}

async function draftArtifact(
  state: GameState,
  hooks: ChoiceHooks,
  options: GameOptions,
  baseChoices: number,
  reason: string
): Promise<void> {
  const choiceCount = Math.max(
    1,
    baseChoices +
      queryModifierValue(state, "draftChoicesBonus", state.stats.draftChoicesBonus) +
      state.stats.nextDraftChoicesBonus
  );
  state.stats.nextDraftChoicesBonus = 0;
  const choices = createDraftChoices(state, choiceCount);
  if (choices.length === 0) {
    appendLog(state, `${reason}: 遗物池已空。`);
    return;
  }
  const pickedIndex = await chooseArtifactIndex(choices, reason, hooks, options, state);
  if (pickedIndex < 0) {
    appendLog(state, `${reason}: 跳过抽取。`);
    return;
  }
  await gainArtifact(state, choices[pickedIndex].id, hooks, options);
}

function createDraftChoices(state: GameState, count: number): ArtifactConfig[] {
  const available = state.artifactConfigs.filter((artifact) => {
    if (artifact.draftable === false) {
      return false;
    }
    const ownedCount = state.artifacts.filter((owned) => owned.artifactId === artifact.id).length;
    return ownedCount < (artifact.maxCopies ?? 1);
  });
  return weightedSampleDraftChoices(state, available, count);
}

function weightedSampleDraftChoices(
  state: GameState,
  available: ArtifactConfig[],
  count: number
): ArtifactConfig[] {
  const pool = [...available];
  const choices: ArtifactConfig[] = [];
  const tagCounts = countOwnedTags(state);
  while (pool.length > 0 && choices.length < count) {
    const index = pickWeightedArtifactIndex(state, pool, tagCounts);
    const [choice] = pool.splice(index, 1);
    choices.push(choice);
  }
  return choices;
}

function pickWeightedArtifactIndex(
  state: GameState,
  artifacts: ArtifactConfig[],
  tagCounts: Map<string, number>
): number {
  const weights = artifacts.map((artifact) => draftWeightForArtifact(artifact, tagCounts));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let roll = state.rng.next() * total;
  for (let index = 0; index < weights.length; index += 1) {
    roll -= weights[index];
    if (roll <= 0) {
      return index;
    }
  }
  return artifacts.length - 1;
}

function draftWeightForArtifact(artifact: ArtifactConfig, tagCounts: Map<string, number>): number {
  const matchingOwnedTags = artifact.tags.reduce((sum, tag) => sum + (tagCounts.get(tag) ?? 0), 0);
  return 1 + matchingOwnedTags * 0.08;
}

function countOwnedTags(state: GameState): Map<string, number> {
  const counts = new Map<string, number>();
  for (const owned of state.artifacts) {
    const config = state.artifactById.get(owned.artifactId);
    for (const tag of config?.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return counts;
}

async function chooseArtifactIndex(
  choices: ArtifactConfig[],
  reason: string,
  hooks: ChoiceHooks,
  options: GameOptions,
  state: GameState
): Promise<number> {
  const chosen = hooks.chooseArtifact
    ? await hooks.chooseArtifact(choices, reason)
    : autoArtifactChoice(choices, options, state);
  if (Number.isInteger(chosen) && chosen < 0) {
    return -1;
  }
  return clampIndex(chosen, choices.length);
}

function autoArtifactChoice(
  choices: ArtifactConfig[],
  options: GameOptions,
  state: GameState
): number {
  if (options.autoPolicy === "random") {
    return state.rng.int(choices.length);
  }
  if (options.autoPolicy === "rare") {
    const order = ["special", "rare", "uncommon", "common"];
    return choices
      .map((choice, index) => ({ index, rank: order.indexOf(choice.rarity) }))
      .sort((a, b) => a.rank - b.rank)[0].index;
  }
  return 0;
}

function clampIndex(value: number, length: number): number {
  if (!Number.isInteger(value)) {
    return 0;
  }
  return Math.min(length - 1, Math.max(0, value));
}

async function gainArtifact(
  state: GameState,
  artifactId: string,
  hooks: ChoiceHooks,
  options: GameOptions
): Promise<void> {
  const config = state.artifactById.get(artifactId);
  if (!config) {
    throw new Error(`Unknown artifact: ${artifactId}`);
  }
  const owned = createOwnedArtifact(state, artifactId);
  state.artifacts.push(owned);
  appendLog(state, `获得遗物: ${config.name}`);
  state.currentEventCount = 0;
  await triggerOwnedArtifact(state, owned, "ARTIFACT_GAINED", undefined, hooks, options);
  emitArtifactsChanged(state, hooks);
  await enforceArtifactLimit(state, hooks, options);
}

async function enforceArtifactLimit(
  state: GameState,
  hooks: ChoiceHooks,
  options: GameOptions
): Promise<void> {
  while (state.artifacts.length > queryModifierValue(state, "artifactLimit", state.stats.artifactLimit)) {
    if (state.stats.preventDiscardCharges > 0) {
      state.stats.preventDiscardCharges -= 1;
      appendLog(state, "遗物上限超出，但本次丢弃被免除。");
      return;
    }
    const configs = state.artifacts.map((owned) => state.artifactById.get(owned.artifactId)!);
    const chosen = hooks.chooseDiscard
      ? await hooks.chooseDiscard(configs)
      : autoDiscardIndex(configs, options, state);
    await loseArtifactAt(state, clampIndex(chosen, state.artifacts.length), hooks, options);
  }
}

function autoDiscardIndex(configs: ArtifactConfig[], options: GameOptions, state: GameState): number {
  if (options.autoPolicy === "random") {
    return state.rng.int(configs.length);
  }
  return 0;
}

async function loseArtifactAt(
  state: GameState,
  index: number,
  hooks: ChoiceHooks,
  options: GameOptions
): Promise<void> {
  const [owned] = state.artifacts.splice(index, 1);
  if (!owned) {
    return;
  }
  const config = state.artifactById.get(owned.artifactId);
  appendLog(state, `失去遗物: ${config?.name ?? owned.artifactId}`);
  state.currentEventCount = 0;
  await triggerOwnedArtifact(state, owned, "ARTIFACT_LOST", undefined, hooks, options, owned);
  for (const listener of [...state.artifacts]) {
    await triggerOwnedArtifact(state, listener, "ARTIFACT_LOST", undefined, hooks, options, owned);
  }
  emitArtifactsChanged(state, hooks);
}

async function loseOwnedArtifact(
  state: GameState,
  owned: OwnedArtifact,
  hooks: ChoiceHooks,
  options: GameOptions
): Promise<void> {
  const index = state.artifacts.findIndex((item) => item.instanceId === owned.instanceId);
  if (index >= 0) {
    await loseArtifactAt(state, index, hooks, options);
  }
}

async function triggerEvent(
  state: GameState,
  timing: Timing,
  exam: ExamState | undefined,
  hooks: ChoiceHooks,
  options: GameOptions
): Promise<void> {
  state.currentEventCount = 0;
  const entries = collectEventEntries(state, timing);
  for (const entry of entries) {
    await executeTrigger(
      state,
      {
        timing,
        owner: entry.owned,
        triggerIndex: entry.triggerIndex,
        trigger: entry.trigger
      },
      exam,
      hooks,
      options
    );
  }
}

async function triggerOwnedArtifact(
  state: GameState,
  owned: OwnedArtifact,
  timing: Timing,
  exam: ExamState | undefined,
  hooks: ChoiceHooks,
  options: GameOptions,
  lostArtifact?: OwnedArtifact,
  sourceTrigger?: TriggerContext
): Promise<void> {
  const config = state.artifactById.get(owned.artifactId);
  if (!config) {
    return;
  }
  const triggers = sortEventEntries(
    config.triggers
      .map((trigger, triggerIndex) => ({
        owned,
        trigger,
        triggerIndex,
        slotIndex: state.artifacts.findIndex((item) => item.instanceId === owned.instanceId),
        phase: trigger.phase ?? phaseForTiming(trigger.timing),
        calcLayer: calcLayerForEffects(trigger.effects),
        order: trigger.order ?? trigger.priority ?? 500
      }))
    .filter((item) => item.trigger.timing === timing)
  );

  for (const item of triggers) {
    await executeTrigger(
      state,
      {
        timing,
        owner: owned,
        triggerIndex: item.triggerIndex,
        trigger: item.trigger,
        lostArtifact,
        sourceTrigger
      },
      exam,
      hooks,
      options
    );
  }
}

async function executeTrigger(
  state: GameState,
  context: TriggerContext,
  exam: ExamState | undefined,
  hooks: ChoiceHooks,
  options: GameOptions
): Promise<boolean> {
  if (state.currentEventCount >= EVENT_TRIGGER_LIMIT) {
    appendLog(state, "本次结算触发次数达到 20，后续遗物触发被跳过。");
    return false;
  }
  if (!evaluateCondition(context.trigger.condition, state, {
    exam,
    owner: context.owner,
    lostArtifact: context.lostArtifact
  })) {
    return false;
  }
  if (!consumeTriggerLimit(state, context, exam)) {
    return false;
  }

  state.currentEventCount += 1;
  if (exam && exam.questionIndex > 0 && countsForCurrentQuestion(context.timing)) {
    exam.currentQuestionTriggerCount += 1;
  }
  const config = state.artifactById.get(context.owner.artifactId);
  const before = captureLiveExamStatus(state, exam);
  const scoreBefore = captureLiveScoreStatus(state, exam);
  const effectText = describeTrigger(context.trigger);

  for (const effect of context.trigger.effects ?? []) {
    await applyEffect(effect, state, {
      owner: context.owner,
      exam,
      gainRandomArtifacts: async (count) => gainRandomArtifacts(state, count, hooks, options),
      offerDraft: async (choices, picks) => offerDraft(state, choices, picks, hooks, options),
      destroySelf: async () => loseOwnedArtifact(state, context.owner, hooks, options),
      destroyOther: async (select) => destroyOtherArtifact(state, context.owner, select, hooks, options),
      destroyAllOther: async () => destroyAllOtherArtifacts(state, context.owner, hooks, options),
      chooseOnesDigit: async (score, currentExam) =>
        hooks.chooseOnesDigit ? hooks.chooseOnesDigit(Math.round(score), currentExam.subject) : undefined,
      chooseDigitSwap: async (score, currentExam) =>
        hooks.chooseDigitSwap ? hooks.chooseDigitSwap(Math.round(score), currentExam.subject) : undefined
    });
  }

  let handlerTriggered = true;
  if (context.trigger.handler) {
    handlerTriggered = await applyTriggerHandler(state, context, exam, hooks, options);
  }
  if (!handlerTriggered) {
    state.currentEventCount -= 1;
    if (exam && exam.questionIndex > 0 && countsForCurrentQuestion(context.timing)) {
      exam.currentQuestionTriggerCount = Math.max(0, exam.currentQuestionTriggerCount - 1);
    }
    rollbackTriggerLimit(state, context, exam);
    return false;
  }

  const after = captureLiveExamStatus(state, exam);
  const scoreAfter = captureLiveScoreStatus(state, exam);
  const artifactNameText = config?.name ?? context.owner.artifactId;
  appendLog(
    state,
    `触发遗物: ${artifactNameText}${effectText ? ` -> ${effectText}` : ""}`
  );
  await hooks.onTrigger?.({
    artifactId: context.owner.artifactId,
    artifactName: artifactNameText,
    timing: context.timing,
    sourceTiming: context.sourceTrigger?.timing,
    triggerIndex: context.triggerIndex,
    slotIndex: state.artifacts.findIndex((item) => item.instanceId === context.owner.instanceId),
    effectText,
    replay: Boolean(context.replay),
    before,
    after,
    scoreBefore,
    scoreAfter,
    questionScoreGained: exam?.currentQuestionLog?.scoreGained
  });

  if (!context.replay && context.timing !== "OTHER_ARTIFACT_TRIGGERED") {
    await notifyOtherArtifactTriggered(state, context, exam, hooks, options);
  }
  return true;
}

function describeTrigger(trigger: ArtifactTriggerConfig): string {
  const effects = (trigger.effects ?? []).map(describeEffect).filter(Boolean);
  if (trigger.handler) {
    effects.push(`执行联动 ${trigger.handler}`);
  }
  return effects.join("；");
}

function describeEffect(effect: EffectConfig): string {
  switch (effect.op) {
    case "addStat":
      return `${statLabel(effect.stat)} ${formatSigned(effect.value)}`;
    case "setStatMin":
      return `${statLabel(effect.stat)}下限至少 ${effect.value}`;
    case "addQuestionAccuracy":
      return `本题正确率 ${formatSigned(effect.value)}`;
    case "addQuestionMultiplier":
      return `本题倍率 ${formatSigned(effect.value)}`;
    case "multiplyQuestionMultiplier":
      return `本题倍率 x${effect.value}`;
    case "multiplyQuestionMultiplierByStreak":
      return `按${effect.streak === "correct" ? "连对" : "连错"}倍率 x${effect.base}`;
    case "addQuestionBaseScore":
      return `本题基础分 ${formatSigned(effect.value)}`;
    case "addQuestionScore":
      return `本题额外分 ${formatSigned(effect.value)}`;
    case "addExamPostBonusByQuestionTriggerCount":
      return `按本题触发次数增加最终分，上限 ${effect.cap}`;
    case "convertAccuracyOverflowToQuestionMultiplier":
      return "超出 100% 正确率转为本题倍率";
    case "addExamMultiplier":
      return `考试倍率 ${formatSigned(effect.value)}`;
    case "multiplyExamMultiplier":
      return `考试倍率 x${effect.value}`;
    case "adjustCurrentTotalScore":
      return `当前总分 ${effect.mode === "add" ? formatSigned(effect.value) : `x${effect.value}`}`;
    case "addExamScore":
      return `本场分数 ${formatSigned(effect.value)}`;
    case "addExamPostBonus":
      return `最终得分 ${formatSigned(effect.value)}`;
    case "setExamScoreToFull":
      return "本场分数至少满分";
    case "addNextExamScore":
      return `下场考试分数 ${formatSigned(effect.value)}`;
    case "forceResult":
      return `强制${effect.result === "correct" ? "改对" : "改错"}`;
    case "queueQuestionModifier":
      return `后续 ${effect.duration} 题${effect.target === "accuracy" ? "正确率" : "倍率"} ${formatSigned(effect.value)}`;
    case "gainRandomArtifacts":
      return `随机获得 ${effect.count} 个遗物`;
    case "offerDraft":
      return `额外 ${effect.choices} 选 ${effect.picks}`;
    case "destroySelf":
      return "销毁自身";
    case "destroyOther":
      return "销毁其他遗物";
    case "destroyAllOtherAndMultiplyCurrentTotal":
      return `销毁其他遗物，每张当前总分 x${effect.factorPerDestroyed}`;
    case "maximizeOnesDigit":
      return "将个位改成最优数字";
    case "maximizeDigitSwap":
      return "交换分数数字以最大化分数";
    case "preventNextDiscard":
      return "免除一次丢弃";
    case "log":
      return effect.message;
  }
}

function countsForCurrentQuestion(timing: Timing): boolean {
  return timing.startsWith("QUESTION_") || timing === "OTHER_ARTIFACT_TRIGGERED";
}

function statLabel(stat: Extract<EffectConfig, { op: "addStat" }>["stat"] | "staminaFloor"): string {
  const labels: Record<string, string> = {
    baseAccuracy: "基础正确率",
    stamina: "体力",
    staminaDecay: "体力下降",
    staminaFloor: "体力下限",
    artifactLimit: "遗物上限",
    draftChoicesBonus: "抽取备选数",
    nextDraftChoicesBonus: "下次抽取备选数",
    questionMultiplierBase: "常驻本题倍率"
  };
  return labels[stat] ?? stat;
}

function formatSigned(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}

function captureLiveExamStatus(state: GameState, exam: ExamState | undefined): LiveExamStatus {
  return {
    accuracy: exam ? estimateCurrentAccuracy(state, exam) : state.stats.baseAccuracy,
    questionMultiplier: exam ? calculateQuestionMultiplier(state, exam) : state.stats.questionMultiplierBase,
    examMultiplier: exam ? calculateExamMultiplier(state, exam) : 1,
    baseStamina: state.stats.baseStamina,
    stamina: Math.round(state.stats.stamina * 100) / 100
  };
}

function captureLiveScoreStatus(state: GameState, exam: ExamState | undefined): LiveScoreStatus {
  const currentExamScore = Math.round((exam?.rawScore ?? 0) * 100) / 100;
  const examPostBonus = Math.round((exam?.examPostBonus ?? 0) * 100) / 100;
  const currentTotalAdjustment = Math.round(state.stats.currentTotalAdjustment * 100) / 100;
  const currentTotal = Math.round(
    state.exams.reduce((sum, examLog) => sum + examLog.score, 0) +
      currentExamScore +
      currentTotalAdjustment
  );
  return {
    currentTotal,
    currentExamScore,
    examPostBonus,
    currentTotalAdjustment
  };
}

function estimateCurrentAccuracy(state: GameState, exam: ExamState): number {
  if (exam.currentFinalAccuracy > 0) {
    return Math.round(exam.currentFinalAccuracy * 100) / 100;
  }
  const baseAccuracy = queryModifierValue(state, "baseAccuracy", state.stats.baseAccuracy, { exam });
  const rawAccuracy = queryModifierValue(
    state,
    "finalAccuracy",
    (baseAccuracy * state.stats.stamina) / 100 + exam.currentAccuracyBonus,
    { exam }
  );
  return Math.round(rawAccuracy * 100) / 100;
}

function consumeTriggerLimit(
  state: GameState,
  context: TriggerContext,
  exam: ExamState | undefined
): boolean {
  const limit = context.trigger.limit;
  if (!limit) {
    return true;
  }
  const scope = limit.scope === "exam" ? `exam:${exam?.index ?? "none"}` : "run";
  const key = `${scope}:${context.owner.instanceId}:${context.triggerIndex}`;
  const used = state.triggerCounts.get(key) ?? 0;
  if (used >= limit.count) {
    return false;
  }
  state.triggerCounts.set(key, used + 1);
  return true;
}

function rollbackTriggerLimit(
  state: GameState,
  context: TriggerContext,
  exam: ExamState | undefined
): void {
  const limit = context.trigger.limit;
  if (!limit) {
    return;
  }
  const scope = limit.scope === "exam" ? `exam:${exam?.index ?? "none"}` : "run";
  const key = `${scope}:${context.owner.instanceId}:${context.triggerIndex}`;
  const used = state.triggerCounts.get(key) ?? 0;
  if (used <= 1) {
    state.triggerCounts.delete(key);
    return;
  }
  state.triggerCounts.set(key, used - 1);
}

async function gainRandomArtifacts(
  state: GameState,
  count: number,
  hooks: ChoiceHooks,
  options: GameOptions
): Promise<void> {
  for (let i = 0; i < count; i += 1) {
    const choices = createDraftChoices(state, 1);
    if (choices[0]) {
      await gainArtifact(state, choices[0].id, hooks, options);
    }
  }
}

async function offerDraft(
  state: GameState,
  choices: number,
  picks: number,
  hooks: ChoiceHooks,
  options: GameOptions
): Promise<void> {
  for (let i = 0; i < picks; i += 1) {
    await draftArtifact(state, hooks, options, choices, "额外抽取");
  }
}

async function destroyOtherArtifact(
  state: GameState,
  owner: OwnedArtifact,
  select: "leftmost" | "rightmost" | "random",
  hooks: ChoiceHooks,
  options: GameOptions
): Promise<void> {
  const candidates = state.artifacts.filter((artifact) => artifact.instanceId !== owner.instanceId);
  if (candidates.length === 0) {
    return;
  }
  const target =
    select === "random"
      ? state.rng.pick(candidates)
      : select === "rightmost"
        ? candidates[candidates.length - 1]
        : candidates[0];
  await loseOwnedArtifact(state, target, hooks, options);
}

async function destroyAllOtherArtifacts(
  state: GameState,
  owner: OwnedArtifact,
  hooks: ChoiceHooks,
  options: GameOptions
): Promise<number> {
  const targets = state.artifacts.filter((artifact) => artifact.instanceId !== owner.instanceId);
  for (const target of targets) {
    await loseOwnedArtifact(state, target, hooks, options);
  }
  return targets.length;
}

async function notifyOtherArtifactTriggered(
  state: GameState,
  original: TriggerContext,
  exam: ExamState | undefined,
  hooks: ChoiceHooks,
  options: GameOptions
): Promise<void> {
  const listeners = [...state.artifacts].filter(
    (artifact) => artifact.instanceId !== original.owner.instanceId
  );
  for (const listener of listeners) {
    await triggerOwnedArtifact(
      state,
      listener,
      "OTHER_ARTIFACT_TRIGGERED",
      exam,
      hooks,
      options,
      undefined,
      original
    );
  }
}

async function applyTriggerHandler(
  state: GameState,
  context: TriggerContext,
  exam: ExamState | undefined,
  hooks: ChoiceHooks,
  options: GameOptions
): Promise<boolean> {
  if (context.trigger.handler === "mimicRight") {
    return mimicRightArtifact(state, context, exam, hooks, options);
  }
  if (context.trigger.handler === "repeatOtherTrigger") {
    return repeatSourceTrigger(state, context, exam, hooks, options);
  }
  if (context.trigger.handler === "triggerRightOnOtherTrigger") {
    return triggerRightOnOtherTrigger(state, context, exam, hooks, options);
  }
  if (context.trigger.handler === "luckyBlock") {
    return triggerLuckyBlock(state, context, exam);
  }
  return true;
}

async function mimicRightArtifact(
  state: GameState,
  context: TriggerContext,
  exam: ExamState | undefined,
  hooks: ChoiceHooks,
  options: GameOptions
): Promise<boolean> {
  const depth = context.mimicDepth ?? 0;
  if (depth >= 2) {
    return false;
  }
  const index = state.artifacts.findIndex((item) => item.instanceId === context.owner.instanceId);
  const right = state.artifacts[index + 1];
  if (!right) {
    return false;
  }
  const config = state.artifactById.get(right.artifactId);
  const triggers = config?.triggers
    .map((trigger, triggerIndex) => ({ trigger, triggerIndex }))
    .filter((item) => item.trigger.timing === context.timing && canReplayTrigger(item.trigger));
  if (!triggers || triggers.length === 0) {
    return false;
  }
  let triggered = false;
  for (const item of triggers ?? []) {
    triggered = (await executeTrigger(
      state,
      {
        timing: context.timing,
        owner: right,
        triggerIndex: item.triggerIndex,
        trigger: item.trigger,
        replay: true,
        mimicDepth: depth + 1
      },
      exam,
      hooks,
      options
    )) || triggered;
  }
  return triggered;
}

async function repeatSourceTrigger(
  state: GameState,
  context: TriggerContext,
  exam: ExamState | undefined,
  hooks: ChoiceHooks,
  options: GameOptions
): Promise<boolean> {
  const source = context.sourceTrigger;
  if (!source || source.replay) {
    return false;
  }
  if (!canReplayTrigger(source.trigger)) {
    return false;
  }
  const chance = Number(context.trigger.params?.chance ?? 0);
  const times = Number(context.trigger.params?.times ?? 1);
  const bonusTimes = hasArtifact(state, "electric_gatling_pea") && context.owner.artifactId === "gatling_peashooter"
    ? times
    : 0;
  if (state.rng.next() >= chance) {
    return false;
  }
  for (let i = 0; i < times + bonusTimes; i += 1) {
    await executeTrigger(
      state,
      { ...source, replay: true },
      exam,
      hooks,
      options
    );
  }
  return true;
}

function hasArtifact(state: GameState, artifactId: string): boolean {
  return state.artifacts.some((artifact) => artifact.artifactId === artifactId);
}

async function triggerRightOnOtherTrigger(
  state: GameState,
  context: TriggerContext,
  exam: ExamState | undefined,
  hooks: ChoiceHooks,
  options: GameOptions
): Promise<boolean> {
  const source = context.sourceTrigger;
  if (!source || state.rng.next() >= Number(context.trigger.params?.chance ?? 0)) {
    return false;
  }
  const index = state.artifacts.findIndex((item) => item.instanceId === context.owner.instanceId);
  const right = state.artifacts[index + 1];
  const config = right ? state.artifactById.get(right.artifactId) : undefined;
  const trigger = config?.triggers
    .map((item, triggerIndex) => ({ item, triggerIndex }))
    .find((item) => item.item.timing === source.timing && canReplayTrigger(item.item));
  if (!right || !trigger) {
    return false;
  }
  return executeTrigger(
    state,
    {
      timing: source.timing,
      owner: right,
      triggerIndex: trigger.triggerIndex,
      trigger: trigger.item,
      replay: true
    },
    exam,
    hooks,
    options
  );
}

function canReplayTrigger(trigger: ArtifactTriggerConfig): boolean {
  return !(trigger.effects ?? []).some((effect) => NON_REPLAYABLE_SCORE_EFFECTS.has(effect.op));
}

function triggerLuckyBlock(
  state: GameState,
  context: TriggerContext,
  exam: ExamState | undefined
): boolean {
  if (!exam) {
    return false;
  }
  const baseChance = Number(context.trigger.params?.chance ?? 0.002);
  const baseValue = Number(context.trigger.params?.value ?? 1000);
  const chance = queryModifierValue(state, "luckyBlockChance", baseChance, { exam });
  if (state.rng.next() >= chance) {
    return false;
  }
  const value = queryModifierValue(
    state,
    "luckyBlockValue",
    baseValue * state.stats.luckyBlockValueMultiplier,
    { exam }
  );
  exam.examPostBonus += value;
  state.stats.luckyBlockValueMultiplier *= 2;
  appendLog(state, `幸运方块触发: 最终得分增加 +${value}，下次效果 x2`);
  return true;
}

async function runExam(
  state: GameState,
  subject: SubjectId,
  index: number,
  hooks: ChoiceHooks,
  options: GameOptions
): Promise<void> {
  const staminaFloor = queryModifierValue(state, "staminaFloor", state.stats.staminaFloor);
  state.stats.stamina = Math.max(staminaFloor, state.stats.baseStamina);
  const exam = createExamState(state, subject, index);
  appendLog(state, `开始考试: ${SUBJECT_LABELS[subject]}`);
  hooks.onExamStart?.({ index, subject, startingScore: exam.rawScore, status: captureLiveExamStatus(state, exam) });
  await triggerEvent(state, "EXAM_START", exam, hooks, options);

  for (let questionIndex = 1; questionIndex <= exam.questionCount; questionIndex += 1) {
    await runQuestion(state, exam, questionIndex, hooks, options);
  }

  await triggerEvent(state, "EXAM_END", exam, hooks, options);
  const rawScore = Math.round(exam.rawScore * 100) / 100;
  const examMultiplier = calculateExamMultiplier(state, exam);
  const examPostBonus = Math.round(exam.examPostBonus * 100) / 100;
  const score = Math.round(rawScore * examMultiplier + examPostBonus);
  const examLog = {
    subject,
    rawScore,
    examMultiplier,
    examPostBonus,
    score,
    correctCount: exam.correctCount,
    wrongCount: exam.wrongCount,
    questions: exam.questionLogs
  };
  state.exams.push(examLog);
  await hooks.onExamEnd?.(examLog);
  appendLog(state, `结束考试: ${SUBJECT_LABELS[subject]} ${score} 分`);
}

function createExamState(state: GameState, subject: SubjectId, index: number): ExamState {
  const rule = SUBJECT_EXAM_RULES[subject];
  const exam: ExamState = {
    index,
    subject,
    questionCount: rule.questionCount,
    pointsPerQuestion: rule.pointsPerQuestion,
    fullScore: rule.fullScore,
    questionIndex: 0,
    rawScore: state.stats.pendingNextExamScore,
    examMultiplier: 1,
    correctCount: 0,
    wrongCount: 0,
    correctStreak: 0,
    wrongStreak: 0,
    previousWrongStreak: 0,
    currentAccuracyBonus: 0,
    currentFinalAccuracy: 0,
    currentQuestionMultiplier: 1,
    questionMultiplierAdds: [],
    questionMultiplierMuls: [],
    currentQuestionBaseScore: 0,
    currentQuestionFlatScore: 0,
    currentQuestionTriggerCount: 0,
    examMultiplierAdds: [],
    examMultiplierMuls: [],
    examPostBonus: 0,
    questionLogs: [],
    questionModifiers: state.nextExamQuestionModifiers
  };
  state.stats.pendingNextExamScore = 0;
  state.nextExamQuestionModifiers = [];
  return exam;
}

function applyQueuedQuestionModifiers(exam: ExamState): void {
  for (const modifier of exam.questionModifiers) {
    if (modifier.target === "accuracy") {
      exam.currentAccuracyBonus += modifier.value;
    } else if (modifier.mode === "multiply") {
      exam.questionMultiplierMuls.push(modifier.value);
    } else {
      exam.questionMultiplierAdds.push(modifier.value);
    }
    modifier.remaining -= 1;
  }
  exam.questionModifiers = exam.questionModifiers.filter((modifier) => modifier.remaining > 0);
}

async function runQuestion(
  state: GameState,
  exam: ExamState,
  questionIndex: number,
  hooks: ChoiceHooks,
  options: GameOptions
): Promise<void> {
  exam.questionIndex = questionIndex;
  exam.previousWrongStreak = exam.wrongStreak;
  exam.currentAccuracyBonus = 0;
  exam.currentQuestionMultiplier = 1;
  exam.questionMultiplierAdds = [];
  exam.questionMultiplierMuls = [];
  exam.currentQuestionBaseScore = 0;
  exam.currentQuestionFlatScore = 0;
  exam.currentQuestionTriggerCount = 0;
  exam.forcedResult = undefined;
  exam.currentResult = undefined;
  await hooks.beforeQuestion?.({
    index: exam.index,
    subject: exam.subject,
    questionIndex,
    status: captureLiveExamStatus(state, exam)
  });
  applyQueuedQuestionModifiers(exam);

  await triggerEvent(state, "QUESTION_BEFORE_ROLL", exam, hooks, options);
  const baseAccuracy = queryModifierValue(state, "baseAccuracy", state.stats.baseAccuracy, { exam });
  const rawAccuracy = queryModifierValue(
    state,
    "finalAccuracy",
    (baseAccuracy * state.stats.stamina) / 100 + exam.currentAccuracyBonus,
    { exam }
  );
  exam.currentFinalAccuracy = rawAccuracy;
  const accuracy = clamp(rawAccuracy, 0, 100);
  const roll = state.rng.next() * 100;
  exam.currentResult = roll < accuracy ? "correct" : "wrong";

  await finishQuestionAfterRoll(state, exam, accuracy, roll, hooks, options);
}

async function finishQuestionAfterRoll(
  state: GameState,
  exam: ExamState,
  accuracy: number,
  roll: number,
  hooks: ChoiceHooks,
  options: GameOptions
): Promise<void> {
  await triggerEvent(state, "QUESTION_AFTER_ROLL", exam, hooks, options);
  const correct = exam.currentResult === "correct";
  if (correct) {
    exam.correctCount += 1;
    exam.correctStreak += 1;
    exam.wrongStreak = 0;
  } else {
    exam.wrongCount += 1;
    exam.wrongStreak += 1;
    exam.correctStreak = 0;
  }
  await scoreQuestion(state, exam, accuracy, roll, correct, hooks, options);
}

async function scoreQuestion(
  state: GameState,
  exam: ExamState,
  accuracy: number,
  roll: number,
  correct: boolean,
  hooks: ChoiceHooks,
  options: GameOptions
): Promise<void> {
  await triggerEvent(state, "QUESTION_SCORE", exam, hooks, options);
  const multiplier = calculateQuestionMultiplier(state, exam);
  const questionBaseScore = (correct ? exam.pointsPerQuestion : 0) + exam.currentQuestionBaseScore;
  const questionFlatScore = exam.currentQuestionFlatScore;
  const scoreGained =
    questionBaseScore * multiplier +
    questionFlatScore;
  exam.rawScore += scoreGained;
  const staminaBefore = state.stats.stamina;

  const questionLog = {
    subject: exam.subject,
    questionIndex: exam.questionIndex,
    staminaBefore,
    staminaAfter: staminaBefore,
    accuracy: Math.round(accuracy * 100) / 100,
    roll: Math.round(roll * 100) / 100,
    correct,
    questionBaseScore: Math.round(questionBaseScore * 100) / 100,
    questionMultiplier: Math.round(multiplier * 100) / 100,
    questionFlatScore: Math.round(questionFlatScore * 100) / 100,
    scoreGained: Math.round(scoreGained * 100) / 100
  };
  exam.currentQuestionLog = questionLog;
  exam.questionLogs.push(questionLog);

  const staminaFloor = queryModifierValue(state, "staminaFloor", state.stats.staminaFloor, { exam });
  const staminaDecay = queryModifierValue(state, "staminaDecay", state.stats.staminaDecay, { exam });
  state.stats.stamina = Math.max(staminaFloor, state.stats.stamina - staminaDecay);
  await triggerEvent(state, "QUESTION_END", exam, hooks, options);
  questionLog.staminaAfter = Math.round(state.stats.stamina * 100) / 100;
  appendLog(state, describeQuestionState(exam, questionLog, multiplier));
  await hooks.onQuestion?.(questionLog, {
    index: exam.index,
    subject: exam.subject,
    rawScore: Math.round(exam.rawScore * 100) / 100,
    examPostBonus: Math.round(exam.examPostBonus * 100) / 100,
    currentTotalAdjustment: Math.round(state.stats.currentTotalAdjustment * 100) / 100,
    currentTotalScore: captureLiveScoreStatus(state, exam).currentTotal,
    status: captureLiveExamStatus(state, exam)
  });
  exam.lastResult = exam.currentResult;
}

function describeQuestionState(
  exam: ExamState,
  question: ExamLog["questions"][number],
  multiplier: number
): string {
  return (
    `${SUBJECT_LABELS[exam.subject]} Q${question.questionIndex}: ${question.correct ? "正确" : "错误"} | ` +
    `正确率 ${question.accuracy}% | 掷骰 ${question.roll} | ` +
    `体力 ${question.staminaBefore}->${question.staminaAfter} | ` +
    `本题倍率 x${Math.round(multiplier * 100) / 100} | ` +
    `本题得分 ${question.scoreGained} | 本场累计 ${Math.round(exam.rawScore)} | ` +
    `连对 ${exam.correctStreak} / 连错 ${exam.wrongStreak}`
  );
}

function calculateQuestionMultiplier(state: GameState, exam: ExamState): number {
  const base = queryModifierValue(state, "questionMultiplier", state.stats.questionMultiplierBase, {
    exam
  });
  const added = base + exam.questionMultiplierAdds.reduce((sum, value) => sum + value, 0);
  const multiplied = exam.questionMultiplierMuls.reduce((value, factor) => value * factor, added);
  return Math.max(0, Math.round(multiplied * 10000) / 10000);
}

function calculateExamMultiplier(state: GameState, exam: ExamState): number {
  const base = queryModifierValue(state, "examMultiplier", exam.examMultiplier, { exam });
  const added = base + exam.examMultiplierAdds.reduce((sum, value) => sum + value, 0);
  const multiplied = exam.examMultiplierMuls.reduce((value, factor) => value * factor, added);
  return Math.max(0, Math.round(multiplied * 10000) / 10000);
}
