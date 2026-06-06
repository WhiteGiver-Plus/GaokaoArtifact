import { describe, expect, it } from "vitest";
import { loadArtifacts, runGame, type ArtifactConfig } from "../src/core/index.js";

describe("game engine", () => {
  it("is deterministic for the same seed and policy", async () => {
    const artifacts = await loadArtifacts();
    const first = await runGame(artifacts, { seed: "20260606", autoPolicy: "first" });
    const second = await runGame(artifacts, { seed: "20260606", autoPolicy: "first" });
    expect(second.totalScore).toBe(first.totalScore);
    expect(second.log).toEqual(first.log);
  });

  it("runs six exams with fifteen questions each", async () => {
    const artifacts = await loadArtifacts();
    const result = await runGame(artifacts, { seed: "flow", autoPolicy: "rare" });
    expect(result.exams).toHaveLength(6);
    expect(result.exams.every((exam) => exam.questions.length === 15)).toBe(true);
  });

  it("enforces the default artifact limit", async () => {
    const result = await runGame(makeBlankArtifacts(20), { seed: "limit", autoPolicy: "first" });
    expect(result.artifactNames.length).toBeLessThanOrEqual(8);
  });
});

function makeBlankArtifacts(count: number): ArtifactConfig[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `blank_${index}`,
    name: `空白 ${index}`,
    source: "test",
    rarity: "common",
    tags: ["test"],
    description: "No effect.",
    triggers: []
  }));
}
