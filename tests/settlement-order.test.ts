import { describe, expect, it } from "vitest";
import { collectEventEntries } from "../src/core/eventBus.js";
import { queryModifierValue } from "../src/core/modifierSystem.js";
import { createGameState } from "../src/core/state.js";
import type { ArtifactConfig } from "../src/core/index.js";

describe("settlement ordering", () => {
  it("always applies additive modifiers before multiplicative modifiers", () => {
    const artifacts: ArtifactConfig[] = [
      makeArtifact("mul", [{ target: "questionMultiplier", mode: "multiply", value: 2 }]),
      makeArtifact("add", [{ target: "questionMultiplier", mode: "add", value: 1 }])
    ];
    const state = createGameState("order", ["chinese", "math", "english", "physics", "chemistry", "biology"], artifacts);
    state.artifacts = [
      { instanceId: "mul#1", artifactId: "mul" },
      { instanceId: "add#2", artifactId: "add" }
    ];
    expect(queryModifierValue(state, "questionMultiplier", 1)).toBe(4);
  });

  it("orders add effects before multiply effects in the same phase", () => {
    const artifacts: ArtifactConfig[] = [
      makeArtifact("mul", [], [{ timing: "QUESTION_SCORE", effects: [{ op: "multiplyQuestionMultiplier", value: 2 }] }]),
      makeArtifact("add", [], [{ timing: "QUESTION_SCORE", effects: [{ op: "addQuestionMultiplier", value: 1 }] }])
    ];
    const state = createGameState("bus", ["chinese", "math", "english", "physics", "chemistry", "biology"], artifacts);
    state.artifacts = [
      { instanceId: "mul#1", artifactId: "mul" },
      { instanceId: "add#2", artifactId: "add" }
    ];
    expect(collectEventEntries(state, "QUESTION_SCORE").map((entry) => entry.owned.artifactId)).toEqual([
      "add",
      "mul"
    ]);
  });
});

function makeArtifact(
  id: string,
  modifiers: ArtifactConfig["modifiers"] = [],
  triggers: ArtifactConfig["triggers"] = []
): ArtifactConfig {
  return {
    id,
    name: id,
    source: "test",
    rarity: "common",
    tags: ["test"],
    description: "test",
    modifiers,
    triggers
  };
}
