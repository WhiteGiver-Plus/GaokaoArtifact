import { LOCAL_ARTIFACTS } from "./artifacts.generated.js";
import {
  ELECTIVE_SUBJECTS,
  REQUIRED_SUBJECTS,
  runGame,
  SUBJECT_LABELS,
  type ArtifactConfig,
  type ExamLog,
  type QuestionLog,
  type RunResult,
  type SubjectId
} from "./core/browser.js";

const root = requireElement("root");

type Phase = "loading" | "draft" | "exam" | "result";
type EventTone = "score" | "term" | "chain" | "fail" | "idle";

interface ChoicePrompt {
  reason: string;
  choices: ArtifactConfig[];
  discard: boolean;
  resolve: (index: number) => void;
}

interface VisualEvent {
  id: string;
  label: string;
  tone: EventTone;
  artifactId?: string;
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
  choicePrompt?: ChoicePrompt;
  activeExam?: { index: number; subject: SubjectId; questionIndex: number; score: number };
  currentQuestion?: QuestionLog;
  waitingNext?: () => void;
  result?: RunResult;
  autoPlay: boolean;
  speedMs: number;
}

const state: UiState = {
  runId: 0,
  phase: "loading",
  seed: defaultSeed(),
  playerName: readPlayerName(),
  subjects: ELECTIVE_SUBJECTS.slice(0, 3) as SubjectId[],
  artifacts: [],
  exams: [],
  examQuestions: [],
  logs: [],
  visualEvents: [],
  autoPlay: true,
  speedMs: 920
};

root.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  const choice = target.closest<HTMLElement>("[data-choice]")?.dataset.choice;
  const action = target.closest<HTMLElement>("[data-action]")?.dataset.action;
  const subject = target.closest<HTMLElement>("[data-subject]")?.dataset.subject as
    | SubjectId
    | undefined;

  if (choice !== undefined) {
    state.choicePrompt?.resolve(Number(choice));
    return;
  }
  if (subject) {
    toggleSubject(subject);
    return;
  }
  if (action === "restart") {
    void restartRun(true);
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
  }
});

root.addEventListener("input", (event) => {
  const input = event.target as HTMLInputElement;
  if (input.dataset.field !== "player-name") return;
  state.playerName = input.value;
  try {
    window.localStorage.setItem("gaokao-player-name", state.playerName);
  } catch {
    // localStorage may be unavailable in private or restricted contexts.
  }
});

render();
void restartRun(false);

function render(): void {
  root.innerHTML = `
    <div class="app-shell">
      ${renderTopbar()}
      <main class="paper-field">${renderPhase()}</main>
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
  return `
    <header class="topbar">
      <div class="brand">
        <span class="brand-mark">准</span>
        <span>请选择你的高考遗物</span>
      </div>
      <div class="topbar-actions">
        <span class="seed">SEED ${escapeHtml(state.seed)}</span>
        <button class="ghost-button" type="button" data-action="restart">重开</button>
      </div>
    </header>
  `;
}

function renderPhase(): string {
  if (state.phase === "draft" && state.choicePrompt) return renderDraft(state.choicePrompt);
  if (state.phase === "exam" && state.activeExam) return renderExam();
  if (state.phase === "result" && state.result) return renderResult(state.result);
  return renderLoading();
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
  const opening = !prompt.discard && state.exams.length === 0 && !state.activeExam && state.artifacts.length < 5;
  const rollIndex = Math.min(5, state.artifacts.length + 1);
  const selected = state.subjects;
  return `
    <section class="draft-screen">
      <div class="draft-heading">
        <p class="mono-label">${
          prompt.discard ? "OVERFLOW DISCARD" : opening ? `OPENING ROLL ${rollIndex}/5` : "NEXT SUBJECT ROLL"
        }</p>
        <h1>${prompt.discard ? "准考证放不下了" : opening ? `请选择你的遗物 ${rollIndex}/5` : "请选择你的遗物"}</h1>
        ${prompt.discard ? "<p>选择一条词条从准考证上划掉。</p>" : ""}
        ${opening ? renderTicketProfile(selected) : ""}
      </div>
      <div class="draft-grid">
        ${prompt.choices.map((artifact, index) => renderDraftCard(artifact, index)).join("")}
      </div>
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
      <div class="subject-picker" aria-label="3+3 选科">
        <div class="subject-picker-head">
          <span>3+3 配置</span>
          <strong>${subjectOrderLabels().join(" / ")}</strong>
        </div>
        <div class="subject-chip-row">
          ${ELECTIVE_SUBJECTS.map((subject) => renderSubjectChip(subject, selected.includes(subject))).join("")}
        </div>
      </div>
    </div>
  `;
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
  return `
    <section class="game-grid">
      <div class="score-status-strip">${renderScoreHero(exam, question)}</div>
      <section class="exam-stage exam-paper" aria-label="当前答题与词条触发">
        ${renderExamHeader(exam, pending)}
        ${renderTriggerOverlay()}
        <div class="exam-priority">
          ${renderQuestionCard(exam, question)}
          ${renderTriggerStage()}
        </div>
        <div class="exam-controls">
          <button class="primary-button" type="button" data-action="next-question" ${state.waitingNext ? "" : "disabled"}>判定下一题</button>
          <button class="secondary-button" type="button" data-action="toggle-auto">${state.autoPlay ? "暂停自动" : "继续自动"}</button>
          <button class="secondary-button" type="button" data-action="sprint">本科速推</button>
        </div>
      </section>
      <section class="support-drawers" aria-label="次要信息">
        ${renderStateDrawer(exam, pending)}
        ${renderTermsDrawer()}
        ${renderLogDrawer()}
      </section>
    </section>
  `;
}

function renderScoreHero(exam: NonNullable<UiState["activeExam"]>, question?: QuestionLog): string {
  const total = state.exams.reduce((sum, item) => sum + item.score, 0) + exam.score;
  const progress = Math.min(100, (exam.questionIndex / 15) * 100);
  const correct = state.examQuestions.filter((item) => item.correct).length;
  const wrong = state.examQuestions.filter((item) => !item.correct).length;
  return `
    <div class="score-hero">
      <div class="score-board" aria-label="考试核心状态">
        <div class="score-box score-box-total">
          <span>总分</span>
          <strong class="${total > 750 ? "over-score" : ""}">${Math.round(total)}</strong>
          <small>/750</small>
        </div>
        <div class="score-box">
          <span>当前科目</span>
          <strong class="score-subject">${SUBJECT_LABELS[exam.subject]}</strong>
          <small>(${exam.index + 1}/${subjectOrder().length})</small>
        </div>
        <div class="score-box">
          <span>本题得分</span>
          <strong>${question?.scoreGained ?? exam.score}</strong>
          <small>/10</small>
        </div>
        <div class="score-box score-box-compact">
          <span>答对</span>
          <strong>${correct}</strong>
        </div>
        <div class="score-box score-box-compact">
          <span>答错</span>
          <strong>${wrong}</strong>
        </div>
        <div class="score-box score-box-wide">
          <span>准考证词条</span>
          <strong>${state.artifacts.length}</strong>
          <small>${state.artifacts.slice(-1).map((item) => item.name)[0] ?? "暂无"}</small>
        </div>
        <div class="score-box score-box-wide">
          <span>最近触发</span>
          <strong>${state.visualEvents.find((item) => item.tone !== "score")?.label ?? "暂无"}</strong>
          <small>${state.logs.length} 条日志</small>
        </div>
      </div>
      <div class="budget-bar" aria-label="答题点进度"><span style="width:${progress}%"></span></div>
      <div class="budget-text">
        <span>答题点 ${Math.min(exam.questionIndex, 15)} / 15</span>
        <span>总分 ${Math.round(total)}</span>
      </div>
    </div>
  `;
}

function renderExamHeader(exam: NonNullable<UiState["activeExam"]>, pending: number): string {
  const done = Math.min(15, exam.questionIndex);
  return `
    <div class="exam-paper-header">
      <span class="secret-line">★ 密封线内请勿答题 ★</span>
      <div class="paper-header-main">
        <div class="paper-title-block">
          <p class="mono-label">NATIONAL AUTO EXAM</p>
          <h2>${SUBJECT_LABELS[exam.subject]} 自动模拟卷</h2>
        </div>
        <div class="paper-code-block" aria-hidden="true">
          <span>准考证号</span>
          <strong>${escapeHtml(state.seed.slice(0, 10).toUpperCase())}</strong>
          <i></i>
        </div>
      </div>
      <div class="paper-meta-grid">
        <span>姓名：${escapeHtml(state.playerName || "考生")}</span>
        <span>座号：${escapeHtml(state.seed.slice(0, 6).toUpperCase())}</span>
        <span>进度：${done}/15</span>
        <span>剩余：${pending} 题</span>
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
  return `
    <div class="trigger-overlay" aria-hidden="true">
      ${state.visualEvents
        .slice(0, 8)
        .map((event, index) => {
          const left = 14 + ((index * 17) % 70);
          const top = 18 + ((index * 11) % 54);
          return `<span class="float-event float-${event.tone}" style="left:${left}%;top:${top}%;animation-delay:${index * 70}ms">${escapeHtml(event.label)}</span>`;
        })
        .join("")}
    </div>
  `;
}

function renderTriggerStage(): string {
  const activeIds = new Set(state.visualEvents.map((event) => event.artifactId).filter(Boolean));
  const activeTerms = state.artifacts.filter((artifact) => activeIds.has(artifact.id));
  const terms = (activeTerms.length > 0 ? activeTerms : state.artifacts.slice(-3).reverse()).slice(0, 3);
  return `
    <aside class="trigger-term-stage">
      <div class="trigger-stage-head">
        <div><p class="mono-label">TRIGGER ZONE</p><h2>触发词条</h2></div>
        <span class="chain-count">x${state.visualEvents.length}</span>
      </div>
      <div class="trigger-event-stack">
        ${
          state.visualEvents.length > 0
            ? state.visualEvents
                .slice(0, 5)
                .map((event) => `<span class="event-chip chip-${event.tone}">${escapeHtml(event.label)}</span>`)
                .join("")
            : `<span class="event-chip chip-idle">等待盖章</span>`
        }
      </div>
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
        <div class="stat-row"><span>自动</span><strong>${state.autoPlay ? "ON" : "OFF"}</strong></div>
        <div class="mini-note">最大失分题：尚未暴露</div>
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
  return `
    <footer class="info-footer">
      <details>
        <summary><span>发布信息</span><strong>反馈 / 赞赏 / 排名</strong></summary>
        <div class="footer-grid">
          <a href="https://github.com/WhiteGiver-Plus/GaokaoArtifact/issues/new" target="_blank" rel="noreferrer">提交反馈</a>
          <button class="footer-button" type="button">复制反馈模板</button>
          <a href="https://github.com/WhiteGiver-Plus/GaokaoArtifact" target="_blank" rel="noreferrer">GitHub 项目</a>
          <span>已内置匿名事件打点，可接 Plausible、GA4 或自建 /api/event。</span>
          <span>反馈模板会带上 seed、阶段、页面和浏览器信息，方便复现。</span>
        </div>
      </details>
    </footer>
  `;
}

function toggleSubject(subject: SubjectId): void {
  if (!canEditOpening()) return;
  if (!ELECTIVE_SUBJECTS.includes(subject as never)) return;
  state.subjects = state.subjects.includes(subject)
    ? state.subjects.filter((item) => item !== subject)
    : [...state.subjects, subject].slice(-3);
  void restartRun(false);
}

function canEditOpening(): boolean {
  return state.exams.length === 0 && !state.activeExam && state.artifacts.length < 1;
}

function subjectOrder(): SubjectId[] {
  return [...REQUIRED_SUBJECTS, ...state.subjects];
}

function subjectOrderLabels(): string[] {
  return subjectOrder().map((subject) => SUBJECT_LABELS[subject]);
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

async function restartRun(newSeed: boolean): Promise<void> {
  state.runId += 1;
  if (newSeed) state.seed = defaultSeed();
  state.phase = "loading";
  state.artifacts = [];
  state.exams = [];
  state.examQuestions = [];
  state.logs = [];
  state.visualEvents = [];
  state.choicePrompt = undefined;
  state.activeExam = undefined;
  state.currentQuestion = undefined;
  state.waitingNext = undefined;
  state.result = undefined;
  state.speedMs = 920;
  render();
  const runId = state.runId;

  await runGame(LOCAL_ARTIFACTS, { seed: state.seed, subjects: state.subjects }, {
    chooseArtifact: (choices, reason) => promptChoice(runId, choices, reason, false),
    chooseDiscard: (owned) => promptChoice(runId, owned, "准考证放不下了", true),
    onLog: (line) => {
      if (!isCurrentRun(runId)) return;
      state.logs = [...state.logs, line];
      recordVisualEvent(line);
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
      state.currentQuestion = undefined;
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
      state.activeExam = {
        index: exam.index,
        subject: exam.subject,
        questionIndex: question.questionIndex,
        score: exam.rawScore
      };
      const visualEvent: VisualEvent = {
        id: `score-${Date.now()}-${question.questionIndex}`,
        label: question.correct ? `+${question.scoreGained}` : "失误",
        tone: question.correct ? "score" : "fail"
      };
      state.visualEvents = [visualEvent, ...state.visualEvents].slice(0, 8);
      render();
    },
    onExamEnd: (exam) => {
      if (!isCurrentRun(runId)) return;
      state.exams = [...state.exams, exam];
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
    state.choicePrompt = {
      reason,
      choices,
      discard,
      resolve: (index) => {
        state.choicePrompt = undefined;
        resolve(index);
        render();
      }
    };
    render();
  });
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

function recordVisualEvent(line: string): void {
  const triggerPrefix = "触发遗物: ";
  const gainPrefix = "获得遗物: ";
  if (line.startsWith(triggerPrefix)) {
    const name = line.slice(triggerPrefix.length).split(" -> ")[0];
    const artifact = LOCAL_ARTIFACTS.find((item) => item.name === name);
    const visualEvent: VisualEvent = {
      id: `${Date.now()}-${state.visualEvents.length}`,
      label: name,
      tone: "term",
      artifactId: artifact?.id
    };
    state.visualEvents = [visualEvent, ...state.visualEvents].slice(0, 8);
    return;
  }
  if (line.startsWith(gainPrefix)) {
    const name = line.slice(gainPrefix.length);
    const visualEvent: VisualEvent = {
      id: `${Date.now()}-${state.visualEvents.length}`,
      label: name,
      tone: "chain"
    };
    state.visualEvents = [visualEvent, ...state.visualEvents].slice(0, 8);
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
