import QRCode from "qrcode";
import { toPng } from "html-to-image";
import { LOCAL_ARTIFACTS } from "./artifacts.generated.js";
import {
  DEFAULT_ELECTIVE_SUBJECTS,
  ELECTIVE_SUBJECTS,
  REQUIRED_SUBJECTS,
  runGame,
  SUBJECT_EXAM_RULES,
  SUBJECT_LABELS,
  type ArtifactConfig,
  type ChoiceHooks,
  type ExamLog,
  type LiveExamStatus,
  type QuestionLog,
  type RunResult,
  type SubjectId,
  type TriggerEvent
} from "./core/browser.js";

const root = requireElement("root");
const DEBUG_ROUTE = isDebugRoute();
const RESULT_DEBUG_ROUTE = isResultDebugRoute();
const SPEED_MULTIPLIERS = [1, 2, 4, 8] as const satisfies readonly SpeedMultiplier[];
const DEFAULT_SPEED_MULTIPLIER: SpeedMultiplier = 2;
const BASE_SPEED_MS = 920;

type Phase = "start" | "loading" | "draft" | "exam" | "result";
type EventTone = "score" | "term" | "chain" | "fail" | "idle";
type EffectIntensity = "low" | "medium" | "high" | "jackpot";
type SpeedMultiplier = 1 | 2 | 4 | 8;
type VisualEventKind =
  | "score:add"
  | "score:bank"
  | "score:fail"
  | "multiplier:increase"
  | "chain:step"
  | "jackpot:trigger";

interface ChoicePrompt {
  reason: string;
  choices: ArtifactConfig[];
  discard: boolean;
  sequence: number;
  resolve: (index: number) => void;
}

interface ScoreChoicePrompt {
  mode: "onesDigit" | "digitSwap";
  subject: SubjectId;
  score: number;
  options: ScoreChoiceOption[];
  selectedPosition?: number;
  resolve: (value: number | [number, number] | undefined) => void;
}

interface ScoreChoiceOption {
  label: string;
  value: number | [number, number] | undefined;
  preview: number;
  delta: number;
}

interface VisualEvent {
  id: string;
  label: string;
  tone: EventTone;
  kind: VisualEventKind;
  intensity: EffectIntensity;
  artifactId?: string;
  effectText?: string;
  detailText?: string;
  deltas?: StatDelta[];
  scoreDelta?: number;
  scoreBefore?: number;
  scoreAfter?: number;
  examScoreBefore?: number;
  examScoreAfter?: number;
  scoreBanking?: boolean;
  slotIndex?: number;
  replay?: boolean;
  chainIndex?: number;
  settling?: boolean;
}

interface SharedReport {
  playerName: string;
  seed: string;
  score: number;
  year: number;
  threshold: number;
  title: string;
  subjects: Array<{ label: string; score: string; scoreValue?: number }>;
  artifacts: string[];
}

interface StatDelta {
  key: keyof LiveExamStatus;
  label: string;
  value: number;
  before: number;
  after: number;
}

interface UiState {
  runId: number;
  phase: Phase;
  seed: string;
  playerName: string;
  subjects: SubjectId[];
  artifacts: ArtifactConfig[];
  exams: ExamLog[];
  examQuestions: QuestionLog[];
  logs: string[];
  visualEvents: VisualEvent[];
  triggerQueue: VisualEvent[];
  activeTrigger?: VisualEvent;
  examSettlement?: ExamLog;
  liveStatus: LiveExamStatus;
  chainCount: number;
  scoreFlash?: VisualEvent;
  scoreAdjustment: number;
  draftSequence: number;
  choicePrompt?: ChoicePrompt;
  activeExam?: { index: number; subject: SubjectId; questionIndex: number; score: number };
  currentQuestion?: QuestionLog;
  settlementContinue?: () => void;
  result?: RunResult;
  sharedReport?: SharedReport;
  scoreChoicePrompt?: ScoreChoicePrompt;
  endlessActive: boolean;
  endlessYear: number;
  scoreThreshold: number;
  autoPlay: boolean;
  speedMultiplier: SpeedMultiplier;
  speedMs: number;
  skipToSettlement: boolean;
  debugArtifactIds: string[];
  debugSearchInput: string;
  debugSearch: string;
  footerNotice?: string;
  copyToast?: string;
}

const RESULT_DEBUG_RUN = RESULT_DEBUG_ROUTE ? createResultDebugRun() : undefined;
const RESULT_DEBUG_ARTIFACTS = RESULT_DEBUG_RUN ? artifactsForResult(RESULT_DEBUG_RUN) : [];

const state: UiState = {
  runId: 0,
  phase: RESULT_DEBUG_RUN ? "result" : "start",
  seed: RESULT_DEBUG_RUN?.seed ?? defaultSeed(),
  playerName: RESULT_DEBUG_RUN ? "结算页调试" : readPlayerName(),
  subjects: RESULT_DEBUG_RUN?.subjects ?? [...DEFAULT_ELECTIVE_SUBJECTS],
  artifacts: RESULT_DEBUG_ARTIFACTS,
  exams: RESULT_DEBUG_RUN?.exams ?? [],
  examQuestions: [],
  logs: RESULT_DEBUG_RUN?.log ?? [],
  visualEvents: [],
  triggerQueue: [],
  liveStatus: {
    accuracy: 50,
    questionMultiplier: 1,
    examMultiplier: 1,
    baseStamina: 100,
    stamina: 100
  },
  chainCount: 0,
  scoreAdjustment: 0,
  draftSequence: 0,
  result: RESULT_DEBUG_RUN,
  sharedReport: RESULT_DEBUG_ROUTE ? undefined : readSharedReport(),
  endlessActive: Boolean(RESULT_DEBUG_RUN),
  endlessYear: RESULT_DEBUG_RUN?.year ?? 1,
  scoreThreshold: RESULT_DEBUG_RUN?.threshold ?? 750,
  autoPlay: true,
  speedMultiplier: DEFAULT_SPEED_MULTIPLIER,
  speedMs: speedDelayMs(DEFAULT_SPEED_MULTIPLIER),
  skipToSettlement: false,
  debugArtifactIds: DEBUG_ROUTE ? readDebugArtifactIds() : [],
  debugSearchInput: "",
  debugSearch: ""
};

let playbackDelayResolvers: Array<() => void> = [];

root.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  const choice = target.closest<HTMLElement>("[data-choice]")?.dataset.choice;
  const scoreChoice = target.closest<HTMLElement>("[data-score-choice]")?.dataset.scoreChoice;
  const scorePosition = target.closest<HTMLElement>("[data-score-position]")?.dataset.scorePosition;
  const action = target.closest<HTMLElement>("[data-action]")?.dataset.action;
  const subject = target.closest<HTMLElement>("[data-subject]")?.dataset.subject as
    | SubjectId
    | undefined;

  if (choice !== undefined) {
    state.choicePrompt?.resolve(Number(choice));
    return;
  }
  if (scoreChoice !== undefined) {
    resolveScoreChoice(Number(scoreChoice));
    return;
  }
  if (scorePosition !== undefined) {
    resolveScorePosition(Number(scorePosition));
    return;
  }
  if (action === "skip-draft") {
    state.choicePrompt?.resolve(-1);
    return;
  }
  if (action === "skip-score-swap") {
    skipScoreSwap();
    return;
  }
  if (action === "reset-score-swap") {
    resetScoreSwap();
    return;
  }
  if (subject) {
    toggleSubject(subject);
    return;
  }
  if (action === "start-run") {
    if (state.subjects.length !== 3) return;
    void restartRun(false);
    return;
  }
  if (action === "continue-endless") {
    void continueEndlessRun();
    return;
  }
  if (action === "copy-share-link") {
    void copyShareLink();
    return;
  }
  if (action === "download-share-image") {
    void downloadShareImage();
    return;
  }
  if (action === "add-debug-artifact") {
    const id = target.closest<HTMLElement>("[data-artifact-id]")?.dataset.artifactId;
    if (id) addDebugArtifact(id);
    return;
  }
  if (action === "remove-debug-artifact") {
    const index = Number(target.closest<HTMLElement>("[data-debug-index]")?.dataset.debugIndex);
    removeDebugArtifact(index);
    return;
  }
  if (action === "clear-debug-build") {
    state.debugArtifactIds = [];
    persistDebugState();
    render();
    return;
  }
  if (action === "restart") {
    resetToStart(true);
    return;
  }
  if (action === "reset-result-debug") {
    resetResultDebug();
    return;
  }
  if (action === "toggle-auto") {
    state.autoPlay = !state.autoPlay;
    wakePlaybackDelays();
    render();
    return;
  }
  if (action === "cycle-speed") {
    cycleSpeedMultiplier();
    return;
  }
  if (action === "skip-to-settlement") {
    if (state.phase === "exam" && state.activeExam && !state.examSettlement) {
      state.skipToSettlement = true;
      state.autoPlay = true;
      state.speedMs = 0;
      wakePlaybackDelays();
      render();
    }
    return;
  }
  if (action === "continue-settlement") {
    state.settlementContinue?.();
    return;
  }
});

root.addEventListener("input", (event) => {
  const input = event.target as HTMLInputElement;
  if (input.dataset.field === "player-name") {
    state.playerName = input.value;
    try {
      window.localStorage.setItem("gaokao-player-name", state.playerName);
    } catch {
      // localStorage may be unavailable in private or restricted contexts.
    }
    return;
  }
  if (input.dataset.field === "debug-search") {
    state.debugSearchInput = input.value;
  }
});

root.addEventListener("keydown", (event) => {
  const input = event.target as HTMLInputElement;
  if (input.dataset.field !== "debug-search" || event.key !== "Enter") return;
  event.preventDefault();
  state.debugSearchInput = input.value;
  state.debugSearch = input.value;
  render();
  requestAnimationFrame(() => {
    const searchInput = root.querySelector<HTMLInputElement>('[data-field="debug-search"]');
    searchInput?.focus();
    searchInput?.setSelectionRange(searchInput.value.length, searchInput.value.length);
  });
});

window.addEventListener("resize", syncColumnHeights);

render();

function render(): void {
  const intensity = state.activeTrigger?.intensity ?? state.scoreFlash?.intensity ?? "low";
  const activeKind = state.activeTrigger?.kind ?? state.scoreFlash?.kind ?? "chain:step";
  const pausedClass = state.phase === "exam" && !state.autoPlay ? "playback-paused" : "";
  root.innerHTML = `
    <div class="app-shell fx-${intensity} kind-${cssSafeKind(activeKind)} ${state.activeTrigger ? "chain-live" : ""} ${pausedClass}">
      <main class="paper-field">${renderPhase()}</main>
      ${renderScoreChoicePrompt()}
      ${renderCopyToast()}
      ${renderFooter()}
    </div>
  `;
  syncColumnHeights();
  void hydrateShareQRCodes();
}

function syncColumnHeights(): void {
  window.requestAnimationFrame(() => {
    const examGrid = root.querySelector<HTMLElement>(".compact-exam-grid");
    const examLeftColumn = root.querySelector<HTMLElement>(".compact-exam-grid .exam-stage");
    if (examGrid && examLeftColumn) {
      examGrid.style.setProperty("--left-column-height", `${Math.ceil(examLeftColumn.getBoundingClientRect().height)}px`);
    }

    const startGrid = root.querySelector<HTMLElement>(".start-layout-debug");
    const startLeftColumn = root.querySelector<HTMLElement>(".start-layout-debug .start-panel");
    if (startGrid && startLeftColumn) {
      startGrid.style.setProperty("--start-left-column-height", `${Math.ceil(startLeftColumn.getBoundingClientRect().height)}px`);
    }
  });
}

function requireElement(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing #${id}`);
  }
  return element;
}

function renderPhase(): string {
  if (state.sharedReport && state.phase === "start") return renderSharedReport(state.sharedReport);
  if (state.phase === "start") return renderStart();
  if (state.phase === "draft" && state.choicePrompt) return renderDraft(state.choicePrompt);
  if (state.phase === "exam" && state.activeExam) return renderExam();
  if (state.phase === "result" && state.result) return renderResult(state.result);
  return renderLoading();
}

function renderCopyToast(): string {
  if (!state.copyToast) return "";
  return `
    <div class="copy-toast" role="status" aria-live="polite">
      <strong>${escapeHtml(state.copyToast)}</strong>
    </div>
  `;
}

async function hydrateShareQRCodes(): Promise<void> {
  const link = state.result ? buildShareUrl(state.result) : window.location.href;
  await hydrateShareQRCodesIn(root, link);
}

async function hydrateShareQRCodesIn(container: ParentNode, link: string): Promise<void> {
  const images = [...container.querySelectorAll<HTMLImageElement>("[data-share-qr]")];
  if (images.length === 0) return;
  const dataUrl = await QRCode.toDataURL(link, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 120,
    color: {
      dark: "#111827",
      light: "#ffffff"
    }
  });
  images.forEach((image) => {
    image.src = dataUrl;
  });
}

function renderScoreChoicePrompt(): string {
  const prompt = state.scoreChoicePrompt;
  if (!prompt) return "";
  const title = prompt.mode === "onesDigit" ? "更改个位分数" : "交换分数数字";
  const subtitle = prompt.mode === "onesDigit"
    ? "选择一个个位数字后继续结算。"
    : "选择两个分数位数，或跳过本次交换。";
  return `
    <section class="score-choice-backdrop" role="dialog" aria-modal="true" aria-label="${title}">
      <div class="score-choice-panel">
        <div class="score-choice-head">
          <p class="mono-label">SCORE CORRECTION</p>
          <h2>${title}</h2>
          <span>${SUBJECT_LABELS[prompt.subject]} 原始分 ${formatNumber(prompt.score)}</span>
        </div>
        <p>${subtitle}</p>
        ${
          prompt.mode === "onesDigit"
            ? `<div class="score-choice-grid">${prompt.options.map((option, index) => renderScoreChoiceOption(option, index)).join("")}</div>`
            : renderDigitSwapPicker(prompt)
        }
      </div>
    </section>
  `;
}

function renderScoreChoiceOption(option: ScoreChoiceOption, index: number): string {
  const better = option.delta > 0.0001;
  const worse = option.delta < -0.0001;
  return `
    <button class="score-choice-option ${better ? "better" : worse ? "worse" : "same"}" type="button" data-score-choice="${index}">
      <span>${escapeHtml(option.label)}</span>
      <strong>${formatNumber(option.preview)}</strong>
      <small>${formatDelta(option.delta)}</small>
    </button>
  `;
}

function renderDigitSwapPicker(prompt: ScoreChoicePrompt): string {
  const digits = scoreDigits(prompt.score);
  return `
    <div class="score-swap-picker">
      <div class="score-swap-number" aria-label="当前分数数字">
        ${digits.map((digit, index) => renderScorePositionButton(prompt, digit, index, digits.length)).join("")}
      </div>
      <div class="score-choice-actions">
        ${
          prompt.selectedPosition !== undefined
            ? `<button class="secondary-button" type="button" data-action="reset-score-swap">重选第一位</button>`
            : ""
        }
        <button class="secondary-button" type="button" data-action="skip-score-swap">跳过交换</button>
      </div>
    </div>
  `;
}

function renderScorePositionButton(
  prompt: ScoreChoicePrompt,
  digit: string,
  index: number,
  length: number
): string {
  const selected = prompt.selectedPosition === index;
  const canPreview = prompt.selectedPosition !== undefined && !selected;
  const preview = canPreview ? previewDigitSwap(prompt.score, [prompt.selectedPosition!, index]) : prompt.score;
  const delta = roundDelta(preview - prompt.score);
  const status = selected ? "已选" : canPreview ? `${formatNumber(preview)} ${formatDelta(delta)}` : digitPlaceLabel(index, length);
  return `
    <button
      class="score-position-button ${selected ? "selected" : ""} ${canPreview ? "candidate" : ""}"
      type="button"
      data-score-position="${index}"
    >
      <span>${digitPlaceLabel(index, length)}</span>
      <strong>${escapeHtml(digit)}</strong>
      <small>${escapeHtml(status)}</small>
    </button>
  `;
}

function renderStart(): string {
  const canStart = state.subjects.length === 3;
  return `
    <section class="start-screen">
      <div class="start-layout ${DEBUG_ROUTE ? "start-layout-debug" : ""}">
        <section class="start-panel answer-card-panel">
          <div class="answer-card-title">
            <p class="mono-label">ADMISSION CARD</p>
            <h1>请选择你的高考遗物</h1>
          </div>
          <div class="answer-card-sheet" aria-label="答题卡开局设置">
            <div class="sheet-secret-line">姓名、准考证号填写处</div>
            ${renderTicketProfile(state.subjects)}
          </div>
          <div class="start-actions">
            <button class="primary-button full-width" type="button" data-action="start-run" ${canStart ? "" : "disabled"}>开始考试</button>
          </div>
        </section>
        <aside class="visual-ticket ${DEBUG_ROUTE ? "answer-card-debug" : ""}">
          <div class="ticket-stamp">${DEBUG_ROUTE ? "DEBUG" : "开考"}</div>
          ${
            DEBUG_ROUTE
              ? renderDebugBuilder()
              : `<div class="ticket-copy">
                  <span>ANSWER SHEET</span>
                  <strong>填涂完毕后开考</strong>
                  <span>${escapeHtml(subjectOrderLabels().join(" / "))}</span>
                </div>`
          }
        </aside>
      </div>
    </section>
  `;
}

function renderLoading(): string {
  return `
    <section class="result-screen shared-result-screen">
      <div class="result-card">
        <p class="mono-label">LOADING SCORE</p>
        <h1>正在读取战报</h1>
        <p>如果这是静态 GitHub Pages 链接，稍后会自动回到本地开局。</p>
      </div>
    </section>
  `;
}

function renderDraft(prompt: ChoicePrompt): string {
  const opening = !prompt.discard && state.exams.length === 0 && !state.activeExam && prompt.reason === "开局遗物";
  const rollIndex = Math.min(6, prompt.sequence);
  const selected = state.subjects;
  const modeLabel = prompt.discard ? "OVERFLOW ARCHIVE" : opening ? `OPENING ROLL ${rollIndex}/6` : "NEXT SUBJECT ROLL";
  const title = prompt.discard ? "遗物已达上限" : opening ? `请选择你的遗物 ${rollIndex}/6` : "请选择你的遗物";
  const statusItems = [
    ["候选", `${prompt.choices.length}`],
    ["已持有", `${state.artifacts.length}`],
    ["轮次", prompt.discard ? "作废" : opening ? `${rollIndex}/6` : `${state.exams.length + 1}`]
  ];
  return `
    <section class="draft-screen ${prompt.discard ? "draft-screen-discard" : ""}">
      <div class="draft-heading">
        <div class="draft-heading-main">
          <p class="mono-label">${modeLabel}</p>
          <h1>${title}</h1>
        </div>
        <div class="draft-status-rail" aria-label="遗物抽取状态">
          ${statusItems.map(([label, value]) => `<span><small>${label}</small><strong>${value}</strong></span>`).join("")}
        </div>
        ${prompt.discard ? "<p>选择一件遗物丢弃，为新遗物腾出位置。</p>" : ""}
        ${opening ? renderTicketProfile(selected) : ""}
      </div>
      <div class="draft-grid">
        ${prompt.choices.map((artifact, index) => renderDraftCard(artifact, index, prompt.discard)).join("")}
      </div>
      ${prompt.discard ? "" : `<button class="secondary-button skip-draft-button" type="button" data-action="skip-draft">跳过，不拿遗物</button>`}
      ${renderExistingBuild()}
    </section>
  `;
}

function renderTicketProfile(selected: SubjectId[]): string {
  const selectedLabels = selected.map((subject) => SUBJECT_LABELS[subject]).join(" / ");
  return `
    <div class="ticket-profile">
      <label class="player-name-field">
        <span>考生姓名</span>
        <input
          data-field="player-name"
          value="${escapeAttr(state.playerName)}"
          placeholder="输入你的名字"
          autocapitalize="off"
          autocorrect="off"
          spellcheck="false"
        />
      </label>
      <div class="subject-picker" aria-label="选科">
        <div class="subject-picker-head">
          <span>选科 <em>${selected.length}/3</em></span>
          <strong>${escapeHtml(selectedLabels)}</strong>
        </div>
        <div class="subject-chip-row">
          ${ELECTIVE_SUBJECTS.map((subject) => renderSubjectChip(
            subject,
            selected.includes(subject),
            !selected.includes(subject) && selected.length >= 3
          )).join("")}
        </div>
      </div>
    </div>
  `;
}

function renderDebugBuilder(): string {
  const selectedArtifacts: ArtifactConfig[] = [];
  for (const id of state.debugArtifactIds) {
    const artifact = findArtifact(id);
    if (artifact) selectedArtifacts.push(artifact);
  }
  const results = debugSearchResults();
  return `
    <div class="debug-builder">
      <div class="debug-head">
        <div>
          <p class="mono-label">DEBUG BUILD</p>
          <h2>任意构筑遗物组</h2>
        </div>
        <button class="secondary-button" type="button" data-action="clear-debug-build">清空</button>
      </div>
      <div class="debug-selected">
        ${
          selectedArtifacts.length
            ? selectedArtifacts
                .map(
                  (artifact, index) => `
                    <button class="debug-selected-chip rarity-${rarityClass(artifact.rarity)}" type="button" data-action="remove-debug-artifact" data-debug-index="${index}">
                      <span>${escapeHtml(artifact.name)}</span>
                      <strong>×</strong>
                    </button>
                  `
                )
                .join("")
            : `<span class="debug-empty">未放入遗物；开始考试将以空构筑进入考试。</span>`
        }
      </div>
      <label class="debug-search">
        <span>搜索遗物</span>
        <input
          data-field="debug-search"
          value="${escapeAttr(state.debugSearchInput)}"
          placeholder="名称 / 描述 / tag / id"
          autocapitalize="off"
          autocorrect="off"
          spellcheck="false"
        />
      </label>
      <div class="debug-artifact-list">
        ${
          results.length
            ? results.map((artifact) => renderDebugArtifactOption(artifact)).join("")
            : `<div class="debug-empty">没有匹配的遗物。</div>`
        }
      </div>
    </div>
  `;
}

function renderDebugArtifactOption(artifact: ArtifactConfig): string {
  const ownedCount = state.debugArtifactIds.filter((id) => id === artifact.id).length;
  const maxCopies = artifact.maxCopies ?? 1;
  const disabled = ownedCount >= maxCopies;
  return `
    <button
      class="debug-artifact-option rarity-${rarityClass(artifact.rarity)}"
      type="button"
      data-action="add-debug-artifact"
      data-artifact-id="${escapeAttr(artifact.id)}"
      ${disabled ? "disabled" : ""}
    >
      <span class="rarity">${rarityLabel(artifact.rarity)}</span>
      <strong>${escapeHtml(artifact.name)}</strong>
      <small>${escapeHtml(artifact.description)}</small>
      <em>${ownedCount}/${maxCopies}</em>
    </button>
  `;
}

function findArtifact(id: string): ArtifactConfig | undefined {
  return (LOCAL_ARTIFACTS as readonly ArtifactConfig[]).find((artifact) => artifact.id === id);
}

function renderSubjectChip(subject: SubjectId, active: boolean, disabled: boolean): string {
  return `
    <button
      type="button"
      class="${active ? "subject-chip active" : "subject-chip"}"
      data-subject="${subject}"
      aria-pressed="${active}"
      ${disabled ? "disabled" : ""}
    >
      ${SUBJECT_LABELS[subject]}
    </button>
  `;
}

function renderDraftCard(artifact: ArtifactConfig, index: number, discard = false): string {
  const code = String(index + 1).padStart(2, "0");
  return `
    <button class="draft-card rarity-${rarityClass(artifact.rarity)} ${discard ? "discard-card" : ""}" type="button" data-choice="${index}">
      <span class="draft-card-watermark">${code}</span>
      <div class="draft-card-top">
        <span class="draft-index">档案 ${code}</span>
        <div class="term-corner">
          <span class="rarity">${rarityLabel(artifact.rarity)}</span>
        </div>
      </div>
      <h2>${escapeHtml(artifact.name)}</h2>
      <p>${escapeHtml(artifact.description)}</p>
      <div class="draft-card-footer">
        <span>${escapeHtml(artifact.id)}</span>
        <strong>${discard ? "作废出档" : "盖章入档"}</strong>
      </div>
    </button>
  `;
}

function renderExistingBuild(): string {
  if (state.artifacts.length === 0) return "";
  return `
    <div class="existing-build">
      <span class="mono-label">CURRENT BUILD</span>
      <div class="tag-row">
        ${state.artifacts
          .map((artifact) => `<span>${escapeHtml(artifact.name)}</span>`)
          .join("")}
      </div>
    </div>
  `;
}

function renderExam(): string {
  const exam = state.activeExam!;
  const question = state.currentQuestion;
  const rule = SUBJECT_EXAM_RULES[exam.subject];
  const pending = Math.max(0, rule.questionCount - Math.min(rule.questionCount, exam.questionIndex));
  const intensity = state.activeTrigger?.intensity ?? state.scoreFlash?.intensity ?? "low";
  return `
    <section class="game-grid compact-exam-grid">
      <section class="exam-stage exam-paper fx-stage fx-${intensity}" aria-label="当前答题与词条触发">
        ${renderExamHeader(exam, pending)}
        ${renderScreenFx()}
        ${renderTriggerOverlay()}
        ${renderExamSettlement()}
        <div class="exam-priority">
          ${renderQuestionCard(exam, question)}
          ${renderTriggerStage()}
        </div>
      </section>
      <section class="support-drawers" aria-label="次要信息">
        ${renderStateDrawer(exam, pending)}
        ${renderTermsDrawer()}
        ${renderHelpDrawer()}
        ${renderLogDrawer()}
      </section>
    </section>
  `;
}

function renderExamSettlement(): string {
  const exam = state.examSettlement;
  if (!exam) return "";
  const total = currentScore();
  const rawScore = exam.rawScore ?? exam.score;
  const examMultiplier = exam.examMultiplier ?? 1;
  const examPostBonus = exam.examPostBonus ?? 0;
  const multipliedScore = Math.round(rawScore * examMultiplier * 100) / 100;
  const examScoreText = formatNumber(exam.score);
  const totalScoreText = formatNumber(total);
  const hasPostBonus = Math.abs(examPostBonus) > 0.0001;
  const bonusLabel = examPostBonus >= 0 ? "结算加分" : "结算扣分";
  const bonusNode = Math.abs(examPostBonus) > 0.0001
    ? `
          <i>${examPostBonus >= 0 ? "+" : "-"}</i>
          <span class="settlement-bonus">
            <b>${bonusLabel}</b>
            <strong>${formatNumber(Math.abs(examPostBonus))}</strong>
          </span>
      `
    : "";
  const floats = [
    formatDelta(exam.score),
    `原始分 ${formatNumber(rawScore)}`,
    `得分倍率 x${formatNumber(examMultiplier)}`,
    `=${formatNumber(multipliedScore)}`,
    ...(hasPostBonus ? [`最终修正 ${formatDelta(examPostBonus)}`] : []),
    `${SUBJECT_LABELS[exam.subject]} ${examScoreText}`,
    `答对 ${exam.correctCount}`,
    `答错 ${exam.wrongCount}`,
    `总分 ${totalScoreText}`
  ];
  return `
    <section class="exam-settlement-layer" role="dialog" aria-modal="true">
      <div class="settlement-float-field" aria-hidden="true">
        ${floats.map((label, index) => renderSettlementFloat(label, index)).join("")}
      </div>
      <article class="settlement-card exam-paper">
        <div class="settlement-card-head">
          <span>${SUBJECT_LABELS[exam.subject]}</span>
          <strong>${examScoreText}</strong>
        </div>
        <div class="settlement-formula" aria-label="本场结算公式">
          <span>
            <b>原始分</b>
            <strong>${formatNumber(rawScore)}</strong>
          </span>
          <i>x</i>
          <span class="settlement-multiplier">
            <b>得分倍率</b>
            <strong>x${formatNumber(examMultiplier)}</strong>
          </span>
          <i>=</i>
          <span class="settlement-product">
            <b>倍率分</b>
            <strong>${formatNumber(multipliedScore)}</strong>
          </span>
          ${bonusNode}
        </div>
        <div class="settlement-score-shell">
          <span class="settlement-light-burst" aria-hidden="true"></span>
          <div class="settlement-score ${exam.score > SUBJECT_EXAM_RULES[exam.subject].fullScore ? "over-score" : ""}">${examScoreText}</div>
        </div>
        <div class="settlement-stat-grid">
          <div><span>答对</span><strong>${exam.correctCount}</strong></div>
          <div><span>答错</span><strong>${exam.wrongCount}</strong></div>
          <div><span>总分</span><strong>${totalScoreText}</strong></div>
        </div>
        <div class="settlement-subject-strip">
          ${state.exams
            .map((item) => `<span>${SUBJECT_LABELS[item.subject]} <strong>${formatNumber(item.score)}</strong></span>`)
            .join("")}
        </div>
        <div class="settlement-card-link">whitegiver-plus.github.io/GaokaoArtifact</div>
        <button class="primary-button" type="button" data-action="continue-settlement">继续考试</button>
      </article>
    </section>
  `;
}

function renderSettlementFloat(label: string, index: number): string {
  const positions = [
    ["16%", "22%"],
    ["72%", "20%"],
    ["10%", "62%"],
    ["80%", "58%"],
    ["28%", "78%"],
    ["62%", "76%"],
    ["48%", "18%"],
    ["46%", "84%"]
  ];
  const [x, y] = positions[index % positions.length];
  return `<span style="--x:${x};--y:${y};--i:${index}">${escapeHtml(label)}</span>`;
}

function renderPaperStatusTile(label: string, value: string, key: keyof LiveExamStatus, idleText = "当前"): string {
  const delta = state.activeTrigger?.deltas?.find((item) => item.key === key);
  const intensity = delta ? state.activeTrigger?.intensity ?? "low" : "low";
  const heat = key === "questionMultiplier" || key === "examMultiplier"
    ? multiplierHeat(state.liveStatus[key])
    : "cool";
  return `
    <div class="paper-status-tile status-${key} heat-${heat} ${delta ? `status-pulse intensity-${intensity}` : ""}">
      ${delta ? `<b class="status-delta delta-${intensity}">${formatDelta(delta.value, key)}</b>` : ""}
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${delta ? `${formatNumber(delta.before)} -> ${formatNumber(delta.after)}` : idleText}</small>
    </div>
  `;
}

function renderScoreBankFloat(event: VisualEvent): string {
  if (!event.scoreBanking || !event.settling || typeof event.scoreDelta !== "number") return "";
  return `
    <b class="score-bank-float bank-${event.intensity}" aria-hidden="true">${formatDelta(event.scoreDelta)}</b>
  `;
}

function renderExamHeader(exam: NonNullable<UiState["activeExam"]>, pending: number): string {
  const rule = SUBJECT_EXAM_RULES[exam.subject];
  const done = Math.min(rule.questionCount, exam.questionIndex);
  const total = state.exams.reduce((sum, item) => sum + item.score, 0) + exam.score + state.scoreAdjustment;
  const totalScoreText = formatNumber(total);
  const examScoreText = formatNumber(exam.score);
  const progress = Math.min(100, (done / rule.questionCount) * 100);
  const trigger = state.activeTrigger;
  const flash = trigger ?? state.scoreFlash;
  const bankFlash = state.scoreFlash?.scoreBanking && state.scoreFlash.settling ? state.scoreFlash : undefined;
  const scoreFlashClass = flash
    ? flash.settling
      ? `score-settling settle-${flash.intensity} ${flash.scoreBanking ? "score-banking" : ""}`
      : `score-flash flash-${flash.intensity}`
    : "";
  return `
    <div class="exam-paper-header compact-paper-header">
      <span class="secret-line">★ 考试状态 ★</span>
      <div class="paper-id-pattern" aria-hidden="true">
        <span>准考证号 ${escapeHtml(state.seed.slice(0, 10).toUpperCase())}</span>
        <i></i>
      </div>
      ${renderExamToolDock()}
      <div class="paper-status-layout" aria-label="当前考试状态">
        <div class="paper-title-block compact-paper-title">
          <p class="mono-label">AUTO EXAM STATUS</p>
          <h2>${SUBJECT_LABELS[exam.subject]}</h2>
          <small>第 ${exam.index + 1}/${subjectOrder().length} 场 · 答题点 ${done}/${rule.questionCount} · 剩余 ${pending}</small>
        </div>
        <div class="paper-score-total score-box-total ${scoreFlashClass}">
          <em class="paper-total-corner">总分 ${totalScoreText}</em>
          <span>分数</span>
          <strong class="${exam.score > rule.fullScore ? "over-score" : ""}">${examScoreText}</strong>
          <small>${SUBJECT_LABELS[exam.subject]}当前分</small>
          ${bankFlash ? renderScoreBankFloat(bankFlash) : ""}
        </div>
        <div class="paper-status-grid">
          ${renderPaperStatusTile("正确率", `${formatNumber(state.liveStatus.accuracy)}%`, "accuracy")}
          ${renderPaperStatusTile("本题倍率", `x${formatNumber(state.liveStatus.questionMultiplier)}`, "questionMultiplier")}
          ${renderPaperStatusTile("考试倍率", `x${formatNumber(state.liveStatus.examMultiplier)}`, "examMultiplier")}
          ${renderPaperStatusTile("体力", `${formatNumber(state.liveStatus.stamina)}%`, "stamina", `基础 ${formatNumber(state.liveStatus.baseStamina)}%`)}
        </div>
      </div>
      <div class="paper-progress-row">
        <div class="budget-bar" aria-label="答题点进度"><span style="width:${progress}%"></span></div>
        <div class="budget-text">
          <span>答题点 ${done} / ${rule.questionCount}</span>
          <span>CHAIN ${state.chainCount}</span>
        </div>
      </div>
    </div>
  `;
}

function renderExamToolDock(): string {
  const pauseLabel = state.autoPlay ? "暂停自动" : "继续自动";
  return `
    <div class="exam-tool-dock" aria-label="考试控制">
      <button class="exam-icon-button ${state.autoPlay ? "is-running" : "is-paused"}" type="button" data-action="toggle-auto" aria-label="${pauseLabel}" title="${pauseLabel}">
        <span class="geo-icon ${state.autoPlay ? "geo-pause" : "geo-play"}" aria-hidden="true"></span>
      </button>
      <button class="exam-icon-button is-restart" type="button" data-action="restart" aria-label="重开" title="重开">
        <span class="geo-icon geo-restart" aria-hidden="true"></span>
      </button>
      <button class="exam-icon-button is-speed speed-tier-${state.speedMultiplier}" type="button" data-action="cycle-speed" aria-label="加速 ${state.speedMultiplier}x" title="加速 ${state.speedMultiplier}x">
        <span class="speed-pips" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
      </button>
      <button class="exam-icon-button is-skip" type="button" data-action="skip-to-settlement" aria-label="跳到改分或本科结算" title="跳到改分或本科结算">
        <span class="geo-icon geo-skip" aria-hidden="true"></span>
      </button>
    </div>
  `;
}

function renderQuestionCard(exam: NonNullable<UiState["activeExam"]>, question?: QuestionLog): string {
  const rule = SUBJECT_EXAM_RULES[exam.subject];
  const resultClass = question ? (question.correct ? "result-success" : "result-fail") : "result-pending";
  const titleIndex = Math.max(1, exam.questionIndex);
  const staminaText = question
    ? `${formatNumber(question.staminaBefore)}->${formatNumber(question.staminaAfter)}`
    : "--";
  const gainedText = question ? formatNumber(question.scoreGained) : "0";
  return `
    <article class="question-card ${resultClass}">
      <div class="scanline"></div>
      <div class="question-top">
        <span class="mono-label">QUESTION ${String(titleIndex).padStart(2, "0")}</span>
        <span class="score-pill">${rule.pointsPerQuestion} 分</span>
      </div>
      <h1>${SUBJECT_LABELS[exam.subject]} 第 ${titleIndex} 题</h1>
      <div class="question-meta">
        <span>${SUBJECT_LABELS[exam.subject]}</span>
        <span>正确率 ${question?.accuracy ?? "--"}%</span>
        <span>掷骰 ${question?.roll ?? "--"}</span>
      </div>
      <div class="answer-grid">
        ${Array.from({ length: rule.questionCount }, (_, index) => renderAnswerDot(index + 1, rule.pointsPerQuestion)).join("")}
      </div>
      <div class="tag-row large">
        <span>体力 ${staminaText}</span>
        <span>本题 ${gainedText} 分</span>
      </div>
      <div class="result-stamp">${question ? (question.correct ? "成功" : "失误") : "等待判定"}</div>
    </article>
  `;
}

function renderAnswerDot(index: number, pointsPerQuestion: number): string {
  const logged = state.examQuestions.find((question) => question.questionIndex === index);
  const active = state.activeExam?.questionIndex === index && !logged ? " active" : "";
  if (!logged) {
    return `<span class="answer-pending${active}" data-index="${index}" title="第 ${index} 题：待判"></span>`;
  }
  const cls = logged.correct ? "answer-success" : "answer-fail";
  const label = logged.correct ? "成功" : "失误";
  return `<span class="${cls}${active}" data-index="${index}" title="第 ${index} 题：${label} ${formatNumber(logged.scoreGained)}/${pointsPerQuestion}"></span>`;
}

function renderTriggerOverlay(): string {
  const event = state.activeTrigger ?? state.scoreFlash;
  if (!event) {
    return `<div class="trigger-overlay" aria-hidden="true"></div>`;
  }
  if (event.scoreBanking && event.settling) {
    return `<div class="trigger-overlay" aria-hidden="true"></div>`;
  }
  const delta = [...(event.deltas ?? [])].sort((a, b) => Math.abs(b.value) - Math.abs(a.value))[0];
  const scoreDelta = event.scoreDelta;
  const detail = event.detailText ? escapeHtml(event.detailText) : typeof scoreDelta === "number" && Math.abs(scoreDelta) > 0.0001
    ? `分数 ${formatDelta(scoreDelta)}`
    : delta ? `${escapeHtml(delta.label)} ${formatDelta(delta.value, delta.key)}` : event.effectText ? escapeHtml(event.effectText) : "";
  const label = event.settling && event.scoreBanking && typeof scoreDelta === "number"
    ? formatDelta(scoreDelta)
    : event.label;
  const ledger = event.scoreBanking && event.examScoreBefore !== undefined && event.examScoreAfter !== undefined
    ? `<em>科目分 ${formatNumber(event.examScoreBefore)} -> ${formatNumber(event.examScoreAfter)}</em>`
    : "";
  return `
    <div class="trigger-overlay" aria-hidden="true">
      <span class="float-event float-${event.tone} float-${event.intensity} kind-${cssSafeKind(event.kind)} ${event.scoreBanking ? "float-banking" : ""} ${event.settling ? "float-settling" : ""}">
        <strong>${escapeHtml(label)}</strong>
        ${detail ? `<small>${detail}</small>` : ""}
        ${ledger}
      </span>
    </div>
  `;
}

function renderScreenFx(): string {
  const event = state.activeTrigger ?? state.scoreFlash;
  if (!event || event.intensity === "low") {
    return `<div class="screen-fx" aria-hidden="true"></div>`;
  }
  return `
    <div class="screen-fx screen-fx-${event.intensity}" aria-hidden="true">
      <i class="fx-scan"></i>
      <i class="fx-shockwave"></i>
      <i class="fx-sparks"></i>
    </div>
  `;
}

function renderTriggerStage(): string {
  const activeIds = new Set([state.activeTrigger?.artifactId].filter(Boolean));
  const activeTerms = state.artifacts.filter((artifact) => activeIds.has(artifact.id));
  const terms = (activeTerms.length > 0 ? activeTerms : state.artifacts).slice(0, 8);
  const intensity = state.activeTrigger?.intensity ?? "low";
  const queuedEvents = state.triggerQueue.filter((event) => event.id !== state.activeTrigger?.id).slice(0, 4);
  return `
    <aside class="trigger-term-stage chain-${intensity}">
      <div class="trigger-stage-head">
        <div><p class="mono-label">TRIGGER ZONE</p><h2>触发词条</h2></div>
        <span class="chain-count chain-${intensity}">CHAIN ${state.chainCount}</span>
      </div>
      <div class="trigger-event-stack">
        ${
          state.activeTrigger
            ? [state.activeTrigger, ...queuedEvents]
                .map(
                  (event, index) =>
                    `<span class="event-chip chip-${event.tone} chip-${event.intensity} ${index === 0 ? "current" : "queued"}">${escapeHtml(event.label)}</span>`
                )
                .join("")
            : ""
        }
      </div>
      ${state.activeTrigger ? `<div class="trigger-beam beam-${state.activeTrigger.intensity}"></div>` : ""}
      ${
        state.activeTrigger?.deltas?.length
          ? `<div class="trigger-delta-row">
              ${state.activeTrigger.deltas
                .map((delta) => `<span>${escapeHtml(delta.label)} ${formatDelta(delta.value, delta.key)}</span>`)
                .join("")}
            </div>`
          : ""
      }
      <div class="trigger-card-strip">
        ${
          terms.length > 0
            ? terms.map((term) => renderMiniTerm(term, activeIds.has(term.id))).join("")
            : `<article class="trigger-mini-card empty"><strong>还没抽词条</strong></article>`
        }
      </div>
    </aside>
  `;
}

function renderMiniTerm(term: ArtifactConfig, active: boolean): string {
  return `
    <article class="trigger-mini-card rarity-${rarityClass(term.rarity)} ${active ? "triggered" : ""}">
      <div class="term-corner mini">
        <span class="rarity">${rarityLabel(term.rarity)}</span>
      </div>
      <strong>${escapeHtml(term.name)}</strong>
    </article>
  `;
}

function renderStateDrawer(exam: NonNullable<UiState["activeExam"]>, pending: number): string {
  return `
    <details class="mobile-drawer state-drawer">
      <summary><span>考试状态</span><strong>${pending} 题待判</strong></summary>
      <div class="subject-list">
        ${subjectOrder()
          .map((subject, index) => {
            const done = state.exams.find((item) => item.subject === subject);
            const active = exam.subject === subject;
            const score = done ? formatNumber(done.score) : active ? formatNumber(exam.score) : "--";
            return `<div class="subject-row ${active ? "active" : ""} ${done ? "done" : ""}"><span>${index + 1}. ${SUBJECT_LABELS[subject]}</span><strong>${score}</strong></div>`;
          })
          .join("")}
      </div>
      <div class="stat-block">
        <div class="stat-row"><span>答对</span><strong>${state.examQuestions.filter((item) => item.correct).length}</strong></div>
        <div class="stat-row"><span>答错</span><strong>${state.examQuestions.filter((item) => !item.correct).length}</strong></div>
        <div class="stat-row"><span>当前正确率</span><strong>${formatNumber(state.liveStatus.accuracy)}%</strong></div>
        <div class="stat-row"><span>本题倍率</span><strong>x${formatNumber(state.liveStatus.questionMultiplier)}</strong></div>
        <div class="stat-row"><span>考试倍率</span><strong>x${formatNumber(state.liveStatus.examMultiplier)}</strong></div>
        <div class="stat-row"><span>体力</span><strong>${formatNumber(state.liveStatus.stamina)}%</strong></div>
        <div class="stat-row"><span>基础体力</span><strong>${formatNumber(state.liveStatus.baseStamina)}%</strong></div>
        <div class="stat-row"><span>自动</span><strong>${state.autoPlay ? "ON" : "OFF"}</strong></div>
      </div>
    </details>
  `;
}

function renderTermsDrawer(): string {
  return `
    <details class="mobile-drawer terms-drawer">
      <summary><span>遗物列表</span><strong>${state.artifacts.length} 条</strong></summary>
      <div class="panel-title">
        <p class="mono-label">ADMISSION TICKET</p>
        <h2>遗物列表</h2>
      </div>
      <div class="term-list">
        ${state.artifacts.map((artifact) => renderTermCard(artifact)).join("")}
      </div>
    </details>
  `;
}

function renderTermCard(artifact: ArtifactConfig): string {
  const active = state.visualEvents.some((event) => event.artifactId === artifact.id);
  return `
    <article class="term-card rarity-${rarityClass(artifact.rarity)} ${active ? "triggered" : ""}">
      <div class="term-card-head">
        <div class="term-corner">
          <span class="rarity">${rarityLabel(artifact.rarity)}</span>
        </div>
      </div>
      <h3>${escapeHtml(artifact.name)}</h3>
      <p>${escapeHtml(artifact.description)}</p>
    </article>
  `;
}

function renderHelpDrawer(): string {
  return `
    <details class="mobile-drawer help-drawer">
      <summary><span>帮助文档</span><strong>规则 / 体力 / 操作</strong></summary>
      ${renderHelpDoc()}
    </details>
  `;
}

function renderHelpDoc(): string {
  return `
    <div class="help-doc">
      <section>
        <h3>开局</h3>
        <p>先进行 6 次开局 4 选 1 遗物，再完成语文、数学、英语和 3 门自选科目的 6 场考试。</p>
      </section>
      <section>
        <h3>题目</h3>
        <p>语文、数学、英语各 15 题，单科满分 150 分；3 门选考科目各 10 题，单科满分 100 分。每题基础 10 分，六科标准满分 750 分。</p>
      </section>
      <section>
        <h3>正确率</h3>
        <p>判题时先算最终正确率 = 基础正确率 x 当前体力 / 100 + 本题正确率加成，再被相关遗物修正；超过 100% 的部分可被部分遗物转换成倍率收益。</p>
      </section>
      <section>
        <h3>体力与倍率</h3>
        <p>默认基础体力 100%，每题结算后体力 -5%。每科开考前体力恢复到基础体力；本题倍率只影响当前题，本场倍率在交卷时乘到本场原始分。</p>
      </section>
      <section>
        <h3>无尽模式</h3>
        <p>分数超过 750 可进入无尽模式。之后每年保留遗物，每科前获得一次 4 选 1，录取线从 750 开始每年 x3。</p>
      </section>
      <section>
        <h3>操作</h3>
        <p>自动模式会连续判题；暂停自动后可点击“继续自动”恢复；加速默认 2x，可切换 1x、2x、4x、8x 播放速度。</p>
      </section>
    </div>
  `;
}

function renderLogDrawer(): string {
  return `
    <details class="mobile-drawer log-drawer">
      <summary><span>连锁日志</span><strong>${state.logs.length} 条</strong></summary>
      ${renderLogStandalone()}
    </details>
  `;
}

function renderLogStandalone(): string {
  return `
    <section class="event-log">
      <div class="event-log-head"><span class="mono-label">CHAIN LOG</span><span>${state.logs.length} 条</span></div>
      <div class="event-log-list">
        ${state.logs
          .slice(-60)
          .reverse()
          .map((line) => `<p class="log-${logTone(line)}">${escapeHtml(line)}</p>`)
          .join("")}
      </div>
    </section>
  `;
}

function logTone(line: string): "good" | "warn" | "wild" {
  if (line.startsWith("触发遗物") || line.startsWith("获得遗物")) return "good";
  if (line.includes("失去") || line.includes("错误") || line.includes("丢弃")) return "warn";
  return "wild";
}

function renderResult(result: RunResult): string {
  const passedThreshold = result.totalScore > result.threshold;
  const nextThreshold = nextEndlessThreshold(result.threshold);
  const title = resultTitle(result.totalScore);
  const totalScoreText = formatNumber(result.totalScore);
  const thresholdText = formatNumber(result.threshold);
  const nextThresholdText = formatNumber(nextThreshold);
  return `
    <section class="result-screen">
      <div class="result-card">
        <p class="mono-label">${state.endlessActive ? `ENDLESS YEAR ${result.year}` : "FINAL SCORE"}</p>
        <div class="final-score ${result.totalScore > 750 ? "over-score" : ""}">${totalScoreText}</div>
        <h1>${title}</h1>
        <p>${escapeHtml(state.playerName || "考生")} 的六科已交卷。准考证收录 ${result.artifactNames.length} 件遗物。</p>
        <div class="endless-panel ${passedThreshold ? "passed" : "failed"}">
          <div>
            <span>${passedThreshold ? "下一年录取线" : "本轮录取线"}</span>
            <strong>${passedThreshold ? nextThresholdText : thresholdText}</strong>
          </div>
          <p>${passedThreshold ? "进入下一年后保留当前遗物组；每科开考前获得一次 4 选 1。" : "达到本轮录取线后可进入下一年。"}</p>
        </div>
        ${renderShareCard(result, title)}
        ${renderResultArtifacts(result)}
        <div class="result-subjects">
          ${renderResultSubjectRows(result)}
        </div>
        <div class="result-actions">
          ${passedThreshold && !RESULT_DEBUG_ROUTE ? `<button class="primary-button" type="button" data-action="continue-endless">进入第 ${result.year + 1} 年</button>` : ""}
          <button class="secondary-button" type="button" data-action="copy-share-link">复制战报链接</button>
          <button class="secondary-button" type="button" data-action="download-share-image">下载战报图</button>
          ${
            RESULT_DEBUG_ROUTE
              ? `<button class="secondary-button" type="button" data-action="reset-result-debug">重置示例</button>`
              : `<button class="secondary-button" type="button" data-action="restart">重新开始</button>`
          }
        </div>
      </div>
      ${renderLogStandalone()}
    </section>
  `;
}

function renderShareCard(result: RunResult, title: string): string {
  const totalScoreText = formatNumber(result.totalScore);
  const thresholdText = formatNumber(result.threshold);
  return `
    <section class="share-card-preview" aria-label="分享卡片预览">
      <div class="share-card-paper">
        <div class="share-card-head">
          <div><span class="mono-label">REPORT CARD</span><strong>whitegiver-plus.github.io/GaokaoArtifact</strong></div>
          <span>${result.year > 1 ? `YEAR ${result.year}` : "本地战报"}</span>
        </div>
        <div class="share-card-candidate"><span>考生</span><strong>${escapeHtml(state.playerName || "考生")}</strong></div>
        <div class="share-card-score-row">
          <div class="share-card-score ${result.totalScore > 750 ? "over-score" : ""}">${totalScoreText}</div>
          <div class="share-card-qr-box">
            <img class="share-card-qr" data-share-qr alt="战报二维码" />
          </div>
        </div>
        <h2>${title}</h2>
        <div class="share-card-meta">
          <span>SEED ${escapeHtml(result.seed)}</span>
          <span>录取线 ${thresholdText}</span>
        </div>
        <div class="share-card-hand"><span>无尽年</span><strong>${result.year}</strong></div>
        <div class="share-card-subjects">
          ${renderShareCardSubjectRows(result)}
        </div>
        <div class="share-card-terms">
          ${result.artifactNames
            .map((name, index) => renderArtifactChip(name, result.artifactIds[index]))
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderResultArtifacts(result: RunResult): string {
  if (result.artifactNames.length === 0) return "";
  return `
    <section class="result-artifacts" aria-label="最终遗物清单">
      <div class="result-artifacts-head">
        <span>遗物清单</span>
        <strong>${result.artifactNames.length} 条</strong>
      </div>
      <div class="result-artifact-list">
        ${result.artifactNames.map((name, index) => renderArtifactChip(name, result.artifactIds[index])).join("")}
      </div>
    </section>
  `;
}

function renderArtifactChip(name: string, artifactId?: string): string {
  const artifact = artifactId ? findArtifact(artifactId) : undefined;
  const className = artifact ? ` class="rarity-text-${rarityClass(artifact.rarity)}"` : "";
  return `<span${className}>${escapeHtml(name)}</span>`;
}

function renderResultSubjectRows(result: RunResult): string {
  return [
    ...result.exams.map(
      (exam) => `<div><span>${SUBJECT_LABELS[exam.subject]}</span><strong>${formatNumber(exam.score)}</strong></div>`
    ),
    renderScoreAdjustmentRow(resultScoreAdjustment(result), "result")
  ]
    .filter(Boolean)
    .join("");
}

function renderShareCardSubjectRows(result: RunResult): string {
  return [
    ...result.exams.map((exam) => `<span>${SUBJECT_LABELS[exam.subject]} <strong>${formatNumber(exam.score)}</strong></span>`),
    renderScoreAdjustmentRow(resultScoreAdjustment(result), "share")
  ]
    .filter(Boolean)
    .join("");
}

function renderScoreAdjustmentRow(adjustment: number, variant: "result" | "share"): string {
  if (Math.abs(adjustment) < 0.0001) return "";
  const label = scoreAdjustmentLabel(adjustment);
  const value = formatDelta(adjustment);
  const className = `score-adjustment score-adjustment-${adjustment >= 0 ? "positive" : "negative"}`;
  if (variant === "result") {
    return `<div class="${className}"><span>${label}</span><strong>${value}</strong></div>`;
  }
  return `<span class="${className}">${label} <strong>${value}</strong></span>`;
}

function scoreAdjustmentLabel(adjustment: number): string {
  return adjustment >= 0 ? "遗物总分加成" : "遗物总分修正";
}

function resultScoreAdjustment(result: RunResult): number {
  const subjectTotal = result.exams.reduce((sum, exam) => sum + exam.score, 0);
  return result.totalScore - subjectTotal;
}

function renderSharedReport(report: SharedReport): string {
  const scoreText = formatNumber(report.score);
  const thresholdText = formatNumber(report.threshold);
  return `
    <section class="result-screen shared-result-screen">
      <div class="result-card">
        <p class="mono-label">SHARED REPORT</p>
        <div class="final-score ${report.score > 750 ? "over-score" : ""}">${scoreText}</div>
        <h1>${escapeHtml(resultTitle(report.score))}</h1>
        <p>${escapeHtml(report.playerName)} 的分享战报。第 ${report.year} 年，收录 ${report.artifacts.length} 件遗物。</p>
        <section class="share-card-preview" aria-label="分享战报">
          <div class="share-card-paper">
            <div class="share-card-head">
              <div><span class="mono-label">REPORT CARD</span><strong>whitegiver-plus.github.io/GaokaoArtifact</strong></div>
              <span>YEAR ${report.year}</span>
            </div>
            <div class="share-card-candidate"><span>考生</span><strong>${escapeHtml(report.playerName)}</strong></div>
            <div class="share-card-score-row">
              <div class="share-card-score ${report.score > 750 ? "over-score" : ""}">${scoreText}</div>
              <div class="share-card-qr-box">
                <img class="share-card-qr" data-share-qr alt="战报二维码" />
              </div>
            </div>
            <h2>${escapeHtml(resultTitle(report.score))}</h2>
            <div class="share-card-meta">
              <span>SEED ${escapeHtml(report.seed)}</span>
              <span>录取线 ${thresholdText}</span>
            </div>
            <div class="share-card-subjects">
              ${report.subjects
                .map((exam) => `<span>${escapeHtml(exam.label)} <strong>${escapeHtml(exam.score)}</strong></span>`)
                .join("")}
              ${renderScoreAdjustmentRow(sharedReportScoreAdjustment(report), "share")}
            </div>
            <div class="share-card-terms">
              ${report.artifacts.map((name) => `<span>${escapeHtml(name)}</span>`).join("")}
            </div>
          </div>
        </section>
        <div class="result-actions">
          <button class="primary-button" type="button" data-action="restart">本地开考</button>
        </div>
      </div>
    </section>
  `;
}

function resultTitle(_score: number): string {
  return "高考战报";
}

function nextEndlessThreshold(threshold: number): number {
  return Math.ceil(threshold * 3);
}

function renderFooter(): string {
  const notice = state.footerNotice
    ? `<div class="footer-notice" role="status">${escapeHtml(state.footerNotice)}</div>`
    : "";
  return `
    <footer class="info-footer">
      <details>
        <summary><span>帮助文档</span><strong>规则 / 体力 / 操作</strong></summary>
        <div class="footer-help">
          ${renderHelpDoc()}
        </div>
      </details>
      ${notice}
    </footer>
  `;
}

async function copyShareLink(): Promise<void> {
  const result = state.result;
  if (!result) return;
  const link = buildShareUrl(result);
  const text = buildShareText(result, link);
  try {
    await navigator.clipboard.writeText(text);
    showCopyToast("已复制");
  } catch {
    showFooterNotice(text);
  }
}

function buildShareText(result: RunResult, link: string): string {
  const playerName = state.playerName || "考生";
  return `${playerName}在《请选择你的高考遗物》中获得了${formatNumber(result.totalScore)}分，你也来试试吧：${link}`;
}

async function downloadShareImage(): Promise<void> {
  const result = state.result;
  if (!result) return;
  try {
    const link = buildShareUrl(result);
    const dataUrl = await createShareImageDataUrl(result, link);
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = `gaokao-report-${sanitizeFilename(result.seed)}.png`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    showFooterNotice("战报图已下载。");
  } catch {
    showFooterNotice("战报图生成失败，请先复制战报链接。");
  }
}

async function createShareImageDataUrl(result: RunResult, link: string): Promise<string> {
  const source = root.querySelector<HTMLElement>(".share-card-paper");
  if (!source) throw new Error("Share card is unavailable.");
  const frame = document.createElement("div");
  frame.className = "share-card-download-capture";
  const clone = source.cloneNode(true) as HTMLElement;
  frame.append(clone);
  document.body.append(frame);
  try {
    await hydrateShareQRCodesIn(frame, link);
    await waitForImages(clone);
    return await toPng(clone, {
      backgroundColor: "#f2f5f9",
      cacheBust: true,
      pixelRatio: 2
    });
  } finally {
    frame.remove();
  }
}

function waitForImages(element: HTMLElement): Promise<void> {
  const images = [...element.querySelectorAll<HTMLImageElement>("img")];
  return Promise.all(
    images.map((image) => {
      if (image.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      });
    })
  ).then(() => undefined);
}

function drawReportCanvas(
  context: CanvasRenderingContext2D,
  result: RunResult,
  qrImage: HTMLImageElement,
  width: number,
  height: number
): void {
  const title = resultTitle(result.totalScore);
  const margin = 58;
  context.fillStyle = "#f2f5f9";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#ffffff";
  drawRoundRect(context, margin, margin, width - margin * 2, height - margin * 2, 18);
  context.fill();
  context.strokeStyle = "#111827";
  context.lineWidth = 4;
  context.stroke();

  context.fillStyle = "rgba(217, 52, 43, 0.12)";
  context.fillRect(margin, margin, 34, height - margin * 2);
  context.fillStyle = "#111827";
  context.font = "900 30px 'Microsoft YaHei', sans-serif";
  context.fillText("whitegiver-plus.github.io/GaokaoArtifact", 110, 128);
  context.font = "900 18px Consolas, monospace";
  context.fillStyle = "#6b7280";
  context.fillText(`SEED ${result.seed}`, 110, 164);

  context.drawImage(qrImage, width - 250, 204, 142, 142);

  context.font = "950 142px Consolas, monospace";
  context.fillStyle = "#111827";
  context.fillText(formatNumber(result.totalScore), 108, 330);
  context.font = "900 54px 'Microsoft YaHei', sans-serif";
  context.fillText(title, 112, 410);

  context.font = "800 26px 'Microsoft YaHei', sans-serif";
  context.fillStyle = "#374151";
  context.fillText(`${state.playerName || "考生"} · 第 ${result.year} 年 · 录取线 ${formatNumber(result.threshold)}`, 112, 470);

  let y = 545;
  context.font = "900 24px 'Microsoft YaHei', sans-serif";
  context.fillStyle = "#111827";
  context.fillText("科目分数", 112, y);
  y += 28;
  const subjectWidth = 280;
  const scoreRows = [
    ...result.exams.map((exam) => `${SUBJECT_LABELS[exam.subject]}  ${formatNumber(exam.score)}`),
    resultScoreAdjustment(result) ? `${scoreAdjustmentLabel(resultScoreAdjustment(result))}  ${formatDelta(resultScoreAdjustment(result))}` : ""
  ].filter(Boolean);
  scoreRows.forEach((text, index) => {
    const x = 112 + (index % 3) * (subjectWidth + 26);
    const rowY = y + Math.floor(index / 3) * 76;
    drawPill(context, x, rowY, subjectWidth, 52, text);
  });

  y += Math.ceil(scoreRows.length / 3) * 76 + 44;
  context.font = "900 24px 'Microsoft YaHei', sans-serif";
  context.fillStyle = "#111827";
  context.fillText(`遗物清单 ${result.artifactNames.length} 件`, 112, y);
  y += 28;
  result.artifactNames.forEach((name, index) => {
    const x = 112 + (index % 3) * 296;
    const rowY = y + Math.floor(index / 3) * 50;
    drawPill(context, x, rowY, 270, 34, name, 19);
  });
}

function drawPill(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  fontSize = 22
): void {
  context.fillStyle = "#ffffff";
  drawRoundRect(context, x, y, width, height, 12);
  context.fill();
  context.strokeStyle = "#cfd6e5";
  context.lineWidth = 2;
  context.stroke();
  context.fillStyle = "#111827";
  context.font = `900 ${fontSize}px 'Microsoft YaHei', sans-serif`;
  drawFittedText(context, text, x + 14, y + Math.round(height / 2 + fontSize / 2 - 5), width - 28);
}

function drawFittedText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number): void {
  let value = text;
  while (value.length > 1 && context.measureText(value).width > maxWidth) {
    value = `${value.slice(0, -2)}…`;
  }
  context.fillText(value, x, y);
}

function drawRoundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function sanitizeFilename(value: string): string {
  return value.replace(/[\\/:*?"<>|]+/g, "-").slice(0, 80) || "report";
}

function buildShareUrl(result: RunResult): string {
  const params = new URLSearchParams({ r: encodeCompactShareReport(result) });
  const url = new URL(window.location.href);
  url.pathname = sharePathname(url.pathname);
  url.search = params.toString();
  url.hash = "";
  return url.toString();
}

function readSharedReport(): SharedReport | undefined {
  try {
    const params = new URLSearchParams(window.location.search);
    const compact = params.get("r");
    if (compact) return decodeCompactShareReport(compact) ?? normalizeSharedReport(JSON.parse(decodeBase64Url(compact)));
    const raw = params.get("report");
    if (!raw) return undefined;
    return normalizeSharedReport(JSON.parse(decodeURIComponent(escape(window.atob(raw)))));
  } catch {
    return undefined;
  }
}

function encodeCompactShareReport(result: RunResult): string {
  const subjects = result.exams
    .map((exam) => `${subjectShareIndex(exam.subject).toString(36)}:${encodeShareNumber(exam.score)}`)
    .join("_");
  const artifacts = result.artifactIds
    .map((id) => artifactShareIndex(id))
    .filter((index) => index >= 0)
    .map((index) => index.toString(36))
    .join("_");
  return [
    "2",
    encodeBase64Url(state.playerName || "考生"),
    encodeBase64Url(result.seed),
    encodeShareNumber(result.totalScore),
    encodeShareNumber(result.year),
    encodeShareNumber(result.threshold),
    subjects || "-",
    artifacts || "-"
  ].join(".");
}

function decodeCompactShareReport(value: string): SharedReport | undefined {
  const [version, playerName, seed, score, year, threshold, subjects = "-", artifacts = "-"] = value.split(".");
  if (version !== "2" || !playerName || !seed || !score || !year || !threshold) return undefined;
  const decodedSubjects = decodeShareSubjects(subjects);
  return {
    playerName: decodeBase64Url(playerName),
    seed: decodeBase64Url(seed),
    score: decodeShareNumber(score),
    year: Math.max(1, decodeShareNumber(year)),
    threshold: Math.max(750, decodeShareNumber(threshold)),
    title: resultTitle(decodeShareNumber(score)),
    subjects: decodedSubjects.slice(0, 12),
    artifacts: decodeShareArtifacts(artifacts).slice(0, 120)
  };
}

function decodeShareSubjects(value: string): Array<{ label: string; score: string; scoreValue?: number }> {
  if (!value || value === "-") return [];
  return value
    .split("_")
    .map((entry) => {
      const [subjectIndexText, scoreText] = entry.split(":");
      const subject = subjectByShareIndex(Number.parseInt(subjectIndexText, 36));
      const score = decodeShareNumber(scoreText);
      if (!subject || !Number.isFinite(score)) return undefined;
      return { label: SUBJECT_LABELS[subject], score: formatNumber(score), scoreValue: score };
    })
    .filter((item): item is { label: string; score: string; scoreValue: number } => Boolean(item));
}

function decodeShareArtifacts(value: string): string[] {
  if (!value || value === "-") return [];
  const artifacts = allArtifacts();
  return value
    .split("_")
    .map((entry) => artifacts[Number.parseInt(entry, 36)]?.name)
    .filter((name): name is string => typeof name === "string");
}

function encodeShareNumber(value: number): string {
  return Math.max(0, Math.round(value)).toString(36);
}

function decodeShareNumber(value: string): number {
  return Number.parseInt(value, 36);
}

function subjectShareIndex(subject: SubjectId): number {
  return shareSubjects().indexOf(subject);
}

function subjectByShareIndex(index: number): SubjectId | undefined {
  return shareSubjects()[index];
}

function artifactShareIndex(artifactId: string): number {
  return allArtifacts().findIndex((artifact) => artifact.id === artifactId);
}

function shareSubjects(): SubjectId[] {
  return [...REQUIRED_SUBJECTS, ...ELECTIVE_SUBJECTS] as SubjectId[];
}

function encodeBase64Url(value: string): string {
  return window
    .btoa(unescape(encodeURIComponent(value)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return decodeURIComponent(escape(window.atob(base64)));
}

function sharePathname(pathname: string): string {
  return pathname.replace(/\/(?:debug|result-debug)(?:\/index\.html)?\/?$/, "/");
}

function normalizeSharedReport(value: unknown): SharedReport | undefined {
  if (!value || typeof value !== "object") return undefined;
  if (isCompactSharedReport(value)) {
    return {
      playerName: value.p,
      seed: value.s,
      score: Math.round(value.n),
      year: Math.max(1, Math.round(value.y)),
      threshold: Math.max(750, Math.round(value.t)),
      title: resultTitle(value.n),
      subjects: value.e
        .filter((item): item is [SubjectId, string] =>
          Array.isArray(item) && typeof item[0] === "string" && item[0] in SUBJECT_LABELS && typeof item[1] === "string"
        )
        .map(([subject, score]) => ({ label: SUBJECT_LABELS[subject], score, scoreValue: parseDisplayNumber(score) }))
        .slice(0, 12),
      artifacts: value.a
        .filter((id): id is string => typeof id === "string")
        .map((id) => findArtifact(id)?.name ?? id)
        .slice(0, 120)
    };
  }
  const report = value as Partial<SharedReport>;
  if (
    typeof report.playerName !== "string" ||
    typeof report.seed !== "string" ||
    typeof report.score !== "number" ||
    typeof report.year !== "number" ||
    typeof report.threshold !== "number" ||
    typeof report.title !== "string" ||
    !Array.isArray(report.subjects) ||
    !Array.isArray(report.artifacts)
  ) {
    return undefined;
  }
  return {
    playerName: report.playerName,
    seed: report.seed,
    score: Math.round(report.score),
    year: Math.max(1, Math.round(report.year)),
    threshold: Math.max(750, Math.round(report.threshold)),
    title: resultTitle(report.score),
    subjects: report.subjects
      .filter((item): item is { label: string; score: string } =>
        Boolean(item && typeof item === "object" && typeof item.label === "string" && typeof item.score === "string")
      )
      .map((item) => ({ ...item, scoreValue: parseDisplayNumber(item.score) }))
      .slice(0, 12),
    artifacts: report.artifacts.filter((item): item is string => typeof item === "string").slice(0, 120)
  };
}

function sharedReportScoreAdjustment(report: SharedReport): number {
  let subjectTotal = 0;
  for (const subject of report.subjects) {
    const score = subject.scoreValue ?? parseDisplayNumber(subject.score);
    if (typeof score !== "number" || !Number.isFinite(score)) return 0;
    subjectTotal += score;
  }
  return report.score - subjectTotal;
}

function parseDisplayNumber(value: string): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function isCompactSharedReport(value: unknown): value is {
  v: number;
  p: string;
  s: string;
  n: number;
  y: number;
  t: number;
  e: unknown[];
  a: unknown[];
} {
  if (!value || typeof value !== "object") return false;
  const report = value as Record<string, unknown>;
  return (
    report.v === 2 &&
    typeof report.p === "string" &&
    typeof report.s === "string" &&
    typeof report.n === "number" &&
    typeof report.y === "number" &&
    typeof report.t === "number" &&
    Array.isArray(report.e) &&
    Array.isArray(report.a)
  );
}

function currentScore(): number {
  return Math.round(
    state.exams.reduce((sum, exam) => sum + exam.score, 0) +
      (state.activeExam?.score ?? 0) +
      state.scoreAdjustment
  );
}

function showFooterNotice(message: string): void {
  state.footerNotice = message;
  render();
  window.setTimeout(() => {
    if (state.footerNotice === message) {
      state.footerNotice = undefined;
      render();
    }
  }, 3200);
}

function showCopyToast(message: string): void {
  state.copyToast = message;
  render();
  window.setTimeout(() => {
    if (state.copyToast === message) {
      state.copyToast = undefined;
      render();
    }
  }, 1800);
}

function toggleSubject(subject: SubjectId): void {
  if (!canEditOpening()) return;
  if (!ELECTIVE_SUBJECTS.includes(subject as never)) return;
  if (state.subjects.includes(subject)) {
    state.subjects = state.subjects.filter((item) => item !== subject);
    render();
    return;
  }
  if (state.subjects.length >= 3) return;
  state.subjects = [...state.subjects, subject];
  render();
}

function canEditOpening(): boolean {
  return state.phase === "start" || (state.exams.length === 0 && !state.activeExam && state.artifacts.length < 1);
}

function subjectOrder(): SubjectId[] {
  return [...REQUIRED_SUBJECTS, ...state.subjects];
}

function subjectOrderLabels(): string[] {
  return subjectOrder().map((subject) => SUBJECT_LABELS[subject]);
}

function selectedElectiveLabels(): string {
  return state.subjects.map((subject) => SUBJECT_LABELS[subject]).join(" / ") || "未选择";
}

function setSpeedMultiplier(value: number): void {
  if (!SPEED_MULTIPLIERS.includes(value as SpeedMultiplier)) return;
  state.speedMultiplier = value as SpeedMultiplier;
  state.speedMs = speedDelayMs(state.speedMultiplier);
  render();
}

function cycleSpeedMultiplier(): void {
  const currentIndex = SPEED_MULTIPLIERS.indexOf(state.speedMultiplier);
  const nextSpeed = SPEED_MULTIPLIERS[(currentIndex + 1) % SPEED_MULTIPLIERS.length];
  setSpeedMultiplier(nextSpeed);
  if (state.autoPlay) wakePlaybackDelays();
}

function restoreDefaultSpeed(): void {
  state.speedMultiplier = DEFAULT_SPEED_MULTIPLIER;
  state.speedMs = speedDelayMs(state.speedMultiplier);
  state.autoPlay = true;
}

function stopSkipForScoreArtifact(): void {
  if (!state.skipToSettlement) return;
  state.skipToSettlement = false;
  restoreDefaultSpeed();
  wakePlaybackDelays();
}

function speedDelayMs(multiplier: SpeedMultiplier): number {
  return Math.round(BASE_SPEED_MS / multiplier);
}

function scoreCollectDelayMs(): number {
  return Math.max(180, Math.min(360, Math.round(state.speedMs * 0.5)));
}

function scoreSettleHoldMs(): number {
  return Math.max(180, Math.min(420, Math.round(state.speedMs * 0.55)));
}

function triggerDelayMs(timing: TriggerEvent["timing"]): number {
  const factor = timing === "EXAM_END" ? 0.9 : 0.55;
  const floor = timing === "EXAM_END" ? 120 : 80;
  const chainAcceleration = Math.pow(0.82, Math.max(0, state.chainCount - 1));
  return Math.max(floor, Math.round(state.speedMs * factor * chainAcceleration));
}

function debugSearchResults(): ArtifactConfig[] {
  const keyword = state.debugSearch.trim().toLowerCase();
  const artifacts = keyword
    ? allArtifacts().filter((artifact) => artifactSearchText(artifact).includes(keyword))
    : allArtifacts();
  return artifacts.slice(0, 60);
}

function allArtifacts(): readonly ArtifactConfig[] {
  return LOCAL_ARTIFACTS as readonly ArtifactConfig[];
}

function artifactSearchText(artifact: ArtifactConfig): string {
  return [
    artifact.id,
    artifact.name,
    artifact.description,
    artifact.rarity,
    artifact.tags.join(" ")
  ].join(" ").toLowerCase();
}

function addDebugArtifact(id: string): void {
  const artifact = findArtifact(id);
  if (!artifact) return;
  const ownedCount = state.debugArtifactIds.filter((item) => item === id).length;
  if (ownedCount >= (artifact.maxCopies ?? 1)) return;
  state.debugArtifactIds = [...state.debugArtifactIds, id];
  persistDebugState();
  render();
}

function removeDebugArtifact(index: number): void {
  if (!Number.isInteger(index) || index < 0 || index >= state.debugArtifactIds.length) return;
  state.debugArtifactIds = state.debugArtifactIds.filter((_, itemIndex) => itemIndex !== index);
  persistDebugState();
  render();
}

function persistDebugState(): void {
  if (!DEBUG_ROUTE) return;
  try {
    window.localStorage.setItem("gaokao-debug-artifacts", JSON.stringify(state.debugArtifactIds));
  } catch {
    // Debug mode is still usable if localStorage is unavailable.
  }
}

function readDebugArtifactIds(): string[] {
  try {
    const raw = window.localStorage.getItem("gaokao-debug-artifacts");
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    const validIds = new Set(allArtifacts().map((artifact) => artifact.id));
    return parsed.filter((id): id is string => typeof id === "string" && validIds.has(id));
  } catch {
    return [];
  }
}

function createResultDebugRun(): RunResult {
  const subjects: SubjectId[] = ["chinese", "math", "english", "physics", "chemistry", "biology"];
  const exams: ExamLog[] = [
    debugExamLog("chinese", 123456, 15, 0, 82304, 1.5, 0),
    debugExamLog("math", 98765, 14, 1, 49382.5, 2, 0),
    debugExamLog("english", 76432, 13, 2, 76432, 1, 0),
    debugExamLog("physics", 54321, 9, 1, 27160.5, 2, 0),
    debugExamLog("chemistry", 43210, 8, 2, 21605, 2, 0),
    debugExamLog("biology", 32109, 7, 3, 32109, 1, 0)
  ];
  const artifacts = (LOCAL_ARTIFACTS as readonly ArtifactConfig[]).slice(0, 24);
  const totalScore = exams.reduce((sum, exam) => sum + exam.score, 0);
  return {
    seed: "result-debug-100000",
    subjects,
    year: 4,
    threshold: 100000,
    artifactIds: artifacts.map((artifact) => artifact.id),
    artifactNames: artifacts.map((artifact) => artifact.name),
    carryoverStats: {
      baseAccuracy: 88,
      baseStamina: 160,
      stamina: 160,
      staminaDecay: 3,
      staminaFloor: 0,
      artifactLimit: 24,
      draftChoicesBonus: 2,
      nextDraftChoicesBonus: 0,
      questionMultiplierBase: 3,
      currentTotalAdjustment: 0,
      luckyBlockValueMultiplier: 4,
      pendingNextExamScore: 0,
      preventDiscardCharges: 1
    },
    exams,
    totalScore,
    log: []
  };
}

function debugExamLog(
  subject: SubjectId,
  score: number,
  correctCount: number,
  wrongCount: number,
  rawScore: number,
  examMultiplier: number,
  examPostBonus: number
): ExamLog {
  return {
    subject,
    rawScore,
    examMultiplier,
    examPostBonus,
    score,
    correctCount,
    wrongCount,
    questions: []
  };
}

function artifactsForResult(result: RunResult): ArtifactConfig[] {
  return result.artifactIds
    .map((id) => findArtifact(id))
    .filter((artifact): artifact is ArtifactConfig => Boolean(artifact));
}

function isDebugRoute(): boolean {
  const path = window.location.pathname.replace(/\/+$/, "");
  return path.endsWith("/debug") || path.endsWith("/debug/index.html");
}

function isResultDebugRoute(): boolean {
  const path = window.location.pathname.replace(/\/+$/, "");
  return path.endsWith("/result-debug") || path.endsWith("/result-debug/index.html");
}

function rarityClass(rarity: ArtifactConfig["rarity"]): string {
  if (rarity === "special") return "legendary";
  if (rarity === "rare") return "epic";
  if (rarity === "uncommon") return "rare";
  return "common";
}

function rarityLabel(rarity: ArtifactConfig["rarity"]): string {
  if (rarity === "special") return "传说";
  if (rarity === "rare") return "史诗";
  if (rarity === "uncommon") return "稀有";
  return "普通";
}

function resetRunState(): void {
  state.artifacts = [];
  state.exams = [];
  state.examQuestions = [];
  state.logs = [];
  state.visualEvents = [];
  state.triggerQueue = [];
  state.activeTrigger = undefined;
  state.examSettlement = undefined;
  state.liveStatus = {
    accuracy: 50,
    questionMultiplier: 1,
    examMultiplier: 1,
    baseStamina: 100,
    stamina: 100
  };
  state.chainCount = 0;
  state.scoreFlash = undefined;
  state.scoreAdjustment = 0;
  state.draftSequence = 0;
  state.choicePrompt = undefined;
  state.activeExam = undefined;
  state.currentQuestion = undefined;
  state.settlementContinue = undefined;
  state.skipToSettlement = false;
  state.result = undefined;
  state.sharedReport = undefined;
  state.scoreChoicePrompt = undefined;
  restoreDefaultSpeed();
}

function resetToStart(newSeed: boolean): void {
  state.runId += 1;
  if (newSeed) state.seed = defaultSeed();
  resetRunState();
  state.phase = "start";
  render();
}

function resetResultDebug(): void {
  const result = createResultDebugRun();
  state.runId += 1;
  resetRunState();
  state.phase = "result";
  state.seed = result.seed;
  state.playerName = "结算页调试";
  state.subjects = result.subjects;
  state.artifacts = artifactsForResult(result);
  state.exams = result.exams;
  state.logs = result.log;
  state.result = result;
  state.endlessActive = true;
  state.endlessYear = result.year;
  state.scoreThreshold = result.threshold;
  render();
}

async function restartRun(newSeed: boolean): Promise<void> {
  state.runId += 1;
  if (newSeed) state.seed = defaultSeed();
  state.endlessActive = false;
  state.endlessYear = 1;
  state.scoreThreshold = 750;
  resetRunState();
  state.phase = "loading";
  render();
  const runId = state.runId;
  const initialArtifacts = DEBUG_ROUTE ? state.debugArtifactIds.slice() : undefined;
  const options = {
    seed: state.seed,
    subjects: state.subjects,
    initialArtifacts,
    autoPolicy: initialArtifacts ? "first" as const : undefined
  };

  await runGame(LOCAL_ARTIFACTS, options, createRunHooks(runId));
  if (isCurrentRun(runId)) render();
}

async function continueEndlessRun(): Promise<void> {
  const previous = state.result;
  if (!previous || previous.totalScore <= previous.threshold) {
    return;
  }
  state.runId += 1;
  state.endlessActive = true;
  state.endlessYear = previous.year + 1;
  state.scoreThreshold = nextEndlessThreshold(previous.threshold);
  state.seed = `${previous.seed}-Y${state.endlessYear}`;
  resetRunState();
  state.phase = "loading";
  render();
  const runId = state.runId;
  const options = {
    seed: state.seed,
    subjects: state.subjects,
    initialArtifacts: previous.artifactIds,
    initialArtifactMode: "load" as const,
    carryoverStats: previous.carryoverStats,
    year: state.endlessYear,
    threshold: state.scoreThreshold,
    openingDrafts: 0,
    preExamDrafts: true,
    postExamDrafts: false
  };

  await runGame(LOCAL_ARTIFACTS, options, createRunHooks(runId));
  if (isCurrentRun(runId)) render();
}

function createRunHooks(runId: number): ChoiceHooks {
  return {
    chooseArtifact: (choices, reason) => promptChoice(runId, choices, reason, false),
    chooseDiscard: (owned) => promptChoice(runId, owned, "遗物已达上限", true),
    onLog: (line) => {
      if (!isCurrentRun(runId)) return;
      state.logs = [...state.logs, line];
      recordVisualEvent(line);
    },
    onTrigger: async (event) => {
      if (!isCurrentRun(runId)) return;
      await playTriggerEvent(runId, event);
    },
    chooseOnesDigit: async (score, subject) => {
      stopSkipForScoreArtifact();
      return (await promptOnesDigitChoice(runId, score, subject)) ?? 9;
    },
    chooseDigitSwap: (score, subject) => {
      stopSkipForScoreArtifact();
      return promptDigitSwapChoice(runId, score, subject);
    },
    onArtifactsChanged: (owned) => {
      if (!isCurrentRun(runId)) return;
      state.artifacts = owned;
    },
    onExamStart: (exam) => {
      if (!isCurrentRun(runId)) return;
      state.phase = "exam";
      state.examQuestions = [];
      state.visualEvents = [];
      state.triggerQueue = [];
      state.activeTrigger = undefined;
      state.examSettlement = undefined;
      state.chainCount = 0;
      state.scoreFlash = undefined;
      state.scoreAdjustment = 0;
      state.currentQuestion = undefined;
      state.liveStatus = exam.status;
      state.activeExam = {
        index: exam.index,
        subject: exam.subject,
        questionIndex: 0,
        score: exam.startingScore
      };
      render();
    },
    beforeQuestion: async (exam) => {
      if (!isCurrentRun(runId)) return;
      state.phase = "exam";
      state.liveStatus = exam.status;
      state.activeTrigger = undefined;
      state.triggerQueue = [];
      state.examSettlement = undefined;
      state.chainCount = 0;
      state.scoreFlash = undefined;
      state.activeExam = {
        index: exam.index,
        subject: exam.subject,
        questionIndex: exam.questionIndex,
        score: state.activeExam?.score ?? 0
      };
      if (state.skipToSettlement) return;
      render();
      await waitForNextQuestion(runId);
    },
    onQuestion: async (question, exam) => {
      if (!isCurrentRun(runId)) return;
      const scoreGained = roundDelta(question.scoreGained);
      const examScoreAfter = roundDelta(exam.rawScore);
      const examScoreBefore = roundDelta(examScoreAfter - scoreGained);
      const hasBankingScore = Math.abs(scoreGained) > 0.0001;
      state.currentQuestion = question;
      state.examQuestions = [...state.examQuestions, question];
      state.liveStatus = exam.status;
      state.activeExam = {
        index: exam.index,
        subject: exam.subject,
        questionIndex: question.questionIndex,
        score: hasBankingScore ? examScoreBefore : examScoreAfter
      };
      state.scoreAdjustment = exam.currentTotalAdjustment;
      if (state.skipToSettlement) return;
      if (!hasBankingScore && !question.correct) {
        state.scoreFlash = undefined;
        render();
        await playbackDelay(runId, scoreCollectDelayMs());
        return;
      }
      const visualEvent: VisualEvent = {
        id: `score-${Date.now()}-${question.questionIndex}`,
        label: hasBankingScore ? formatDelta(scoreGained) : question.correct ? "判定成功" : "失误",
        tone: hasBankingScore ? "score" : question.correct ? "score" : "fail",
        kind: hasBankingScore ? "score:bank" : question.correct ? "score:add" : "score:fail",
        intensity: scoreIntensity(Math.abs(scoreGained), exam.status),
        detailText: questionBankingDetail(question, scoreGained),
        scoreDelta: scoreGained,
        scoreBefore: roundDelta(exam.currentTotalScore - scoreGained),
        scoreAfter: exam.currentTotalScore,
        examScoreBefore,
        examScoreAfter,
        scoreBanking: hasBankingScore
      };
      state.scoreFlash = visualEvent;
      state.visualEvents = [visualEvent, ...state.visualEvents].slice(0, 12);
      render();
      await settleScoreFlash(runId, visualEvent);
    },
    onExamEnd: async (exam) => {
      if (!isCurrentRun(runId)) return;
      const visualEvent: VisualEvent = {
        id: `settlement-${Date.now()}-${exam.subject}`,
        label: formatDelta(exam.score),
        tone: "score",
        kind: "score:add",
        intensity: scoreIntensity(exam.score, state.liveStatus)
      };
      state.exams = [...state.exams, exam];
      state.activeExam = state.activeExam
        ? {
            ...state.activeExam,
            score: 0
          }
        : state.activeExam;
      state.scoreAdjustment = 0;
      state.scoreFlash = visualEvent;
      state.visualEvents = [visualEvent, ...state.visualEvents].slice(0, 12);
      state.examSettlement = exam;
      state.skipToSettlement = false;
      restoreDefaultSpeed();
      render();
      await waitForExamSettlement(runId);
      if (!isCurrentRun(runId)) return;
      state.examSettlement = undefined;
      state.scoreFlash = undefined;
      render();
    },
    onRunEnd: (result) => {
      if (!isCurrentRun(runId)) return;
      state.result = result;
      state.examSettlement = undefined;
      restoreDefaultSpeed();
      state.phase = "result";
    }
  };
}

function promptChoice(
  runId: number,
  choices: ArtifactConfig[],
  reason: string,
  discard: boolean
): Promise<number> {
  if (!isCurrentRun(runId)) return Promise.resolve(0);
  state.phase = "draft";
  return new Promise((resolve) => {
    const sequence = discard ? state.draftSequence : state.draftSequence + 1;
    if (!discard) {
      state.draftSequence = sequence;
    }
    state.choicePrompt = {
      reason,
      choices,
      discard,
      sequence,
      resolve: (index) => {
        state.choicePrompt = undefined;
        resolve(index);
        render();
      }
    };
    render();
  });
}

function promptOnesDigitChoice(runId: number, score: number, subject: SubjectId): Promise<number | undefined> {
  const roundedScore = Math.round(score);
  const options = Array.from({ length: 10 }, (_, digit) => {
    const preview = previewOnesDigit(roundedScore, digit);
    return {
      label: `个位 ${digit}`,
      value: digit,
      preview,
      delta: roundDelta(preview - roundedScore)
    };
  }).sort((a, b) => b.preview - a.preview);
  return promptScoreChoice(runId, {
    mode: "onesDigit",
    subject,
    score: roundedScore,
    options
  }).then((value) => (typeof value === "number" ? value : undefined));
}

function promptDigitSwapChoice(
  runId: number,
  score: number,
  subject: SubjectId
): Promise<[number, number] | undefined> {
  const roundedScore = Math.round(score);
  return promptScoreChoice(runId, {
    mode: "digitSwap",
    subject,
    score: roundedScore,
    options: []
  }).then((value) => (Array.isArray(value) ? value : undefined));
}

function promptScoreChoice(
  runId: number,
  prompt: Omit<ScoreChoicePrompt, "resolve">
): Promise<number | [number, number] | undefined> {
  if (!isCurrentRun(runId)) return Promise.resolve(undefined);
  return new Promise((resolve) => {
    state.scoreChoicePrompt = {
      ...prompt,
      resolve: (value) => {
        state.scoreChoicePrompt = undefined;
        resolve(value);
        render();
      }
    };
    render();
  });
}

function resolveScoreChoice(index: number): void {
  const prompt = state.scoreChoicePrompt;
  if (!prompt) return;
  const option = prompt.options[index];
  if (!option) return;
  prompt.resolve(option.value);
}

function resolveScorePosition(index: number): void {
  const prompt = state.scoreChoicePrompt;
  if (!prompt || prompt.mode !== "digitSwap") return;
  const digits = scoreDigits(prompt.score);
  if (!Number.isInteger(index) || index < 0 || index >= digits.length) return;
  if (prompt.selectedPosition === undefined) {
    state.scoreChoicePrompt = { ...prompt, selectedPosition: index };
    render();
    return;
  }
  if (prompt.selectedPosition === index) {
    state.scoreChoicePrompt = { ...prompt, selectedPosition: undefined };
    render();
    return;
  }
  prompt.resolve([prompt.selectedPosition, index]);
}

function skipScoreSwap(): void {
  const prompt = state.scoreChoicePrompt;
  if (!prompt || prompt.mode !== "digitSwap") return;
  prompt.resolve([0, 0]);
}

function resetScoreSwap(): void {
  const prompt = state.scoreChoicePrompt;
  if (!prompt || prompt.mode !== "digitSwap") return;
  state.scoreChoicePrompt = { ...prompt, selectedPosition: undefined };
  render();
}

function previewOnesDigit(score: number, digit: number): number {
  return score - (Math.abs(score) % 10) + digit;
}

function previewDigitSwap(score: number, swap: [number, number]): number {
  const sign = score < 0 ? -1 : 1;
  const chars = Math.abs(score).toString().split("");
  const [left, right] = swap;
  if (left < 0 || right < 0 || left >= chars.length || right >= chars.length || left === right) {
    return score;
  }
  [chars[left], chars[right]] = [chars[right], chars[left]];
  return sign * Number(chars.join(""));
}

function scoreDigits(score: number): string[] {
  return Math.abs(Math.round(score)).toString().split("");
}

function digitPlaceLabel(index: number, length: number): string {
  const places = ["个位", "十位", "百位", "千位", "万位", "十万位", "百万位", "千万位", "亿位"];
  const placeIndex = length - index - 1;
  return places[placeIndex] ?? `第 ${index + 1} 位`;
}

function waitForNextQuestion(runId: number): Promise<void> {
  if (!isCurrentRun(runId)) return Promise.resolve();
  return playbackDelay(runId, state.speedMs);
}

function waitForExamSettlement(runId: number): Promise<void> {
  if (!isCurrentRun(runId)) return Promise.resolve();
  return new Promise((resolve) => {
    state.settlementContinue = () => {
      state.settlementContinue = undefined;
      resolve();
      render();
    };
  });
}

async function playTriggerEvent(runId: number, event: TriggerEvent): Promise<void> {
  if (state.skipToSettlement) {
    state.liveStatus = event.after;
    if (state.activeExam) {
      state.activeExam = {
        ...state.activeExam,
        score: visibleTriggerExamScore(event)
      };
    }
    state.scoreAdjustment = event.scoreAfter.currentTotalAdjustment;
    return;
  }
  const visualEvent = triggerEventToVisual(event);
  state.chainCount += 1;
  state.triggerQueue = [...state.triggerQueue, visualEvent];
  state.activeTrigger = visualEvent;
  state.liveStatus = event.after;
  if (state.activeExam) {
    state.activeExam = {
      ...state.activeExam,
      score: visibleTriggerExamScore(event)
    };
  }
  state.scoreAdjustment = event.scoreAfter.currentTotalAdjustment;
  state.visualEvents = [visualEvent, ...state.visualEvents].slice(0, 12);
  render();
  const triggerDelay = triggerDelayMs(event.timing);
  if (triggerDelay > 0) {
    await playbackDelay(runId, triggerDelay);
  }
  if (!isCurrentRun(runId)) return;
  state.triggerQueue = state.triggerQueue.filter((item) => item.id !== visualEvent.id);
}

function visibleTriggerExamScore(event: TriggerEvent): number {
  const pendingQuestionScore =
    event.questionScoreGained &&
    (event.timing === "QUESTION_END" || (event.timing === "OTHER_ARTIFACT_TRIGGERED" && event.sourceTiming === "QUESTION_END"))
      ? event.questionScoreGained
      : 0;
  return roundDelta(event.scoreAfter.currentExamScore - pendingQuestionScore);
}

async function settleScoreFlash(runId: number, visualEvent: VisualEvent): Promise<void> {
  await playbackDelay(runId, scoreCollectDelayMs());
  if (!isCurrentRun(runId) || state.scoreFlash?.id !== visualEvent.id) return;
  const shouldBankScore = Boolean(
    visualEvent.scoreBanking &&
      state.activeExam &&
      visualEvent.examScoreAfter !== undefined &&
      Math.abs((visualEvent.scoreDelta ?? 0)) > 0.0001
  );
  if (shouldBankScore && state.activeExam && visualEvent.examScoreAfter !== undefined) {
    state.activeExam = {
      ...state.activeExam,
      score: visualEvent.examScoreAfter
    };
  }
  state.scoreFlash = { ...state.scoreFlash, settling: shouldBankScore };
  render();
  await playbackDelay(runId, scoreSettleHoldMs());
  if (!isCurrentRun(runId) || state.scoreFlash?.id !== visualEvent.id) return;
  state.scoreFlash = undefined;
  render();
}

function triggerEventToVisual(event: TriggerEvent): VisualEvent {
  const scoreDelta = roundDelta(event.scoreAfter.currentTotal - event.scoreBefore.currentTotal);
  return {
    id: `${Date.now()}-${event.slotIndex}-${event.triggerIndex}-${state.visualEvents.length}`,
    label: event.artifactName,
    tone: Math.abs(scoreDelta) > 0.0001 ? (scoreDelta > 0 ? "score" : "fail") : event.replay ? "chain" : "term",
    kind: triggerKind(event),
    intensity: triggerIntensity(event, state.chainCount + 1),
    artifactId: event.artifactId,
    effectText: event.effectText,
    deltas: diffStatus(event.before, event.after),
    scoreDelta,
    scoreBefore: event.scoreBefore.currentTotal,
    scoreAfter: event.scoreAfter.currentTotal,
    slotIndex: event.slotIndex,
    replay: event.replay,
    chainIndex: state.chainCount + 1
  };
}

function triggerKind(event: TriggerEvent): VisualEventKind {
  const scoreDelta = event.scoreAfter.currentTotal - event.scoreBefore.currentTotal;
  if (Math.abs(scoreDelta) > 0.0001) return scoreDelta > 0 ? "score:add" : "score:fail";
  const questionDelta = event.after.questionMultiplier - event.before.questionMultiplier;
  const examDelta = event.after.examMultiplier - event.before.examMultiplier;
  if (event.after.examMultiplier >= 50 || event.after.questionMultiplier >= 50) return "jackpot:trigger";
  if (questionDelta > 0 || examDelta > 0) return "multiplier:increase";
  return event.replay ? "chain:step" : "multiplier:increase";
}

function triggerIntensity(event: TriggerEvent, chainIndex: number): EffectIntensity {
  const biggestMultiplier = Math.max(event.after.questionMultiplier, event.after.examMultiplier);
  const scoreDelta = Math.abs(event.scoreAfter.currentTotal - event.scoreBefore.currentTotal);
  const multiplierDelta = Math.max(
    event.after.questionMultiplier - event.before.questionMultiplier,
    event.after.examMultiplier - event.before.examMultiplier
  );
  const staminaDelta = Math.abs(event.after.stamina - event.before.stamina);
  if (scoreDelta >= 250) return "jackpot";
  if (scoreDelta >= 100) return "high";
  if (scoreDelta >= 30) return "medium";
  if (biggestMultiplier >= 50 || multiplierDelta >= 25 || chainIndex >= 10) return "jackpot";
  if (biggestMultiplier >= 25 || multiplierDelta >= 10 || chainIndex >= 6) return "high";
  if (biggestMultiplier >= 10 || multiplierDelta >= 2 || staminaDelta >= 40 || chainIndex >= 3) return "medium";
  return "low";
}

function scoreIntensity(scoreGained: number, status: LiveExamStatus): EffectIntensity {
  const multiplier = Math.max(status.questionMultiplier, status.examMultiplier);
  if (scoreGained >= 250 || multiplier >= 50) return "jackpot";
  if (scoreGained >= 100 || multiplier >= 25) return "high";
  if (scoreGained >= 30 || multiplier >= 10) return "medium";
  return "low";
}

function questionBankingDetail(question: QuestionLog, scoreGained: number): string {
  if (Math.abs(scoreGained) <= 0.0001) {
    return question.correct ? "本题 0 分" : "本题未得分";
  }
  const base = question.questionBaseScore;
  const multiplier = question.questionMultiplier;
  const flat = question.questionFlatScore;
  const flatText = Math.abs(flat) > 0.0001 ? ` ${formatDelta(flat)}` : "";
  return `基础 ${formatNumber(base)} x${formatNumber(multiplier)}${flatText} = ${formatDelta(scoreGained)}`;
}

function diffStatus(before: LiveExamStatus, after: LiveExamStatus): StatDelta[] {
  const items: Array<[keyof LiveExamStatus, string]> = [
    ["accuracy", "正确率"],
    ["questionMultiplier", "本题倍率"],
    ["examMultiplier", "考试倍率"],
    ["baseStamina", "基础体力"],
    ["stamina", "体力"]
  ];
  return items
    .map(([key, label]) => ({
      key,
      label,
      value: roundDelta(after[key] - before[key]),
      before: before[key],
      after: after[key]
    }))
    .filter((item) => Math.abs(item.value) > 0.0001);
}

function roundDelta(value: number): number {
  return Math.round(value * 10000) / 10000;
}

function recordVisualEvent(line: string): void {
  const triggerPrefix = "触发遗物: ";
  const gainPrefix = "获得遗物: ";
  if (line.startsWith(triggerPrefix)) {
    return;
  }
  if (line.startsWith(gainPrefix)) {
    const name = line.slice(gainPrefix.length);
    const visualEvent: VisualEvent = {
      id: `${Date.now()}-${state.visualEvents.length}`,
      label: name,
      tone: "chain",
      kind: "chain:step",
      intensity: "low"
    };
    state.visualEvents = [visualEvent, ...state.visualEvents].slice(0, 12);
  }
}

function isCurrentRun(runId: number): boolean {
  return runId === state.runId;
}

function wakePlaybackDelays(): void {
  const resolvers = playbackDelayResolvers;
  playbackDelayResolvers = [];
  for (const resolve of resolvers) resolve();
}

function nextPlaybackWake(): { promise: Promise<void>; cancel: () => void } {
  let resolveWake!: () => void;
  const promise = new Promise<void>((resolve) => {
    resolveWake = resolve;
  });
  playbackDelayResolvers.push(resolveWake);
  return {
    promise,
    cancel: () => {
      playbackDelayResolvers = playbackDelayResolvers.filter((resolve) => resolve !== resolveWake);
    }
  };
}

async function playbackDelay(runId: number, ms: number): Promise<void> {
  let remaining = Math.max(0, ms);
  let speedAtLastCheck = state.speedMultiplier;
  while (remaining > 0) {
    if (!isCurrentRun(runId)) return;
    if (state.speedMs <= 0) return;
    if (state.speedMultiplier !== speedAtLastCheck) {
      remaining = Math.max(0, remaining * (speedAtLastCheck / state.speedMultiplier));
      speedAtLastCheck = state.speedMultiplier;
    }
    if (!state.autoPlay) {
      const wake = nextPlaybackWake();
      await wake.promise;
      wake.cancel();
      continue;
    }
    const wake = nextPlaybackWake();
    const started = performance.now();
    await Promise.race([delay(remaining), wake.promise]);
    wake.cancel();
    if (!isCurrentRun(runId)) return;
    remaining = Math.max(0, remaining - (performance.now() - started));
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function defaultSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return String(value);
  const rounded = Math.round(value * 100) / 100;
  if (Math.abs(rounded) >= 100000) {
    return formatScientific(rounded);
  }
  return String(rounded);
}

function formatScientific(value: number): string {
  const [mantissa = "0", exponent = "0"] = value.toExponential(2).split("e");
  const compactMantissa = mantissa.replace(/\.?0+$/, "");
  const compactExponent = (exponent.replace(/^\+/, "").replace(/^(-?)0+/, "$1") || "0");
  return `${compactMantissa}e${compactExponent}`;
}

function formatDelta(value: number, key?: keyof LiveExamStatus): string {
  const prefix = value > 0 ? "+" : "";
  const suffix = key === "stamina" || key === "baseStamina" || key === "accuracy" ? "%" : "";
  return `${prefix}${formatNumber(value)}${suffix}`;
}

function multiplierHeat(value: number): "cool" | "warm" | "hot" | "overdrive" {
  if (value >= 50) return "overdrive";
  if (value >= 25) return "hot";
  if (value >= 10) return "warm";
  return "cool";
}

function cssSafeKind(kind: VisualEventKind): string {
  return kind.replace(":", "-");
}

function readPlayerName(): string {
  try {
    return window.localStorage.getItem("gaokao-player-name") ?? "考生";
  } catch {
    return "考生";
  }
}

function escapeHtml(value: unknown): string {
  return String(value).replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return map[char] ?? char;
  });
}

function escapeAttr(value: unknown): string {
  return escapeHtml(value);
}
