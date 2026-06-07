import { LOCAL_ARTIFACTS } from "../../gh_pages_local_game/src/artifacts.generated.js";
import {
  runGame,
  type ArtifactConfig,
  type GameOptions,
  type RunResult,
  type SubjectId
} from "../../gh_pages_local_game/src/core/browser.js";
import type {
  ArtifactDecisionEntry,
  DecisionTrace,
  DecisionTraceEntry,
  DecisionTraceRun,
  ScoreDecisionEntry
} from "../../gh_pages_local_game/src/core/trace.js";

export async function replayDecisionTrace(trace: DecisionTrace): Promise<RunResult> {
  if (!trace || trace.version !== 1 || !Array.isArray(trace.runs) || trace.runs.length === 0) {
    throw new Error("invalid_trace");
  }

  let previous: RunResult | undefined;
  for (let index = 0; index < trace.runs.length; index += 1) {
    const segment = trace.runs[index];
    validateSegmentShape(segment);
    if (index === 0) {
      if (segment.mode !== "standard" || segment.year !== 1 || segment.threshold !== 750) {
        throw new Error("invalid_initial_segment");
      }
      previous = await replaySegment(segment, {
        seed: segment.seed,
        subjects: segment.subjects
      });
      continue;
    }

    if (!previous || previous.totalScore <= previous.threshold) {
      throw new Error("invalid_endless_transition");
    }
    const expectedYear = previous.year + 1;
    const expectedThreshold = Math.ceil(previous.threshold * 3);
    const expectedSeed = `${previous.seed}-Y${expectedYear}`;
    if (
      segment.mode !== "endless" ||
      segment.year !== expectedYear ||
      segment.threshold !== expectedThreshold ||
      segment.seed !== expectedSeed
    ) {
      throw new Error("invalid_endless_segment");
    }
    previous = await replaySegment(segment, {
      seed: segment.seed,
      subjects: segment.subjects,
      initialArtifacts: previous.artifactIds,
      initialArtifactMode: "load",
      carryoverStats: previous.carryoverStats,
      year: segment.year,
      threshold: segment.threshold,
      openingDrafts: 0,
      preExamDrafts: true,
      postExamDrafts: false
    });
  }

  if (!previous) throw new Error("invalid_trace");
  return previous;
}

export function assertClientResultMatches(expected: RunResult, client: RunResult): void {
  if (!client || typeof client !== "object") throw new Error("missing_client_result");
  if (client.seed !== expected.seed) throw new Error("seed_mismatch");
  if (client.year !== expected.year) throw new Error("year_mismatch");
  if (client.threshold !== expected.threshold) throw new Error("threshold_mismatch");
  if (Math.round(client.totalScore) !== Math.round(expected.totalScore)) throw new Error("score_mismatch");
  assertArrayEquals(client.subjects, expected.subjects, "subjects_mismatch");
  assertArrayEquals(client.artifactIds, expected.artifactIds, "artifacts_mismatch");
  const clientExamScores = client.exams?.map((exam) => `${exam.subject}:${Math.round(exam.score)}`) ?? [];
  const expectedExamScores = expected.exams.map((exam) => `${exam.subject}:${Math.round(exam.score)}`);
  assertArrayEquals(clientExamScores, expectedExamScores, "exams_mismatch");
}

async function replaySegment(segment: DecisionTraceRun, options: GameOptions): Promise<RunResult> {
  let cursor = 0;
  const nextEntry = (): DecisionTraceEntry => {
    const entry = segment.entries[cursor];
    cursor += 1;
    if (!entry) throw new Error("trace_exhausted");
    return entry;
  };

  const result = await runGame(LOCAL_ARTIFACTS, options, {
    chooseArtifact: (choices, reason) => consumeArtifactDecision(nextEntry(), choices, reason, false),
    chooseDiscard: (owned) => consumeArtifactDecision(nextEntry(), owned, "遗物已达上限", true),
    chooseOnesDigit: (score, subject) => {
      const value = consumeScoreDecision(nextEntry(), "onesDigit", Math.round(score), subject);
      if (typeof value !== "number") throw new Error("invalid_ones_digit");
      return value;
    },
    chooseDigitSwap: (score, subject) => {
      const value = consumeScoreDecision(nextEntry(), "digitSwap", Math.round(score), subject);
      return Array.isArray(value) ? value : undefined;
    }
  });

  if (cursor !== segment.entries.length) throw new Error("unused_trace_entries");
  return result;
}

function consumeArtifactDecision(
  entry: DecisionTraceEntry,
  choices: ArtifactConfig[],
  reason: string,
  discard: boolean
): number {
  if (entry.kind !== "artifact") throw new Error("trace_kind_mismatch");
  const artifactEntry = entry as ArtifactDecisionEntry;
  if (artifactEntry.discard !== discard) {
    throw new Error("artifact_context_mismatch");
  }
  const offeredIds = choices.map((choice) => choice.id);
  assertArrayEquals(artifactEntry.offeredIds, offeredIds, "artifact_offer_mismatch");
  if (!Number.isInteger(artifactEntry.selectedIndex)) throw new Error("invalid_artifact_index");
  if (artifactEntry.selectedIndex < -1 || artifactEntry.selectedIndex >= choices.length) {
    throw new Error("invalid_artifact_index");
  }
  return artifactEntry.selectedIndex;
}

function consumeScoreDecision(
  entry: DecisionTraceEntry,
  mode: ScoreDecisionEntry["mode"],
  score: number,
  subject: SubjectId
): number | [number, number] | undefined {
  if (entry.kind !== "score") throw new Error("trace_kind_mismatch");
  const scoreEntry = entry as ScoreDecisionEntry;
  if (scoreEntry.mode !== mode || scoreEntry.subject !== subject || Math.round(scoreEntry.score) !== score) {
    throw new Error("score_context_mismatch");
  }
  if (mode === "onesDigit") {
    const digit = scoreEntry.value;
    if (typeof digit !== "number" || !Number.isInteger(digit) || digit < 0 || digit > 9) {
      throw new Error("invalid_ones_digit");
    }
    return digit;
  }
  if (!scoreEntry.swap) return undefined;
  const [left, right] = scoreEntry.swap;
  if (!Number.isInteger(left) || !Number.isInteger(right) || left < 0 || right < 0) {
    throw new Error("invalid_digit_swap");
  }
  return [left, right];
}

function validateSegmentShape(segment: DecisionTraceRun): void {
  if (!segment || typeof segment !== "object") throw new Error("invalid_segment");
  if (typeof segment.seed !== "string" || !segment.seed) throw new Error("invalid_segment_seed");
  if (!Array.isArray(segment.subjects) || (segment.subjects.length !== 3 && segment.subjects.length !== 6)) {
    throw new Error("invalid_segment_subjects");
  }
  if (!Number.isInteger(segment.year) || segment.year < 1) throw new Error("invalid_segment_year");
  if (!Number.isFinite(segment.threshold) || segment.threshold < 750) throw new Error("invalid_segment_threshold");
  if (!Array.isArray(segment.entries)) throw new Error("invalid_segment_entries");
}

function assertArrayEquals(left: readonly unknown[], right: readonly unknown[], error: string): void {
  if (left.length !== right.length) throw new Error(error);
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) throw new Error(error);
  }
}
