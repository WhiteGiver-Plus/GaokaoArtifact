import { describe, expect, it } from "vitest";
import { applyEffect, type EffectRuntime } from "../src/core/effects.js";
import { createGameState } from "../src/core/state.js";
import type { ExamState } from "../src/core/index.js";

describe("manual decision effects", () => {
  it("uses the manually chosen ones digit when C language master resolves", async () => {
    const exam = makeExam(123);
    await applyEffect({ op: "maximizeOnesDigit" }, makeState(), makeRuntime(exam, { digit: 4 }));
    expect(exam.rawScore).toBe(124);
  });

  it("uses the manually chosen digit swap when math lover resolves", async () => {
    const exam = makeExam(102);
    await applyEffect({ op: "maximizeDigitSwap" }, makeState(), makeRuntime(exam, { swap: [1, 2] }));
    expect(exam.rawScore).toBe(120);
  });
});

function makeState() {
  return createGameState("manual", ["chinese", "math", "english", "physics", "chemistry", "biology"], []);
}

function makeRuntime(
  exam: ExamState,
  decisions: { digit?: number; swap?: [number, number] }
): EffectRuntime {
  return {
    owner: { instanceId: "manual#1", artifactId: "manual" },
    exam,
    gainRandomArtifacts: async () => {},
    offerDraft: async () => {},
    destroySelf: async () => {},
    destroyOther: async () => {},
    destroyAllOther: async () => 0,
    chooseOnesDigit: async () => decisions.digit,
    chooseDigitSwap: async () => decisions.swap
  };
}

function makeExam(rawScore: number): ExamState {
  return {
    index: 0,
    subject: "math",
    questionCount: 15,
    pointsPerQuestion: 10,
    fullScore: 150,
    questionIndex: 15,
    rawScore,
    examMultiplier: 1,
    correctCount: 0,
    wrongCount: 0,
    correctStreak: 0,
    wrongStreak: 0,
    previousWrongStreak: 0,
    currentAccuracyBonus: 0,
    currentFinalAccuracy: 0,
    currentQuestionMultiplier: 1,
    questionMultiplierAdds: [],
    questionMultiplierMuls: [],
    currentQuestionFlatScore: 0,
    examMultiplierAdds: [],
    examMultiplierMuls: [],
    examPostBonus: 0,
    questionLogs: [],
    questionModifiers: []
  };
}
