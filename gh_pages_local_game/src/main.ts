import { LOCAL_ARTIFACTS } from "./artifacts.generated.js";
import {
  ELECTIVE_SUBJECTS,
  REQUIRED_SUBJECTS,
  runGame,
  SUBJECT_LABELS,
  type ArtifactConfig,
  type ExamLog,
  type LiveExamStatus,
  type QuestionLog,
  type RunResult,
  type SubjectId,
  type TriggerEvent
} from "./core/browser.js";

const root = requireElement("root");
const DEBUG_ROUTE = isDebugRoute();

type Phase = "start" | "loading" | "draft" | "exam" | "result";
type EventTone = "score" | "term" | "chain" | "fail" | "idle";
type EffectIntensity = "low" | "medium" | "high" | "jackpot";
type VisualEventKind =
  | "score:add"
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
  deltas?: StatDelta[];
  scoreDelta?: number;
  scoreBefore?: number;
  scoreAfter?: number;
  slotIndex?: number;
  replay?: boolean;
  chainIndex?: number;
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
  liveStatus: LiveExamStatus;
  chainCount: number;
  scoreFlash?: VisualEvent;
  scoreAdjustment: number;
  draftSequence: number;
  choicePrompt?: ChoicePrompt;
  activeExam?: { index: number; subject: SubjectId; questionIndex: number; score: number };
  currentQuestion?: QuestionLog;
  waitingNext?: () => void;
  result?: RunResult;
  scoreChoicePrompt?: ScoreChoicePrompt;
  autoPlay: boolean;
  speedMs: number;
  debugArtifactIds: string[];
  debugSearch: string;
  footerNotice?: string;
  footerOpen: boolean;
}

const state: UiState = {
  runId: 0,
  phase: "start",
  seed: defaultSeed(),
  playerName: readPlayerName(),
  subjects: ELECTIVE_SUBJECTS.slice(0, 3) as SubjectId[],
  artifacts: [],
  exams: [],
  examQuestions: [],
  logs: [],
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
  autoPlay: true,
  speedMs: 920,
  debugArtifactIds: DEBUG_ROUTE ? readDebugArtifactIds() : [],
  debugSearch: "",
  footerOpen: false
};

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
    void restartRun(false);
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
  if (action === "next-question") {
    state.waitingNext?.();
    return;
  }
  if (action === "toggle-auto") {
    state.autoPlay = !state.autoPlay;
    state.waitingNext?.();
    render();
    return;
  }
  if (action === "sprint") {
    state.autoPlay = true;
    state.speedMs = 0;
    state.waitingNext?.();
    return;
  }
  if (action === "copy-feedback") {
    state.footerOpen = true;
    void copyIssueTemplate();
    return;
  }
});

root.addEventListener("toggle", (event) => {
  const details = event.target as HTMLDetailsElement;
  if (details.dataset.section !== "footer") return;
  state.footerOpen = details.open;
}, true);

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
    state.debugSearch = input.value;
    render();
  }
});

render();

function render(): void {
  const intensity = state.activeTrigger?.intensity ?? state.scoreFlash?.intensity ?? "low";
  const activeKind = state.activeTrigger?.kind ?? state.scoreFlash?.kind ?? "chain:step";
  root.innerHTML = `
    <div class="app-shell fx-${intensity} kind-${cssSafeKind(activeKind)} ${state.activeTrigger ? "chain-live" : ""}">
      ${renderTopbar()}
      <main class="paper-field">${renderPhase()}</main>
      ${renderGlobalTriggerToast()}
      ${renderScoreChoicePrompt()}
      ${renderFooter()}
    </div>
  `;
}

function requireElement(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing #${id}`);
  }
  return element;
}

function renderTopbar(): string {
  const subjectSummary = subjectOrderLabels().join(" / ");
  return `
    <header class="topbar">
      <div class="brand">
        <span class="brand-mark">准</span>
        <span>请选择你的高考遗物</span>
      </div>
      <div class="topbar-actions">
        <span class="topbar-subjects">${escapeHtml(subjectSummary)}</span>
        ${DEBUG_ROUTE ? `<span class="local-mode debug-mode-chip">DEBUG ${state.debugArtifactIds.length}</span>` : ""}
        <span class="seed">SEED ${escapeHtml(state.seed)}</span>
        <button class="ghost-button" type="button" data-action="restart">重开</button>
      </div>
    </header>
  `;
}

function renderPhase(): string {
  if (state.phase === "start") return renderStart();
  if (state.phase === "draft" && state.choicePrompt) return renderDraft(state.choicePrompt);
  if (state.phase === "exam" && state.activeExam) return renderExam();
  if (state.phase === "result" && state.result) return renderResult(state.result);
  return renderLoading();
}

function renderGlobalTriggerToast(): string {
  if (state.phase === "exam" || !state.activeTrigger) return "";
  const event = state.activeTrigger;
  const scoreDelta = event.scoreDelta;
  const detail = typeof scoreDelta === "number" && Math.abs(scoreDelta) > 0.0001
    ? `分数 ${formatDelta(scoreDelta)}`
    : event.effectText || "联动生效";
  return `
    <div class="global-trigger-toast toast-${event.tone} toast-${event.intensity}" role="status">
      <span>${event.replay ? "复触发" : "触发"}</span>
      <strong>${escapeHtml(event.label)}</strong>
      <small>${escapeHtml(detail)}</small>
    </div>
  `;
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
  return `
    <section class="start-screen">
      <div class="start-layout">
        <section class="start-panel answer-card-panel">
          <div class="answer-card-title">
            <p class="mono-label">ADMISSION CARD</p>
            <h1>请选择你的高考遗物</h1>
          </div>
          <div class="answer-card-sheet" aria-label="答题卡开局设置">
            <div class="sheet-secret-line">姓名、准考证号填写处</div>
            ${renderTicketProfile(state.subjects)}
            <div class="sheet-bubbles" aria-hidden="true">
              ${Array.from({ length: 36 }, (_, index) => renderStartBubble(index)).join("")}
            </div>
          </div>
          <div class="rules-note">
            <div><span>必考</span><strong>${REQUIRED_SUBJECTS.map((subject) => SUBJECT_LABELS[subject]).join(" / ")}</strong></div>
            <div><span>选科</span><strong>${selectedElectiveLabels()}</strong></div>
            <div><span>遗物</span><strong>${DEBUG_ROUTE ? `DEBUG ${state.debugArtifactIds.length} 件` : "开局 6 抽"}</strong></div>
          </div>
          <div class="start-actions">
            <button class="primary-button full-width" type="button" data-action="start-run">开始考试</button>
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

function renderStartBubble(index: number): string {
  const filled = state.subjects.length * 3 > index || index % 11 === 0;
  return `<span class="${filled ? "filled" : ""}"></span>`;
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
  return `
    <section class="draft-screen">
      <div class="draft-heading">
        <p class="mono-label">${
          prompt.discard ? "OVERFLOW DISCARD" : opening ? `OPENING ROLL ${rollIndex}/6` : "NEXT SUBJECT ROLL"
        }</p>
        <h1>${prompt.discard ? "遗物已达上限" : opening ? `请选择你的遗物 ${rollIndex}/6` : "请选择你的遗物"}</h1>
        ${prompt.discard ? "<p>选择一件遗物丢弃，为新遗物腾出位置。</p>" : ""}
        ${opening ? renderTicketProfile(selected) : ""}
      </div>
      <div class="draft-grid">
        ${prompt.choices.map((artifact, index) => renderDraftCard(artifact, index)).join("")}
      </div>
      ${prompt.discard ? "" : `<button class="secondary-button skip-draft-button" type="button" data-action="skip-draft">跳过，不拿遗物</button>`}
      ${renderExistingBuild()}
    </section>
  `;
}

function renderTicketProfile(selected: SubjectId[]): string {
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
          <span>选科</span>
          <strong>${subjectOrderLabels().join(" / ")}</strong>
        </div>
        <div class="subject-chip-row">
          ${ELECTIVE_SUBJECTS.map((subject) => renderSubjectChip(subject, selected.includes(subject))).join("")}
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
          value="${escapeAttr(state.debugSearch)}"
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

function renderSubjectChip(subject: SubjectId, active: boolean): string {
  return `
    <button type="button" class="${active ? "subject-chip active" : "subject-chip"}" data-subject="${subject}">
      ${SUBJECT_LABELS[subject]}
    </button>
  `;
}

function renderDraftCard(artifact: ArtifactConfig, index: number): string {
  return `
    <button class="draft-card rarity-${rarityClass(artifact.rarity)}" type="button" data-choice="${index}">
      <div class="draft-card-top">
        <div class="term-corner">
          <span class="rarity">${rarityLabel(artifact.rarity)}</span>
        </div>
      </div>
      <h2>${escapeHtml(artifact.name)}</h2>
      <p>${escapeHtml(artifact.description)}</p>
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
  const pending = Math.max(0, 15 - Math.min(15, exam.questionIndex));
  const intensity = state.activeTrigger?.intensity ?? state.scoreFlash?.intensity ?? "low";
  return `
    <section class="game-grid compact-exam-grid">
      <section class="exam-stage exam-paper fx-stage fx-${intensity}" aria-label="当前答题与词条触发">
        ${renderExamHeader(exam, pending)}
        ${renderScreenFx()}
        ${renderTriggerOverlay()}
        <div class="exam-priority">
          ${renderQuestionCard(exam, question)}
          ${renderTriggerStage()}
        </div>
        <div class="exam-controls">
          <button class="primary-button" type="button" data-action="next-question" ${state.waitingNext ? "" : "disabled"}>判定下一题</button>
          <button class="secondary-button" type="button" data-action="toggle-auto">${state.autoPlay ? "暂停自动" : "继续自动"}</button>
          <button class="secondary-button" type="button" data-action="sprint">快速跳过</button>
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

function renderPaperStatusTile(label: string, value: string, key: keyof LiveExamStatus, idleText = "当前"): string {
  const delta = state.activeTrigger?.deltas?.find((item) => item.key === key);
  const intensity = delta ? state.activeTrigger?.intensity ?? "low" : "low";
  const heat = key === "questionMultiplier" || key === "examMultiplier"
    ? multiplierHeat(state.liveStatus[key])
    : "cool";
  return `
    <div class="paper-status-tile status-${key} heat-${heat} ${delta ? `status-pulse intensity-${intensity}` : ""}">
      ${delta ? `<b class="status-delta">${formatDelta(delta.value, key)}</b>` : ""}
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${delta ? `${formatNumber(delta.before)} -> ${formatNumber(delta.after)}` : idleText}</small>
    </div>
  `;
}

function renderExamHeader(exam: NonNullable<UiState["activeExam"]>, pending: number): string {
  const done = Math.min(15, exam.questionIndex);
  const total = state.exams.reduce((sum, item) => sum + item.score, 0) + exam.score + state.scoreAdjustment;
  const progress = Math.min(100, (done / 15) * 100);
  const trigger = state.activeTrigger;
  const flash = trigger ?? state.scoreFlash;
  return `
    <div class="exam-paper-header compact-paper-header">
      <span class="secret-line">★ 考试状态 ★</span>
      <div class="paper-id-pattern" aria-hidden="true">
        <span>准考证号 ${escapeHtml(state.seed.slice(0, 10).toUpperCase())}</span>
        <i></i>
      </div>
      <div class="paper-status-layout" aria-label="当前考试状态">
        <div class="paper-title-block compact-paper-title">
          <p class="mono-label">AUTO EXAM STATUS</p>
          <h2>${SUBJECT_LABELS[exam.subject]}</h2>
          <small>第 ${exam.index + 1}/${subjectOrder().length} 场 · 答题点 ${done}/15 · 剩余 ${pending}</small>
        </div>
        <div class="paper-score-total score-box-total ${flash ? `score-flash flash-${flash.intensity}` : ""}">
          <span>总分</span>
          <strong class="${total > 750 ? "over-score" : ""}">${Math.round(total)}</strong>
          <small>${flash?.kind === "score:add" ? escapeHtml(flash.label) : "累计"}</small>
        </div>
        <div class="paper-status-grid">
          ${renderPaperStatusTile("正确率", `${formatNumber(state.liveStatus.accuracy)}%`, "accuracy")}
          ${renderPaperStatusTile("本题倍率", `x${formatNumber(state.liveStatus.questionMultiplier)}`, "questionMultiplier")}
          ${renderPaperStatusTile("考试倍率", `x${formatNumber(state.liveStatus.examMultiplier)}`, "examMultiplier")}
          ${renderPaperStatusTile("体力", `${formatNumber(state.liveStatus.stamina)}%`, "stamina", `基础 ${formatNumber(state.liveStatus.baseStamina)}%`)}
        </div>
      </div>
      ${
        trigger
          ? `<div class="paper-trigger-banner status-trigger-banner banner-${trigger.tone}">
              <span>${trigger.replay ? "复触发" : "触发"}</span>
              <strong>${escapeHtml(trigger.label)}</strong>
              <small>${escapeHtml(trigger.effectText || "联动生效")}</small>
            </div>`
          : `<div class="paper-trigger-banner status-trigger-banner idle"><span>等待</span><strong>触发队列</strong><small>${state.triggerQueue.length} 个待播放</small></div>`
      }
      <div class="paper-progress-row">
        <div class="budget-bar" aria-label="答题点进度"><span style="width:${progress}%"></span></div>
        <div class="budget-text">
          <span>答题点 ${done} / 15</span>
          <span>CHAIN ${state.chainCount}</span>
        </div>
      </div>
    </div>
  `;
}

function renderQuestionCard(exam: NonNullable<UiState["activeExam"]>, question?: QuestionLog): string {
  const resultClass = question ? (question.correct ? "result-success" : "result-fail") : "result-pending";
  const titleIndex = Math.max(1, exam.questionIndex);
  return `
    <article class="question-card ${resultClass}">
      <div class="scanline"></div>
      <div class="question-top">
        <span class="mono-label">QUESTION ${String(titleIndex).padStart(2, "0")}</span>
        <span class="score-pill">10 分</span>
      </div>
      <h1>${SUBJECT_LABELS[exam.subject]} 第 ${titleIndex} 题</h1>
      <div class="question-meta">
        <span>${SUBJECT_LABELS[exam.subject]}</span>
        <span>正确率 ${question?.accuracy ?? "--"}%</span>
        <span>掷骰 ${question?.roll ?? "--"}</span>
      </div>
      <div class="answer-grid">
        ${Array.from({ length: 15 }, (_, index) => renderAnswerDot(index + 1)).join("")}
      </div>
      <div class="tag-row large">
        <span>体力 ${question ? `${question.staminaBefore}->${question.staminaAfter}` : "--"}</span>
        <span>本题 ${question?.scoreGained ?? 0} 分</span>
      </div>
      <div class="result-stamp">${question ? (question.correct ? "成功" : "失误") : "等待判定"}</div>
    </article>
  `;
}

function renderAnswerDot(index: number): string {
  const logged = state.examQuestions.find((question) => question.questionIndex === index);
  const active = state.activeExam?.questionIndex === index && !logged ? " active" : "";
  if (!logged) {
    return `<span class="answer-pending${active}" data-index="${index}" title="第 ${index} 题：待判"></span>`;
  }
  const cls = logged.correct ? "answer-success" : "answer-fail";
  const label = logged.correct ? "成功" : "失误";
  return `<span class="${cls}${active}" data-index="${index}" title="第 ${index} 题：${label} ${logged.scoreGained}/10"></span>`;
}

function renderTriggerOverlay(): string {
  const event = state.activeTrigger ?? state.scoreFlash;
  if (!event) {
    return `<div class="trigger-overlay" aria-hidden="true"></div>`;
  }
  const delta = event.deltas?.sort((a, b) => Math.abs(b.value) - Math.abs(a.value))[0];
  const scoreDelta = event.scoreDelta;
  const detail = typeof scoreDelta === "number" && Math.abs(scoreDelta) > 0.0001
    ? `分数 ${formatDelta(scoreDelta)}`
    : delta ? `${escapeHtml(delta.label)} ${formatDelta(delta.value, delta.key)}` : "";
  return `
    <div class="trigger-overlay" aria-hidden="true">
      <span class="float-event float-${event.tone} float-${event.intensity}">
        <strong>${escapeHtml(event.label)}</strong>
        ${detail ? `<small>${detail}</small>` : ""}
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
            : `<span class="event-chip chip-idle">等待盖章</span>`
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
            const score = done ? done.score : active ? Math.round(exam.score) : "--";
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
        <div class="mini-note">触发队列：${state.triggerQueue.length} 个待播放</div>
      </div>
    </details>
  `;
}

function renderTermsDrawer(): string {
  return `
    <details class="mobile-drawer terms-drawer">
      <summary><span>准考证词条库</span><strong>${state.artifacts.length} 条</strong></summary>
      <div class="panel-title">
        <p class="mono-label">ADMISSION TICKET</p>
        <h2>准考证词条</h2>
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
        <p>先从候选遗物中选择开局构筑，再完成语文、数学、英语和 3 门自选科目的六场考试。</p>
      </section>
      <section>
        <h3>体力</h3>
        <p>状态显示框中的体力会影响正确率。每场考试开始时，当前体力先恢复为基础体力；随后再结算考试开始触发的遗物。</p>
      </section>
      <section>
        <h3>倍率</h3>
        <p>本题得分倍率只影响当前题目；本场考试得分倍率会在本场交卷时作用到整场原始分。</p>
      </section>
      <section>
        <h3>触发</h3>
        <p>遗物按触发时机和准考证顺序依次结算。状态栏上方会显示当前触发，数字浮标表示倍率或体力变化。</p>
      </section>
      <section>
        <h3>操作</h3>
        <p>自动模式会连续判题；暂停自动后可以手动点击“判定下一题”；“快速跳过”会把剩余流程高速播放完。</p>
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
  const overflow = Math.max(0, result.totalScore - 750);
  const title = resultTitle(result.totalScore);
  return `
    <section class="result-screen">
      <div class="result-card">
        <p class="mono-label">FINAL SCORE</p>
        <div class="final-score ${result.totalScore > 750 ? "over-score" : ""}">${result.totalScore}</div>
        <h1>${title}</h1>
        <p>${escapeHtml(state.playerName || "考生")} 的六科已交卷。你的准考证上共有 ${state.artifacts.length} 条词条，溢出分 ${overflow}。</p>
        ${renderShareCard(result, title, overflow)}
        <div class="result-subjects">
          ${result.exams
            .map((exam) => `<div><span>${SUBJECT_LABELS[exam.subject]}</span><strong>${exam.score}</strong></div>`)
            .join("")}
        </div>
        <button class="primary-button" type="button" data-action="restart">重新开始</button>
      </div>
      ${renderLogStandalone()}
    </section>
  `;
}

function renderShareCard(result: RunResult, title: string, overflow: number): string {
  return `
    <section class="share-card-preview" aria-label="分享卡片预览">
      <div class="share-card-paper">
        <div class="share-card-head">
          <div><span class="mono-label">REPORT CARD</span><strong>准考证战报</strong></div>
          <span>${overflow > 0 ? `OVER +${overflow}` : "本地战报"}</span>
        </div>
        <div class="share-card-candidate"><span>考生</span><strong>${escapeHtml(state.playerName || "考生")}</strong></div>
        <div class="share-card-score ${result.totalScore > 750 ? "over-score" : ""}">${result.totalScore}</div>
        <h2>${title}</h2>
        <div class="share-card-meta">
          <span>SEED ${escapeHtml(result.seed)}</span>
          <span>${overflow > 0 ? `OVER +${overflow}` : "750 以内"}</span>
        </div>
        <div class="share-card-subjects">
          ${result.exams
            .map((exam) => `<span>${SUBJECT_LABELS[exam.subject]} <strong>${exam.score}</strong></span>`)
            .join("")}
        </div>
        <div class="share-card-terms">
          ${state.artifacts
            .slice(-6)
            .reverse()
            .map(
              (artifact) =>
                `<span class="rarity-text-${rarityClass(artifact.rarity)}">${escapeHtml(artifact.name)}</span>`
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function resultTitle(score: number): string {
  if (score >= 1000) return "满分已经失去行政意义";
  if (score > 850) return "招生办正在刷新页面";
  if (score > 750) return "分数溢出了答题卡";
  if (score > 620) return "稳定上岸，但准考证看起来不太合法";
  return "命题组还活着";
}

function renderFooter(): string {
  const issueUrl = buildIssueUrl();
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
      <details data-section="footer" ${state.footerOpen ? "open" : ""}>
        <summary><span>发布信息</span><strong>反馈 / 赞赏 / 排名</strong></summary>
        <div class="footer-grid">
          <a class="footer-option" href="${escapeAttr(issueUrl)}" target="_blank" rel="noreferrer">
            <strong>提交 GitHub Issue</strong>
            <span>自动带上 seed、阶段、成绩、遗物和最近日志，方便复现。</span>
          </a>
          <button class="footer-option" type="button" data-action="copy-feedback">
            <strong>复制 Issue 模板</strong>
            <span>GitHub 打不开时，先复制模板再手动粘贴。</span>
          </button>
          <div class="footer-roadmap">
            <span>排名接口可接 /api/leaderboard，提交内容建议同时附上战报截图。</span>
            <span>赞赏入口保留为配置项；没有收款码时不显示空按钮。</span>
          </div>
          ${notice}
        </div>
      </details>
    </footer>
  `;
}

async function copyIssueTemplate(): Promise<void> {
  const text = buildIssueBody();
  try {
    await navigator.clipboard.writeText(text);
    showFooterNotice("Issue 模板已复制，可以直接粘贴到 GitHub。");
  } catch {
    showFooterNotice("浏览器禁止剪贴板写入，请直接点击提交 GitHub Issue。");
  }
}

function buildIssueUrl(): string {
  const params = new URLSearchParams({
    title: `[反馈] ${state.phase} / seed ${state.seed}`,
    body: buildIssueBody()
  });
  return `https://github.com/WhiteGiver-Plus/GaokaoArtifact/issues/new?${params.toString()}`;
}

function buildIssueBody(): string {
  const bundle = buildIssueBundle();
  return [
    "反馈类型：Bug / 平衡性 / 文案 / 其它",
    "一句话描述：",
    "",
    "复现步骤：",
    "1. ",
    "2. ",
    "3. ",
    "",
    "期望表现：",
    "",
    "实际表现：",
    "",
    "诊断信息：",
    JSON.stringify(bundle, null, 2)
  ].join("\n");
}

function buildIssueBundle(): Record<string, unknown> {
  return {
    app: "请选择你的高考遗物",
    capturedAt: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    seed: state.seed,
    playerName: state.playerName || "考生",
    phase: state.phase,
    subjects: subjectOrder().map((subject) => SUBJECT_LABELS[subject]),
    autoPlay: state.autoPlay,
    speedMs: state.speedMs,
    liveStatus: state.liveStatus,
    score: state.result?.totalScore ?? currentScore(),
    exams: state.exams.map((exam) => ({
      subject: SUBJECT_LABELS[exam.subject],
      score: exam.score
    })),
    currentExam: state.activeExam
      ? {
          subject: SUBJECT_LABELS[state.activeExam.subject],
          questionIndex: state.activeExam.questionIndex,
          score: Math.round(state.activeExam.score)
      }
      : undefined,
    artifacts: state.artifacts.map((artifact) => ({
      id: artifact.id,
      name: artifact.name,
      rarity: artifact.rarity
    })),
    recentQuestions: state.examQuestions.slice(-8).map((question) => ({
      subject: SUBJECT_LABELS[question.subject],
      questionIndex: question.questionIndex,
      correct: question.correct,
      scoreGained: question.scoreGained
    })),
    recentLogs: state.logs.slice(-12)
  };
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

function toggleSubject(subject: SubjectId): void {
  if (!canEditOpening()) return;
  if (!ELECTIVE_SUBJECTS.includes(subject as never)) return;
  if (state.subjects.includes(subject)) return;
  state.subjects = [...state.subjects, subject].slice(-3);
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

function isDebugRoute(): boolean {
  const path = window.location.pathname.replace(/\/+$/, "");
  return path.endsWith("/debug") || path.endsWith("/debug/index.html");
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
  state.waitingNext = undefined;
  state.result = undefined;
  state.scoreChoicePrompt = undefined;
  state.speedMs = 920;
}

function resetToStart(newSeed: boolean): void {
  state.runId += 1;
  if (newSeed) state.seed = defaultSeed();
  resetRunState();
  state.phase = "start";
  render();
}

async function restartRun(newSeed: boolean): Promise<void> {
  state.runId += 1;
  if (newSeed) state.seed = defaultSeed();
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

  await runGame(LOCAL_ARTIFACTS, options, {
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
    chooseOnesDigit: async (score, subject) => (await promptOnesDigitChoice(runId, score, subject)) ?? 9,
    chooseDigitSwap: (score, subject) => promptDigitSwapChoice(runId, score, subject),
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
      state.chainCount = 0;
      state.scoreFlash = undefined;
      state.activeExam = {
        index: exam.index,
        subject: exam.subject,
        questionIndex: exam.questionIndex,
        score: state.activeExam?.score ?? 0
      };
      render();
      await waitForNextQuestion(runId);
    },
    onQuestion: (question, exam) => {
      if (!isCurrentRun(runId)) return;
      state.currentQuestion = question;
      state.examQuestions = [...state.examQuestions, question];
      state.liveStatus = exam.status;
      state.activeExam = {
        index: exam.index,
        subject: exam.subject,
        questionIndex: question.questionIndex,
        score: exam.rawScore + exam.examPostBonus
      };
      state.scoreAdjustment = exam.currentTotalAdjustment;
      const visualEvent: VisualEvent = {
        id: `score-${Date.now()}-${question.questionIndex}`,
        label: question.correct ? `+${question.scoreGained}` : "失误",
        tone: question.correct ? "score" : "fail",
        kind: question.correct ? "score:add" : "score:fail",
        intensity: scoreIntensity(question.scoreGained, exam.status)
      };
      state.scoreFlash = visualEvent;
      state.visualEvents = [visualEvent, ...state.visualEvents].slice(0, 12);
      render();
      window.setTimeout(() => {
        if (state.scoreFlash?.id === visualEvent.id) {
          state.scoreFlash = undefined;
          render();
        }
      }, state.speedMs > 0 ? 420 : 80);
    },
    onExamEnd: (exam) => {
      if (!isCurrentRun(runId)) return;
      state.exams = [...state.exams, exam];
      state.activeExam = state.activeExam
        ? {
            ...state.activeExam,
            score: exam.score
          }
        : state.activeExam;
      state.scoreAdjustment = 0;
      render();
    },
    onRunEnd: (result) => {
      if (!isCurrentRun(runId)) return;
      state.result = result;
      state.phase = "result";
    }
  });
  if (isCurrentRun(runId)) render();
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
  if (state.autoPlay) return delay(state.speedMs);
  return new Promise((resolve) => {
    state.waitingNext = () => {
      state.waitingNext = undefined;
      resolve();
      render();
    };
  });
}

async function playTriggerEvent(runId: number, event: TriggerEvent): Promise<void> {
  const visualEvent = triggerEventToVisual(event);
  state.chainCount += 1;
  state.triggerQueue = [...state.triggerQueue, visualEvent];
  state.activeTrigger = visualEvent;
  state.liveStatus = event.after;
  if (state.activeExam) {
    state.activeExam = {
      ...state.activeExam,
      score: event.scoreAfter.currentExamScore + event.scoreAfter.examPostBonus
    };
  }
  state.scoreAdjustment = event.scoreAfter.currentTotalAdjustment;
  state.visualEvents = [visualEvent, ...state.visualEvents].slice(0, 12);
  render();
  if (state.speedMs > 0) {
    await delay(Math.max(500, Math.min(620, state.speedMs * 0.55)));
  }
  if (!isCurrentRun(runId)) return;
  state.triggerQueue = state.triggerQueue.filter((item) => item.id !== visualEvent.id);
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

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function defaultSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}

function formatNumber(value: number): string {
  return String(Math.round(value * 100) / 100);
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
