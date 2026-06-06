import type { ConditionConfig, ExamState, OwnedArtifact } from "./types.js";
import type { GameState } from "./state.js";
import {
  compare,
  hasRepeatedDigit,
  hasStraightDigits,
  isCube,
  isPalindromeScore,
  isSquare
} from "./math.js";

export interface ConditionRuntime {
  exam?: ExamState;
  owner: OwnedArtifact;
  lostArtifact?: OwnedArtifact;
}

export function evaluateCondition(
  condition: ConditionConfig | undefined,
  state: GameState,
  runtime: ConditionRuntime
): boolean {
  if (!condition || condition.kind === "always") {
    return true;
  }
  const exam = runtime.exam;

  switch (condition.kind) {
    case "subject":
      return Boolean(exam && condition.subjects.includes(exam.subject));
    case "questionIndex":
      return Boolean(exam && compare(exam.questionIndex, condition.op, condition.value));
    case "questionIndexIn":
      return Boolean(exam && condition.values.includes(exam.questionIndex));
    case "questionModulo":
      return Boolean(exam && exam.questionIndex % condition.modulo === condition.equals);
    case "result":
      return exam?.currentResult === condition.value;
    case "lastResult":
      return exam?.lastResult === condition.value;
    case "streak":
      return evaluateStreak(condition, exam);
    case "wrongCount":
      return Boolean(exam && compare(exam.wrongCount, condition.op, condition.value));
    case "score":
      return Boolean(exam && compare(Math.round(exam.rawScore), condition.op, condition.value));
    case "stamina":
      return compare(state.stats.stamina, condition.op, condition.value);
    case "accuracy":
      return Boolean(exam && compare(exam.currentFinalAccuracy, condition.op, condition.value));
    case "examAllWrong":
      return Boolean(exam && exam.wrongCount === exam.questionCount);
    case "scoreRepeatedDigit":
      return Boolean(exam && hasRepeatedDigit(exam.rawScore, condition.count));
    case "scoreStraight":
      return Boolean(exam && hasStraightDigits(exam.rawScore));
    case "scorePalindrome":
      return Boolean(exam && isPalindromeScore(exam.rawScore));
    case "scoreSquare":
      return Boolean(exam && isSquare(exam.rawScore));
    case "scoreCube":
      return Boolean(exam && isCube(exam.rawScore));
    case "ownedArtifact":
      return state.artifacts.some((artifact) => artifact.artifactId === condition.id);
    case "ownedTagCount":
      return compare(countOwnedTag(state, condition.tag), condition.op, condition.value);
    case "lostArtifactIsSelf":
      return runtime.lostArtifact?.instanceId === runtime.owner.instanceId;
    case "randomChance":
      return state.rng.next() < condition.chance;
    case "all":
      return condition.conditions.every((item) => evaluateCondition(item, state, runtime));
    case "any":
      return condition.conditions.some((item) => evaluateCondition(item, state, runtime));
    case "not":
      return !evaluateCondition(condition.condition, state, runtime);
  }
}

function evaluateStreak(
  condition: Extract<ConditionConfig, { kind: "streak" }>,
  exam?: ExamState
): boolean {
  if (!exam) {
    return false;
  }
  const value = condition.streak === "correct" ? exam.correctStreak : exam.wrongStreak;
  if (condition.op === "multipleOf") {
    return value > 0 && value % condition.value === 0;
  }
  return compare(value, condition.op, condition.value);
}

function countOwnedTag(state: GameState, tag: string): number {
  return state.artifacts.filter((owned) => {
    const config = state.artifactById.get(owned.artifactId);
    return config?.tags.includes(tag);
  }).length;
}
