import type { EffectConfig, ExamState, OwnedArtifact } from "./types.js";
import { appendLog, type GameState } from "./state.js";

export interface EffectRuntime {
  owner: OwnedArtifact;
  exam?: ExamState;
  gainRandomArtifacts: (count: number) => Promise<void>;
  offerDraft: (choices: number, picks: number) => Promise<void>;
  destroySelf: () => Promise<void>;
  destroyOther: (select: "leftmost" | "rightmost" | "random") => Promise<void>;
  destroyAllOther: () => Promise<number>;
  chooseOnesDigit: (score: number, exam: ExamState) => Promise<number | undefined>;
  chooseDigitSwap: (score: number, exam: ExamState) => Promise<[number, number] | undefined>;
}

export async function applyEffect(
  effect: EffectConfig,
  state: GameState,
  runtime: EffectRuntime
): Promise<void> {
  const exam = runtime.exam;
  switch (effect.op) {
    case "addStat":
      applyStatAdd(effect.stat, effect.value, state);
      return;
    case "setStatMin":
      state.stats[effect.stat] = Math.max(state.stats[effect.stat], effect.value);
      return;
    case "addQuestionAccuracy":
      requireExam(effect.op, exam).currentAccuracyBonus += effect.value;
      return;
    case "addQuestionMultiplier":
      requireExam(effect.op, exam).questionMultiplierAdds.push(effect.value);
      return;
    case "multiplyQuestionMultiplier":
      requireExam(effect.op, exam).questionMultiplierMuls.push(effect.value);
      return;
    case "multiplyQuestionMultiplierByStreak":
      multiplyQuestionMultiplierByStreak(effect, requireExam(effect.op, exam));
      return;
    case "addQuestionBaseScore":
      requireExam(effect.op, exam).currentQuestionBaseScore += effect.value;
      return;
    case "addQuestionScore":
      requireExam(effect.op, exam).currentQuestionFlatScore += effect.value;
      return;
    case "addExamPostBonusByQuestionTriggerCount": {
      const currentExam = requireExam(effect.op, exam);
      const bonus = Math.min(effect.cap, Math.pow(effect.base, currentExam.currentQuestionTriggerCount));
      currentExam.examPostBonus += bonus;
      return;
    }
    case "convertAccuracyOverflowToQuestionMultiplier": {
      const currentExam = requireExam(effect.op, exam);
      currentExam.questionMultiplierAdds.push(Math.max(0, currentExam.currentFinalAccuracy - 100) / 100);
      return;
    }
    case "addExamMultiplier":
      requireExam(effect.op, exam).examMultiplierAdds.push(effect.value);
      return;
    case "multiplyExamMultiplier":
      requireExam(effect.op, exam).examMultiplierMuls.push(effect.value);
      return;
    case "adjustCurrentTotalScore":
      adjustCurrentTotalScore(state, exam, effect.mode, effect.value);
      return;
    case "addExamScore":
      requireExam(effect.op, exam).rawScore += effect.value;
      return;
    case "addExamPostBonus":
      requireExam(effect.op, exam).examPostBonus += effect.value;
      return;
    case "setExamScoreToFull": {
      const currentExam = requireExam(effect.op, exam);
      currentExam.rawScore = Math.max(currentExam.rawScore, currentExam.fullScore);
      return;
    }
    case "addNextExamScore":
      state.stats.pendingNextExamScore += effect.value;
      return;
    case "forceResult":
      requireExam(effect.op, exam).forcedResult = effect.result;
      requireExam(effect.op, exam).currentResult = effect.result;
      return;
    case "queueQuestionModifier":
      if (effect.scope === "nextExam") {
        state.nextExamQuestionModifiers.push({
          target: effect.target,
          value: effect.value,
          mode: effect.mode ?? "add",
          remaining: effect.duration,
          source: runtime.owner.artifactId
        });
        return;
      }
      requireExam(effect.op, exam).questionModifiers.push({
        target: effect.target,
        value: effect.value,
        mode: effect.mode ?? "add",
        remaining: effect.duration,
        source: runtime.owner.artifactId
      });
      return;
    case "gainRandomArtifacts":
      await runtime.gainRandomArtifacts(effect.count);
      return;
    case "offerDraft":
      await runtime.offerDraft(effect.choices, effect.picks);
      return;
    case "destroySelf":
      await runtime.destroySelf();
      return;
    case "destroyOther":
      await runtime.destroyOther(effect.select);
      return;
    case "destroyAllOtherAndMultiplyCurrentTotal": {
      const destroyed = await runtime.destroyAllOther();
      for (let i = 0; i < destroyed; i += 1) {
        adjustCurrentTotalScore(state, exam, "multiply", effect.factorPerDestroyed);
      }
      return;
    }
    case "maximizeOnesDigit": {
      const currentExam = requireExam(effect.op, exam);
      const digit = await runtime.chooseOnesDigit(currentExam.rawScore, currentExam);
      setOnesDigit(currentExam, digit);
      return;
    }
    case "maximizeDigitSwap": {
      const currentExam = requireExam(effect.op, exam);
      const swap = await runtime.chooseDigitSwap(currentExam.rawScore, currentExam);
      applyDigitSwap(currentExam, swap);
      return;
    }
    case "preventNextDiscard":
      state.stats.preventDiscardCharges += 1;
      return;
    case "log":
      appendLog(state, effect.message);
      return;
  }
}

function applyStatAdd(
  stat: Extract<EffectConfig, { op: "addStat" }>["stat"],
  value: number,
  state: GameState
): void {
  state.stats[stat] += value;
  if (stat === "stamina" && state.stats.stamina < state.stats.staminaFloor) {
    state.stats.stamina = state.stats.staminaFloor;
  }
}

function multiplyQuestionMultiplierByStreak(
  effect: Extract<EffectConfig, { op: "multiplyQuestionMultiplierByStreak" }>,
  exam: ExamState
): void {
  const streak = effect.streak === "correct" ? exam.correctStreak : exam.wrongStreak;
  const value = effect.usePrevious ? exam.previousWrongStreak : streak;
  if (value > 0) {
    exam.questionMultiplierMuls.push(Math.pow(effect.base, value));
  }
}

function requireExam(op: string, exam?: ExamState): ExamState {
  if (!exam) {
    throw new Error(`Effect ${op} requires an exam context.`);
  }
  return exam;
}

function adjustCurrentTotalScore(
  state: GameState,
  exam: ExamState | undefined,
  mode: "add" | "multiply",
  value: number
): void {
  if (mode === "add") {
    state.stats.currentTotalAdjustment += value;
    return;
  }
  const currentTotal = calculateCurrentTotalScore(state, exam);
  state.stats.currentTotalAdjustment += currentTotal * (value - 1);
}

function calculateCurrentTotalScore(state: GameState, exam?: ExamState): number {
  return (
    state.exams.reduce((sum, examLog) => sum + examLog.score, 0) +
    (exam?.rawScore ?? 0) +
    state.stats.currentTotalAdjustment
  );
}

function setOnesDigit(exam: ExamState, requestedDigit?: number): void {
  const score = Math.round(exam.rawScore);
  const digit =
    typeof requestedDigit === "number" && Number.isInteger(requestedDigit)
      ? Math.min(9, Math.max(0, requestedDigit))
      : 9;
  exam.rawScore = score - (Math.abs(score) % 10) + digit;
}

function applyDigitSwap(exam: ExamState, requestedSwap?: [number, number]): void {
  const score = Math.round(exam.rawScore);
  const sign = score < 0 ? -1 : 1;
  const chars = Math.abs(score).toString().split("");
  if (requestedSwap) {
    const [left, right] = requestedSwap;
    if (left >= 0 && right >= 0 && left < chars.length && right < chars.length && left !== right) {
      [chars[left], chars[right]] = [chars[right], chars[left]];
      exam.rawScore = sign * Number(chars.join(""));
    }
    return;
  }
  let best = Math.abs(score);
  for (let i = 0; i < chars.length; i += 1) {
    for (let j = i + 1; j < chars.length; j += 1) {
      const copy = [...chars];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      best = Math.max(best, Number(copy.join("")));
    }
  }
  exam.rawScore = sign * best;
}
