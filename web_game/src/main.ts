import {
  ELECTIVE_SUBJECTS,
  SUBJECT_LABELS,
  runGame,
  type ArtifactConfig,
  type ExamLog,
  type QuestionLog,
  type RunResult,
  type SubjectId
} from "../../src/core/browser.js";
import { WEB_ARTIFACTS } from "./artifacts.generated.js";
import "./overrides.css";

type Phase = "start" | "draft" | "exam" | "result";

interface ChoicePrompt {
  reason: string;
  choices: ArtifactConfig[];
  resolve: (index: number) => void;
  discard: boolean;
}

interface UiState {
  phase: Phase;
  seed: string;
  subjects: SubjectId[];
  autoPlay: boolean;
  speedMs: number;
  logs: string[];
  artifacts: ArtifactConfig[];
  exams: ExamLog[];
  activeExam?: { index: number; subject: SubjectId; score: number; questionIndex: number };
  currentQuestion?: QuestionLog;
  choicePrompt?: ChoicePrompt;
  result?: RunResult;
  waitingNext?: () => void;
}

const root = document.getElementById("root");
if (!root) {
  throw new Error("Missing #root");
}
const appRoot = root;

const state: UiState = {
  phase: "start",
  seed: defaultSeed(),
  subjects: ELECTIVE_SUBJECTS.slice(0, 3),
  autoPlay: true,
  speedMs: 420,
  logs: [],
  artifacts: [],
  exams: []
};

render();

function render(): void {
  appRoot.innerHTML = `
    <div class="app-shell">
      ${renderTopbar()}
      <main class="paper-field">
        ${renderPhase()}
      </main>
      ${renderFooter()}
    </div>
  `;
  bindEvents();
}

function renderTopbar(): string {
  return `
    <header class="topbar">
      <div class="brand">
        <span class="brand-mark">准</span>
        <span>准考证词条</span>
      </div>
      <div class="topbar-actions">
        <span class="seed">SEED ${escapeHtml(state.seed)}</span>
        <button class="ghost-button" data-action="restart">重开</button>
      </div>
    </header>
  `;
}

function renderPhase(): string {
  if (state.phase === "start") return renderStart();
  if (state.phase === "draft" && state.choicePrompt) return renderDraft(state.choicePrompt);
  if (state.phase === "result" && state.result) return renderResult(state.result);
  return renderExam();
}

function renderStart(): string {
  return `
    <section class="draft-screen start-screen">
      <div class="draft-heading">
        <p class="mono-label">GAOKAO ARTIFACT WEB</p>
        <h1>印一张新的准考证</h1>
        <p>使用当前 60 个配置化遗物和核心考试机制。选择选考三科后进入开局五连抽。</p>
      </div>
      <div class="result-card start-card">
        <label class="field-label">Seed</label>
        <input class="seed-input" data-field="seed" value="${escapeHtml(state.seed)}" />
        <div class="subject-picker">
          ${ELECTIVE_SUBJECTS.map((subject) => renderSubjectToggle(subject)).join("")}
        </div>
        <button class="primary-button" data-action="start">开始考试</button>
      </div>
    </section>
  `;
}

function renderSubjectToggle(subject: SubjectId): string {
  const active = state.subjects.includes(subject) ? " active" : "";
  return `
    <button class="subject-choice${active}" type="button" data-subject="${subject}">
      ${SUBJECT_LABELS[subject]}
    </button>
  `;
}

function renderDraft(prompt: ChoicePrompt): string {
  const label = prompt.discard ? "OVERFLOW DISCARD" : "ARTIFACT DRAFT";
  return `
    <section class="draft-screen">
      <div class="draft-heading">
        <p class="mono-label">${label}</p>
        <h1>${escapeHtml(prompt.reason)}</h1>
        <p>${prompt.discard ? "遗物栏已超过上限，选择一张移除。" : "选择一条遗物写进准考证，后续考试会自动结算。"}</p>
      </div>
      <div class="draft-grid">
        ${prompt.choices.map((artifact, index) => renderArtifactChoice(artifact, index)).join("")}
      </div>
      ${renderBuildStrip()}
    </section>
  `;
}

function renderArtifactChoice(artifact: ArtifactConfig, index: number): string {
  return `
    <button class="draft-card rarity-${rarityClass(artifact.rarity)}" data-choice="${index}">
      <div class="draft-card-top">
        <span class="rarity">${artifact.rarity}</span>
        <span class="stamp">${artifact.triggers.length} triggers</span>
      </div>
      <h2>${escapeHtml(artifact.name)}</h2>
      <p>${escapeHtml(artifact.description)}</p>
      <div class="tag-row">${artifact.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
      <small>${escapeHtml(artifact.source)} / ${escapeHtml(artifact.id)}</small>
    </button>
  `;
}

function renderExam(): string {
  const exam = state.activeExam;
  const question = state.currentQuestion;
  return `
    <section class="game-grid">
      <div class="score-status-strip">${renderScoreHero()}</div>
      <section class="exam-stage" aria-label="当前考试">
        <div class="exam-priority">
          ${renderQuestionCard(exam, question)}
          ${renderTriggerStage()}
        </div>
        <div class="exam-controls">
          <button class="primary-button" data-action="next" ${state.waitingNext ? "" : "disabled"}>判定下一题</button>
          <button class="secondary-button" data-action="toggle-auto">${state.autoPlay ? "暂停自动" : "继续自动"}</button>
          <button class="secondary-button" data-action="sprint">本科速推</button>
        </div>
      </section>
      <section class="support-drawers" aria-label="次要信息">
        ${renderStateDrawer()}
        ${renderArtifactsDrawer()}
        ${renderLogDrawer()}
      </section>
    </section>
  `;
}

function renderScoreHero(): string {
  const score = state.activeExam?.score ?? 0;
  const total = state.exams.reduce((sum, exam) => sum + exam.score, 0);
  return `
    <div class="score-hero">
      <p class="mono-label">${state.activeExam ? SUBJECT_LABELS[state.activeExam.subject] : "WAITING"} EXAM</p>
      <div class="score-number">${Math.round(score)}</div>
      <div class="score-caption"><span>/ 150</span><strong>总分 ${total}</strong></div>
      <div class="budget-bar"><span style="width:${Math.min(100, ((state.activeExam?.questionIndex ?? 0) / 15) * 100)}%"></span></div>
      <div class="budget-text"><span>题号 ${state.activeExam?.questionIndex ?? 0} / 15</span><span>遗物 ${state.artifacts.length}</span></div>
    </div>
  `;
}

function renderQuestionCard(
  exam: UiState["activeExam"],
  question: QuestionLog | undefined
): string {
  const resultClass = question ? (question.correct ? "result-success" : "result-fail") : "result-pending";
  return `
    <article class="question-card ${resultClass}">
      <div class="scanline"></div>
      <div class="question-top">
        <span class="mono-label">QUESTION ${String(exam?.questionIndex ?? 0).padStart(2, "0")}</span>
        <span class="score-pill">10 分</span>
      </div>
      <h1>${exam ? SUBJECT_LABELS[exam.subject] : "等待开考"}</h1>
      <div class="question-meta">
        <span>${exam ? `第 ${exam.index + 1} 场` : "未开始"}</span>
        <span>正确率 ${question?.accuracy ?? "--"}%</span>
        <span>掷骰 ${question?.roll ?? "--"}</span>
      </div>
      <div class="answer-grid">
        ${Array.from({ length: 18 }, (_, index) => `<span class="${question && index < Math.round((question.scoreGained / 10) * 6) ? "filled" : ""}"></span>`).join("")}
      </div>
      <div class="tag-row large">
        <span>体力 ${question ? `${question.staminaBefore} -> ${question.staminaAfter}` : "--"}</span>
        <span>本题 ${question?.scoreGained ?? 0} 分</span>
      </div>
      <div class="result-stamp">${question ? (question.correct ? "成功" : "失误") : "等待判定"}</div>
    </article>
  `;
}

function renderTriggerStage(): string {
  const recent = state.logs.slice(-5).reverse();
  return `
    <aside class="trigger-term-stage">
      <div class="trigger-stage-head">
        <div><p class="mono-label">TRIGGER ZONE</p><h2>触发词条</h2></div>
        <span class="chain-count">x${recent.length}</span>
      </div>
      <div class="trigger-event-stack">
        ${recent.length ? recent.map((line) => `<span class="event-chip chip-term">${escapeHtml(shortLog(line))}</span>`).join("") : `<span class="event-chip chip-idle">等待盖章</span>`}
      </div>
      <div class="trigger-card-strip">
        ${state.artifacts.slice(-3).reverse().map(renderMiniArtifact).join("") || `<article class="trigger-mini-card empty"><span>空白准考证</span><strong>还没抽词条</strong><small>先选五条开局遗物。</small></article>`}
      </div>
    </aside>
  `;
}

function renderStateDrawer(): string {
  return `
    <details class="mobile-drawer state-drawer" open>
      <summary><span>考试状态</span><strong>${state.exams.length} 科完成</strong></summary>
      <div class="subject-list">
        ${state.exams.map((exam) => `<div class="subject-row done"><span>${SUBJECT_LABELS[exam.subject]}</span><strong>${exam.score}</strong></div>`).join("")}
        ${state.activeExam ? `<div class="subject-row active"><span>${SUBJECT_LABELS[state.activeExam.subject]}</span><strong>${Math.round(state.activeExam.score)}</strong></div>` : ""}
      </div>
      <div class="stat-block">
        <div class="stat-row"><span>自动播放</span><strong>${state.autoPlay ? "ON" : "OFF"}</strong></div>
        <div class="stat-row"><span>速度</span><strong>${state.speedMs} ms</strong></div>
        <div class="mini-note">本网页复用 gh-pages 的界面壳与样式，规则由当前 core 引擎执行。</div>
      </div>
    </details>
  `;
}

function renderArtifactsDrawer(): string {
  return `
    <details class="mobile-drawer terms-drawer" open>
      <summary><span>准考证遗物</span><strong>${state.artifacts.length} 条</strong></summary>
      <div class="term-list">
        ${state.artifacts.map(renderTermCard).join("") || `<article class="term-card"><h3>暂无遗物</h3><p>开局五连抽后开始形成构筑。</p></article>`}
      </div>
    </details>
  `;
}

function renderLogDrawer(): string {
  return `
    <details class="mobile-drawer log-drawer" open>
      <summary><span>连锁日志</span><strong>${state.logs.length} 条</strong></summary>
      <section class="event-log">
        <div class="event-log-head"><span class="mono-label">CHAIN LOG</span><span>${state.logs.length} 条</span></div>
        <div class="event-log-list">
          ${state.logs.slice(-60).reverse().map((line) => `<p class="log-good">${escapeHtml(line)}</p>`).join("")}
        </div>
      </section>
    </details>
  `;
}

function renderResult(result: RunResult): string {
  const overflow = Math.max(0, result.totalScore - 750);
  return `
    <section class="result-screen">
      <div class="result-card">
        <p class="mono-label">FINAL SCORE</p>
        <div class="final-score ${overflow > 0 ? "over-score" : ""}">${result.totalScore}</div>
        <h1>${overflow > 0 ? "分数上限仅供参考" : "六科已交卷"}</h1>
        <p>Seed ${escapeHtml(result.seed)}。最终遗物 ${result.artifactNames.length} 条，溢出分 ${overflow}。</p>
        <div class="result-subjects">
          ${result.exams.map((exam) => `<div><span>${SUBJECT_LABELS[exam.subject]}</span><strong>${exam.score}</strong></div>`).join("")}
        </div>
        <div class="share-actions">
          <button class="primary-button" data-action="restart">再印一张准考证</button>
          <a class="secondary-button link-button" href="../artifacts_wiki/index.html" target="_blank" rel="noreferrer">查看遗物 Wiki</a>
        </div>
      </div>
      ${renderLogDrawer()}
    </section>
  `;
}

function renderBuildStrip(): string {
  if (state.artifacts.length === 0) return "";
  return `
    <div class="existing-build">
      <span class="mono-label">CURRENT BUILD</span>
      <div class="tag-row">${state.artifacts.map((artifact) => `<span>${escapeHtml(artifact.name)}</span>`).join("")}</div>
    </div>
  `;
}

function renderTermCard(artifact: ArtifactConfig): string {
  return `
    <article class="term-card rarity-${rarityClass(artifact.rarity)}">
      <div class="term-card-head"><span>${artifact.rarity}</span><span>${artifact.tags.join(" / ")}</span></div>
      <h3>${escapeHtml(artifact.name)}</h3>
      <p>${escapeHtml(artifact.description)}</p>
    </article>
  `;
}

function renderMiniArtifact(artifact: ArtifactConfig): string {
  return `
    <article class="trigger-mini-card rarity-${rarityClass(artifact.rarity)}">
      <span>${escapeHtml(artifact.tags[0] ?? artifact.rarity)}</span>
      <strong>${escapeHtml(artifact.name)}</strong>
      <small>${escapeHtml(artifact.description)}</small>
    </article>
  `;
}

function bindEvents(): void {
  appRoot.querySelectorAll<HTMLElement>("[data-action]").forEach((element) => {
    element.addEventListener("click", () => handleAction(element.dataset.action ?? ""));
  });
  appRoot.querySelectorAll<HTMLElement>("[data-subject]").forEach((element) => {
    element.addEventListener("click", () => toggleSubject(element.dataset.subject as SubjectId));
  });
  appRoot.querySelectorAll<HTMLElement>("[data-choice]").forEach((element) => {
    element.addEventListener("click", () => {
      const index = Number(element.dataset.choice ?? 0);
      state.choicePrompt?.resolve(index);
    });
  });
}

function handleAction(action: string): void {
  if (action === "restart") {
    resetToStart();
  } else if (action === "start") {
    const input = appRoot.querySelector<HTMLInputElement>("[data-field='seed']");
    state.seed = input?.value.trim() || defaultSeed();
    void startRun();
  } else if (action === "toggle-auto") {
    state.autoPlay = !state.autoPlay;
    state.waitingNext?.();
    render();
  } else if (action === "next") {
    state.waitingNext?.();
  } else if (action === "sprint") {
    state.autoPlay = true;
    state.speedMs = 0;
    state.waitingNext?.();
    render();
  }
}

function toggleSubject(subject: SubjectId): void {
  if (state.subjects.includes(subject)) {
    state.subjects = state.subjects.filter((item) => item !== subject);
  } else if (state.subjects.length < 3) {
    state.subjects = [...state.subjects, subject];
  }
  render();
}

async function startRun(): Promise<void> {
  if (state.subjects.length !== 3) {
    return;
  }
  state.phase = "exam";
  state.logs = [];
  state.artifacts = [];
  state.exams = [];
  state.result = undefined;
  state.currentQuestion = undefined;
  state.activeExam = undefined;
  render();

  await runGame(WEB_ARTIFACTS, { seed: state.seed, subjects: state.subjects }, {
    chooseArtifact: (choices, reason) => promptChoice(choices, reason, false),
    chooseDiscard: (owned) => promptChoice(owned, "遗物超出上限", true),
    onArtifactsChanged: (owned) => {
      state.artifacts = owned;
      render();
    },
    onLog: (line) => {
      state.logs = [...state.logs, line];
      render();
    },
    onExamStart: (exam) => {
      state.phase = "exam";
      state.activeExam = { ...exam, score: exam.startingScore, questionIndex: 0 };
      state.currentQuestion = undefined;
      render();
    },
    beforeQuestion: async (exam) => {
      state.activeExam = {
        index: exam.index,
        subject: exam.subject,
        questionIndex: exam.questionIndex,
        score: state.activeExam?.score ?? 0
      };
      render();
      await waitForAdvance();
    },
    onQuestion: (question, exam) => {
      state.currentQuestion = question;
      state.activeExam = { index: exam.index, subject: exam.subject, score: exam.rawScore, questionIndex: question.questionIndex };
      render();
    },
    onExamEnd: (exam) => {
      state.exams = [...state.exams, exam];
      render();
    },
    onRunEnd: (result) => {
      state.phase = "result";
      state.result = result;
      render();
    }
  });
}

function promptChoice(choices: ArtifactConfig[], reason: string, discard: boolean): Promise<number> {
  state.phase = "draft";
  return new Promise((resolve) => {
    state.choicePrompt = {
      reason,
      choices,
      discard,
      resolve: (index) => {
        state.choicePrompt = undefined;
        state.phase = "exam";
        resolve(index);
        render();
      }
    };
    render();
  });
}

function waitForAdvance(): Promise<void> {
  if (state.autoPlay) {
    return delay(state.speedMs);
  }
  return new Promise((resolve) => {
    state.waitingNext = () => {
      state.waitingNext = undefined;
      resolve();
      render();
    };
    render();
  });
}

function resetToStart(): void {
  state.phase = "start";
  state.seed = defaultSeed();
  state.autoPlay = true;
  state.speedMs = 420;
  state.logs = [];
  state.artifacts = [];
  state.exams = [];
  state.activeExam = undefined;
  state.currentQuestion = undefined;
  state.choicePrompt = undefined;
  state.result = undefined;
  state.waitingNext = undefined;
  render();
}

function renderFooter(): string {
  return `
    <footer class="info-footer">
      <details>
        <summary><span>发布信息</span><strong>core / wiki / gh-pages UI</strong></summary>
        <div class="footer-grid">
          <a href="../artifacts_wiki/index.html" target="_blank" rel="noreferrer">遗物 Wiki</a>
          <span>复用 gh-pages 视觉壳；规则来自当前 TypeScript core。</span>
          <span>遗物数据来自 data/artifacts/*.json。</span>
        </div>
      </details>
    </footer>
  `;
}

function rarityClass(rarity: ArtifactConfig["rarity"]): string {
  if (rarity === "special") return "legendary";
  if (rarity === "rare") return "epic";
  if (rarity === "uncommon") return "rare";
  return "common";
}

function shortLog(line: string): string {
  return line.length > 20 ? `${line.slice(0, 20)}...` : line;
}

function defaultSeed(): string {
  return String(Date.now()).slice(-8);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
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
