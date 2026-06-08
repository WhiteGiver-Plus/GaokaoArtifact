import { LOCAL_ARTIFACTS } from "./artifacts.generated.js";
import type { ArtifactConfig } from "./core/browser.js";

const root = requireElement("atlas-root");
const artifacts = [...LOCAL_ARTIFACTS].sort(
  (a, b) => rarityRank(b.rarity) - rarityRank(a.rarity) || a.name.localeCompare(b.name, "zh-Hans-CN")
);
const state = {
  query: new URLSearchParams(window.location.search).get("q")?.trim() ?? ""
};

render();

function render(): void {
  const query = normalize(state.query);
  const visible = query ? artifacts.filter((artifact) => searchText(artifact).includes(query)) : artifacts;
  root.innerHTML = `
    <main class="atlas-shell">
      <section class="atlas-search">
        <label class="atlas-search-box">
          <input data-search type="search" value="${escapeHtml(state.query)}" placeholder="搜索遗物名 / 标签 / 描述 / id" autocomplete="off" autofocus />
          <strong>${visible.length}/${artifacts.length}</strong>
        </label>
      </section>
      <section class="atlas-grid">
        ${visible.map(renderArtifactCard).join("") || `<div class="atlas-empty">没有匹配的遗物</div>`}
      </section>
    </main>
  `;

  const input = root.querySelector<HTMLInputElement>("[data-search]");
  input?.addEventListener("input", () => {
    state.query = input.value;
    updateQueryParam(state.query);
    render();
  });
  input?.focus({ preventScroll: true });
}

function renderArtifactCard(artifact: ArtifactConfig): string {
  const index = artifacts.findIndex((item) => item.id === artifact.id) + 1;
  const code = String(index).padStart(2, "0");
  return `
    <article class="draft-card atlas-card rarity-${rarityClass(artifact.rarity)}">
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
        <strong>${artifact.tags.map((tag) => escapeHtml(tag)).join(" / ")}</strong>
      </div>
    </article>
  `;
}

function searchText(artifact: ArtifactConfig): string {
  return normalize([artifact.id, artifact.name, artifact.description, artifact.rarity, artifact.tags.join(" ")].join(" "));
}

function updateQueryParam(query: string): void {
  const params = new URLSearchParams(window.location.search);
  if (query.trim()) params.set("q", query.trim());
  else params.delete("q");
  const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
  window.history.replaceState(null, "", next);
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

function rarityRank(rarity: ArtifactConfig["rarity"]): number {
  return { special: 3, rare: 2, uncommon: 1, common: 0 }[rarity] ?? 0;
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "");
}

function escapeHtml(value: unknown): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function requireElement(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing #${id}`);
  return element;
}
