import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadArtifacts, type ArtifactConfig } from "../src/core/index.js";

const outputDir = path.join(process.cwd(), "artifacts_wiki");
const outputFile = path.join(outputDir, "index.html");

const artifacts = await loadArtifacts();
artifacts.sort((a, b) => a.name.localeCompare(b.name, "zh-Hans-CN"));

await mkdir(outputDir, { recursive: true });
await writeFile(outputFile, buildHtml(artifacts), "utf8");

console.log(`Built ${path.relative(process.cwd(), outputFile)} with ${artifacts.length} artifacts.`);

function buildHtml(artifactList: ArtifactConfig[]): string {
  const data = escapeScriptJson(JSON.stringify(artifactList));
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Artifacts Wiki</title>
  <style>${buildCss()}</style>
</head>
<body>
  ${buildBody()}
  <script>const ARTIFACTS = JSON.parse(${JSON.stringify(data)});</script>
  <script>${buildClientScript()}</script>
</body>
</html>
`;
}

function escapeScriptJson(value: string): string {
  return value.replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

function buildBody(): string {
  return `<main class="wiki-shell">
  <aside class="library">
    <details class="library-drawer" open>
      <summary>
        <span>遗物目录</span>
        <strong id="countBadge">0 / 0</strong>
      </summary>
      <div class="library-body">
        <header class="library-head">
          <span class="brand-mark">准</span>
          <div>
            <p class="mono-label">GAOKAO ARTIFACT</p>
            <h1>Artifacts Wiki</h1>
          </div>
        </header>
        <label class="search-box">
          <span>Search</span>
          <input id="searchInput" type="search" autocomplete="off" placeholder="名称 / id / tag / 来源 / 规则">
        </label>
        <div class="filters">
          <select id="rarityFilter" aria-label="Rarity filter"></select>
          <select id="timingFilter" aria-label="Timing filter"></select>
          <button id="clearButton" type="button">Clear</button>
        </div>
        <nav id="artifactList" class="artifact-list" aria-label="Artifact list"></nav>
      </div>
    </details>
  </aside>
  <section id="detail" class="detail" aria-live="polite"></section>
</main>`;
}

function buildCss(): string {
  return `
:root {
  color-scheme: light;
  --paper: #fafafa;
  --panel: #ffffff;
  --surface-dim: #f5f5f4;
  --ink: #0a0a0a;
  --muted: #6b7280;
  --faint: #9ca3af;
  --line: #e5e7eb;
  --line-strong: #9ca3af;
  --red: #ef4444;
  --blue: #2563eb;
  --pink: #ff4db8;
  --cyan: #22d3ee;
  --green: #059669;
  --code: #f5f5f4;
  --shadow: 0 10px 30px rgba(10, 10, 10, .08);
  --mono: "Cascadia Mono", Consolas, monospace;
  --sans: "Segoe UI", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  min-height: 100vh;
  color: var(--ink);
  background:
    linear-gradient(rgba(10,10,10,.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(10,10,10,.025) 1px, transparent 1px),
    var(--paper);
  background-size: 36px 36px;
  font-family: var(--sans);
}
.wiki-shell {
  display: grid;
  grid-template-columns: minmax(340px, 430px) minmax(0, 1fr);
  min-height: 100vh;
}
.library {
  border-right: 1px solid var(--line);
  background: rgba(250,250,250,.92);
  padding: 0;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: auto;
}
.library-drawer summary {
  display: none;
}
.library-body {
  padding: 24px;
}
.library-head {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 22px;
}
.brand-mark {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  color: var(--panel);
  background: var(--ink);
  border-radius: 6px;
  box-shadow: 4px 4px 0 var(--line);
  font-weight: 900;
}
.mono-label {
  margin: 0 0 4px;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
}
h1 {
  margin: 0;
  font-size: 28px;
  line-height: 1.1;
}
.count-badge {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 5px 9px;
  color: var(--muted);
  font-size: 12px;
  background: var(--panel);
}
.search-box {
  display: grid;
  gap: 8px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
  font-family: var(--mono);
}
input, select, button {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--panel);
  color: var(--ink);
  font: inherit;
}
input, select {
  height: 42px;
  padding: 0 12px;
}
button {
  min-height: 42px;
  cursor: pointer;
  font-weight: 700;
}
.filters {
  display: grid;
  grid-template-columns: 1fr 1fr 72px;
  gap: 8px;
  margin: 12px 0 18px;
}
.artifact-list {
  display: grid;
  gap: 10px;
}
.artifact-row {
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 14px 16px;
  background: rgba(255,255,255,.94);
  text-align: left;
  box-shadow: 0 6px 18px rgba(10,10,10,.04);
}
.artifact-row.active {
  border-color: var(--ink);
  box-shadow: inset 4px 0 0 var(--ink), 0 8px 22px rgba(10,10,10,.08);
}
.row-name {
  display: block;
  font-weight: 800;
}
.row-meta {
  display: block;
  margin-top: 4px;
  color: var(--muted);
  font-size: 12px;
}
.detail {
  padding: 32px;
  overflow: auto;
}
.detail-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  border-bottom: 1px solid var(--line);
  padding-bottom: 18px;
}
.detail h2 {
  margin: 0 0 8px;
  font-size: 34px;
}
.description {
  margin: 18px 0;
  max-width: 820px;
  font-size: 18px;
  line-height: 1.7;
}
.pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.pill {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 4px 8px;
  background: var(--panel);
  color: var(--muted);
  font-size: 12px;
}
.section-title {
  margin: 24px 0 10px;
  font-size: 15px;
  text-transform: uppercase;
  color: var(--blue);
  font-family: var(--mono);
}
.mechanic-list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.mechanic-item {
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 12px;
  background: rgba(255,255,255,.94);
}
.mechanic-item strong {
  display: block;
  margin-bottom: 6px;
}
.mechanic-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
.mechanic-meta code {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 3px 7px;
  background: var(--surface-dim);
  font-family: var(--mono);
  font-size: 11px;
}
.raw-details {
  margin-top: 16px;
  border: 1px dashed var(--line-strong);
  border-radius: 8px;
  background: var(--panel);
}
.raw-details summary {
  cursor: pointer;
  padding: 10px 12px;
  font-weight: 800;
}
.raw-details pre {
  border-top: 1px dashed var(--line-strong);
}
.strict-grid {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  border: 1px solid var(--line);
  border-radius: 8px;
  overflow: hidden;
  background: var(--panel);
}
.strict-grid dt, .strict-grid dd {
  margin: 0;
  padding: 10px 12px;
  border-bottom: 1px solid var(--line);
}
.strict-grid dt {
  background: #f0eee7;
  color: var(--muted);
  font-weight: 800;
}
.strict-grid dd {
  font-family: "Cascadia Mono", Consolas, monospace;
  overflow-wrap: anywhere;
}
.trigger-block {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--panel);
  margin-bottom: 12px;
  overflow: hidden;
}
.trigger-title {
  margin: 0;
  padding: 10px 12px;
  background: #f0eee7;
  font-size: 14px;
}
pre {
  margin: 0;
  padding: 10px 12px;
  background: var(--code);
  overflow: auto;
}
@media (max-width: 820px) {
  .wiki-shell { grid-template-columns: 1fr; }
  .library { position: sticky; top: 0; z-index: 10; height: auto; border-right: 0; border-bottom: 1px solid var(--line); }
  .library-drawer summary {
    min-height: 50px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    cursor: pointer;
    background: rgba(250,250,250,.96);
    font-weight: 900;
  }
  .library-drawer summary strong {
    color: var(--muted);
    font-family: var(--mono);
    font-size: 12px;
  }
  .library-body {
    max-height: 70vh;
    overflow: auto;
    padding: 14px;
    border-top: 1px solid var(--line);
  }
  .detail { padding: 18px; }
  .strict-grid { grid-template-columns: 1fr; }
  .filters { grid-template-columns: 1fr; }
}
`;
}

function buildClientScript(): string {
  return `
const rarityLabels = { common: "common", uncommon: "uncommon", rare: "rare", special: "special" };
const nodes = {
  search: document.getElementById("searchInput"),
  rarity: document.getElementById("rarityFilter"),
  timing: document.getElementById("timingFilter"),
  clear: document.getElementById("clearButton"),
  list: document.getElementById("artifactList"),
  detail: document.getElementById("detail"),
  count: document.getElementById("countBadge")
};
let selectedId = location.hash ? decodeURIComponent(location.hash.slice(1)) : ARTIFACTS[0]?.id;

init();

function init() {
  populateFilters();
  nodes.search.addEventListener("input", render);
  nodes.rarity.addEventListener("change", render);
  nodes.timing.addEventListener("change", render);
  nodes.clear.addEventListener("click", clearFilters);
  render();
}

function populateFilters() {
  nodes.rarity.innerHTML = option("", "All rarity") + ["common", "uncommon", "rare", "special"].map((item) => option(item, item)).join("");
  const timings = Array.from(new Set(ARTIFACTS.flatMap((artifact) => artifact.triggers.map((trigger) => trigger.timing)))).sort();
  nodes.timing.innerHTML = option("", "All timing") + timings.map((item) => option(item, item)).join("");
}

function clearFilters() {
  nodes.search.value = "";
  nodes.rarity.value = "";
  nodes.timing.value = "";
  render();
}

function render() {
  const filtered = ARTIFACTS.filter(matchesFilters);
  if (!filtered.some((artifact) => artifact.id === selectedId)) {
    selectedId = filtered[0]?.id;
  }
  nodes.count.textContent = String(filtered.length) + " / " + String(ARTIFACTS.length);
  nodes.list.innerHTML = filtered.map(renderListItem).join("") || "<p class=\\"row-meta\\">No artifacts matched.</p>";
  nodes.list.querySelectorAll("[data-id]").forEach((item) => {
    item.addEventListener("click", () => selectArtifact(item.getAttribute("data-id")));
  });
  renderDetail(ARTIFACTS.find((artifact) => artifact.id === selectedId));
}

function matchesFilters(artifact) {
  const query = nodes.search.value.trim().toLowerCase();
  const timing = nodes.timing.value;
  const ruleText = JSON.stringify({ modifiers: artifact.modifiers ?? [], triggers: artifact.triggers });
  const text = [artifact.id, artifact.name, artifact.source, artifact.rarity, artifact.description, artifact.tags.join(" "), ruleText].join(" ").toLowerCase();
  return (!query || text.includes(query))
    && (!nodes.rarity.value || artifact.rarity === nodes.rarity.value)
    && (!timing || artifact.triggers.some((trigger) => trigger.timing === timing));
}

function renderListItem(artifact) {
  const active = artifact.id === selectedId ? " active" : "";
  const triggerText = artifact.triggers.length === 0 ? "no trigger" : artifact.triggers.map((trigger) => trigger.timing).join(", ");
  const countText = String(artifact.modifiers?.length ?? 0) + " modifiers / " + String(artifact.triggers.length) + " triggers";
  return "<button class=\\"artifact-row" + active + "\\" type=\\"button\\" data-id=\\"" + escapeHtml(artifact.id) + "\\">"
    + "<span class=\\"row-name\\">" + escapeHtml(artifact.name) + "</span>"
    + "<span class=\\"row-meta\\">" + escapeHtml(artifact.rarity + " / " + artifact.source) + "</span>"
    + "<span class=\\"row-meta\\">" + escapeHtml(countText) + "</span>"
    + "<span class=\\"row-meta\\">" + escapeHtml(triggerText) + "</span>"
    + "</button>";
}

function selectArtifact(id) {
  if (!id) return;
  selectedId = id;
  history.replaceState(null, "", "#" + encodeURIComponent(id));
  const drawer = document.querySelector(".library-drawer");
  if (window.matchMedia("(max-width: 820px)").matches) drawer?.removeAttribute("open");
  render();
}

function renderDetail(artifact) {
  if (!artifact) {
    nodes.detail.innerHTML = "<p>No artifact selected.</p>";
    return;
  }
  nodes.detail.innerHTML = renderDetailHeader(artifact)
    + "<p class=\\"description\\">" + escapeHtml(artifact.description) + "</p>"
    + renderMechanics(artifact)
    + renderAttributes(artifact)
    + renderStrictConfig(artifact);
}

function renderDetailHeader(artifact) {
  return "<header class=\\"detail-head\\">"
    + "<div><p class=\\"mono-label\\">" + escapeHtml(artifact.id) + "</p><h2>" + escapeHtml(artifact.name) + "</h2></div>"
    + "<div class=\\"pill-row\\">" + artifact.tags.map((tag) => "<span class=\\"pill\\">" + escapeHtml(tag) + "</span>").join("") + "</div>"
    + "</header>";
}

function renderMechanics(artifact) {
  const items = [];
  (artifact.modifiers ?? []).forEach((modifier, index) => {
    items.push(renderMechanicItem("属性修正 " + String(index + 1), describeModifier(modifier), [
      "target=" + modifier.target,
      "mode=" + modifier.mode,
      "value=" + String(modifier.value),
      "phase=" + String(modifier.phase ?? 0),
      "order=" + String(modifier.order ?? 0)
    ]));
  });
  artifact.triggers.forEach((trigger, index) => {
    items.push(renderMechanicItem("触发器 " + String(index + 1), describeTrigger(trigger), [
      "timing=" + trigger.timing,
      "phase=" + String(trigger.phase ?? 0),
      "order=" + String(trigger.order ?? 0),
      "priority=" + String(trigger.priority ?? 100)
    ]));
  });
  const body = items.length ? items.join("") : "<li class=\\"mechanic-item\\">这个遗物没有主动触发器或属性修正。</li>";
  return "<h3 class=\\"section-title\\">机制说明</h3><ul class=\\"mechanic-list\\">" + body + "</ul>";
}

function renderMechanicItem(title, text, meta) {
  return "<li class=\\"mechanic-item\\"><strong>" + escapeHtml(title) + "</strong>"
    + "<span>" + escapeHtml(text) + "</span>"
    + "<div class=\\"mechanic-meta\\">" + meta.map((item) => "<code>" + escapeHtml(item) + "</code>").join("") + "</div></li>";
}

function describeModifier(modifier) {
  const condition = modifier.condition ? "当" + describeCondition(modifier.condition) + "时，" : "";
  return condition + "对" + targetLabel(modifier.target) + "执行" + modeLabel(modifier.mode)
    + "，数值为 " + String(modifier.value) + "。";
}

function describeTrigger(trigger) {
  const condition = trigger.condition ? "若" + describeCondition(trigger.condition) + "，" : "";
  const effects = (trigger.effects ?? []).map(describeEffect);
  const handler = trigger.handler ? "调用 " + handlerLabel(trigger.handler) + "。": "";
  const limit = trigger.limit ? "限制：" + trigger.limit.scope + " 内最多 " + trigger.limit.count + " 次。" : "";
  const action = effects.length ? "执行：" + effects.join("；") + "。" : "";
  return "在" + timingLabel(trigger.timing) + "时，" + condition + action + handler + limit;
}

function describeCondition(condition) {
  if (!condition) return "总是";
  switch (condition.kind) {
    case "always": return "总是";
    case "subject": return "科目属于 " + condition.subjects.join(" / ");
    case "questionIndex": return "题号 " + compareLabel(condition.op) + " " + condition.value;
    case "questionIndexIn": return "题号属于 " + condition.values.join(" / ");
    case "questionModulo": return "题号对 " + condition.modulo + " 取模等于 " + condition.equals;
    case "result": return "本题结果为" + resultLabel(condition.value);
    case "lastResult": return "上一题结果为" + resultLabel(condition.value);
    case "streak": return streakLabel(condition.streak) + " " + compareLabel(condition.op) + " " + condition.value;
    case "wrongCount": return "本场错题数 " + compareLabel(condition.op) + " " + condition.value;
    case "score": return "当前考试分数 " + compareLabel(condition.op) + " " + condition.value;
    case "stamina": return "当前体力 " + compareLabel(condition.op) + " " + condition.value;
    case "accuracy": return "当前正确率 " + compareLabel(condition.op) + " " + condition.value;
    case "examAllWrong": return "本场考试全错";
    case "scoreRepeatedDigit": return "当前分数包含至少 " + condition.count + " 个相同数字";
    case "scoreStraight": return "当前分数是顺子";
    case "scorePalindrome": return "当前分数是回文";
    case "scoreSquare": return "当前分数是平方数";
    case "scoreCube": return "当前分数是立方数";
    case "ownedArtifact": return "拥有遗物 " + condition.id;
    case "ownedTagCount": return "拥有 tag=" + condition.tag + " 的遗物数 " + compareLabel(condition.op) + " " + condition.value;
    case "lostArtifactIsSelf": return "失去的遗物是自身";
    case "randomChance": return "随机概率命中 " + percent(condition.chance);
    case "all": return condition.conditions.map(describeCondition).join("，且 ");
    case "any": return condition.conditions.map(describeCondition).join("，或 ");
    case "not": return "不满足（" + describeCondition(condition.condition) + "）";
    default: return "未知条件 " + JSON.stringify(condition);
  }
}

function describeEffect(effect) {
  switch (effect.op) {
    case "addStat": return "调整" + targetLabel(effect.stat) + " +" + effect.value;
    case "setStatMin": return "设置" + targetLabel(effect.stat) + "至少为 " + effect.value;
    case "addQuestionAccuracy": return "本题正确率 +" + effect.value;
    case "addQuestionMultiplier": return "本题得分倍率 +" + effect.value;
    case "multiplyQuestionMultiplier": return "本题得分倍率 x" + effect.value;
    case "multiplyQuestionMultiplierByStreak": return "按" + streakLabel(effect.streak) + "以 " + effect.base + " 为底提高本题得分倍率";
    case "addExamMultiplier": return "本场考试倍率 +" + effect.value;
    case "multiplyExamMultiplier": return "本场考试倍率 x" + effect.value;
    case "multiplyRunMultiplier": return "总分倍率 x" + effect.value;
    case "addQuestionScore": return "本题额外得分 +" + effect.value;
    case "convertAccuracyOverflowToQuestionMultiplier": return "将超过 100% 的正确率转换为本题得分倍率";
    case "addExamScore": return "本场考试即时加分 " + signed(effect.value);
    case "addExamPostBonus": return "本场考试后置加分 " + signed(effect.value);
    case "setExamScoreToFull": return "将本场考试分数补到满分";
    case "addNextExamScore": return "下一场考试起始分 " + signed(effect.value);
    case "forceResult": return "强制本题结果为" + resultLabel(effect.result);
    case "queueQuestionModifier": return "为" + scopeLabel(effect.scope) + "排入 " + effect.duration + " 题的" + effect.target + "修正 " + signed(effect.value);
    case "gainRandomArtifacts": return "随机获得 " + effect.count + " 个遗物";
    case "offerDraft": return "立刻进行 " + effect.choices + " 选 " + effect.picks + " 抽取";
    case "destroySelf": return "销毁自身";
    case "destroyOther": return "销毁其他遗物，选择策略为 " + effect.select;
    case "destroyAllOtherAndMultiplyRun": return "销毁所有其他遗物，并按每个 x" + effect.factorPerDestroyed + " 提高总分倍率";
    case "maximizeOnesDigit": return "选择个位数字以最大化考试分";
    case "maximizeDigitSwap": return "交换任意两位数字以最大化考试分";
    case "preventNextDiscard": return "免除下一次超上限丢弃";
    case "log": return "记录日志：" + effect.message;
    default: return "未知效果 " + JSON.stringify(effect);
  }
}

function targetLabel(target) {
  const labels = {
    baseAccuracy: "基础正确率",
    finalAccuracy: "最终正确率",
    stamina: "体力",
    staminaDecay: "体力下降",
    staminaFloor: "体力下限",
    artifactLimit: "遗物上限",
    draftChoicesBonus: "抽取备选数",
    nextDraftChoicesBonus: "下次抽取备选数",
    questionMultiplierBase: "常驻本题倍率",
    questionMultiplier: "本题得分倍率",
    examMultiplier: "本场考试倍率",
    runMultiplier: "总分倍率",
    luckyBlockChance: "幸运方块概率",
    luckyBlockValue: "幸运方块收益"
  };
  return labels[target] ?? target;
}

function modeLabel(mode) {
  return ({ add: "加法修正", multiply: "乘法修正", min: "最小值限制", max: "最大值限制", set: "直接设置" })[mode] ?? mode;
}

function timingLabel(timing) {
  return ({
    RUN_START: "整局开始",
    DRAFT_OFFER: "抽取遗物时",
    ARTIFACT_GAINED: "获得遗物",
    ARTIFACT_LOST: "失去遗物",
    EXAM_START: "考试开始",
    QUESTION_BEFORE_ROLL: "判题前",
    QUESTION_AFTER_ROLL: "判题后",
    QUESTION_SCORE: "本题计分",
    QUESTION_END: "本题结束",
    EXAM_END: "考试结束",
    RUN_END: "整局结束",
    OTHER_ARTIFACT_TRIGGERED: "其他遗物触发后"
  })[timing] ?? timing;
}

function handlerLabel(handler) {
  return ({ mimicRight: "模仿右侧遗物", repeatOtherTrigger: "重复其他遗物触发", triggerRightOnOtherTrigger: "触发右侧遗物", luckyBlock: "幸运方块特殊处理" })[handler] ?? handler;
}

function compareLabel(op) {
  return ({ eq: "=", neq: "≠", lt: "<", lte: "≤", gt: ">", gte: "≥", multipleOf: "每达到倍数" })[op] ?? op;
}

function resultLabel(result) {
  return result === "correct" ? "答对" : "答错";
}

function streakLabel(streak) {
  return streak === "correct" ? "连对数" : "连错数";
}

function scopeLabel(scope) {
  return scope === "nextExam" ? "下一场考试" : "当前考试";
}

function signed(value) {
  return value >= 0 ? "+" + value : String(value);
}

function percent(value) {
  return String(Math.round(value * 10000) / 100) + "%";
}

function renderAttributes(artifact) {
  return "<h3 class=\\"section-title\\">Strict Attributes</h3>" + strictGrid([
    ["id", artifact.id],
    ["name", artifact.name],
    ["rarity", artifact.rarity],
    ["source", artifact.source],
    ["tags", artifact.tags],
    ["maxCopies", artifact.maxCopies ?? 1],
    ["draftable", artifact.draftable !== false],
    ["modifierCount", artifact.modifiers?.length ?? 0],
    ["triggerCount", artifact.triggers.length]
  ]);
}

function renderStrictConfig(artifact) {
  const modifiers = (artifact.modifiers ?? []).length
    ? artifact.modifiers.map((modifier, index) => renderModifierStrict(modifier, index)).join("")
    : "<p class=\\"row-meta\\">No modifiers.</p>";
  return "<h3 class=\\"section-title\\">Strict Modifiers</h3>" + modifiers
    + renderTriggers(artifact)
    + "<details class=\\"raw-details\\"><summary>Raw config JSON</summary><pre>"
    + escapeHtml(JSON.stringify(artifact, null, 2))
    + "</pre></details>";
}

function renderModifierStrict(modifier, index) {
  return "<article class=\\"trigger-block\\">"
    + "<h4 class=\\"trigger-title\\">Modifier " + String(index + 1) + " / " + escapeHtml(modifier.target) + "</h4>"
    + strictGrid([
      ["target", modifier.target],
      ["mode", modifier.mode],
      ["value", modifier.value],
      ["phase", modifier.phase ?? 0],
      ["order", modifier.order ?? 0],
      ["condition", modifier.condition ? describeCondition(modifier.condition) : "always"]
    ])
    + "</article>";
}

function renderTriggers(artifact) {
  const body = artifact.triggers.length === 0
    ? "<p class=\\"row-meta\\">No triggers.</p>"
    : artifact.triggers.map((trigger, index) => renderTrigger(trigger, index)).join("");
  return "<h3 class=\\"section-title\\">Strict Triggers & Effects</h3>" + body;
}

function renderTrigger(trigger, index) {
  return "<article class=\\"trigger-block\\">"
    + "<h4 class=\\"trigger-title\\">Trigger " + String(index + 1) + " / " + escapeHtml(trigger.timing) + "</h4>"
    + strictGrid([
      ["timing", trigger.timing],
      ["phase", trigger.phase ?? 0],
      ["order", trigger.order ?? 0],
      ["priority", trigger.priority ?? 100],
      ["limit", trigger.limit ?? null],
      ["handler", trigger.handler ?? null],
      ["params", trigger.params ?? null],
      ["condition", describeCondition(trigger.condition)],
      ["effects", (trigger.effects ?? []).map(describeEffect)]
    ])
    + "</article>";
}

function strictGrid(rows) {
  return "<dl class=\\"strict-grid\\">" + rows.map(([key, value]) => {
    return "<dt>" + escapeHtml(String(key)) + "</dt><dd>" + strictValue(value) + "</dd>";
  }).join("") + "</dl>";
}

function strictValue(value) {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return "<code>" + escapeHtml(String(value)) + "</code>";
  }
  return "<pre>" + escapeHtml(JSON.stringify(value, null, 2)) + "</pre>";
}

function option(value, label) {
  return "<option value=\\"" + escapeHtml(value) + "\\">" + escapeHtml(label) + "</option>";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\\"": "&quot;",
    "'": "&#39;"
  }[char]));
}
`;
}
