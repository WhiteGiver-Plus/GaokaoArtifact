import { describe, expect, it } from "vitest";
import { loadArtifacts } from "../src/core/index.js";

describe("artifact configs", () => {
  it("loads exactly 62 unique artifacts", async () => {
    const artifacts = await loadArtifacts();
    expect(artifacts).toHaveLength(62);
    expect(new Set(artifacts.map((artifact) => artifact.id)).size).toBe(62);
  });

  it("keeps every artifact in config form", async () => {
    const artifacts = await loadArtifacts();
    expect(artifacts.every((artifact) => Array.isArray(artifact.triggers))).toBe(true);
    expect(artifacts.some((artifact) => artifact.id === "holy_water_collector")).toBe(true);
  });
});
