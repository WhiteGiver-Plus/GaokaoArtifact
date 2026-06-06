import type {
  ArtifactConfig,
  ExamLog,
  OwnedArtifact,
  QuestionModifier,
  RunStats,
  SubjectId
} from "./types.js";
import { SeededRng } from "./rng.js";

export interface GameState {
  seed: string;
  rng: SeededRng;
  artifactConfigs: ArtifactConfig[];
  artifactById: Map<string, ArtifactConfig>;
  artifacts: OwnedArtifact[];
  log: string[];
  exams: ExamLog[];
  stats: RunStats;
  triggerCounts: Map<string, number>;
  instanceSeq: number;
  currentEventCount: number;
  subjects: SubjectId[];
  nextExamQuestionModifiers: QuestionModifier[];
  onLog?: (line: string) => void;
}

export function createGameState(
  seed: string,
  subjects: SubjectId[],
  artifactConfigs: ArtifactConfig[]
): GameState {
  return {
    seed,
    rng: new SeededRng(seed),
    artifactConfigs,
    artifactById: new Map(artifactConfigs.map((artifact) => [artifact.id, artifact])),
    artifacts: [],
    log: [],
    exams: [],
    stats: {
      baseAccuracy: 50,
      baseStamina: 100,
      stamina: 100,
      staminaDecay: 5,
      staminaFloor: 0,
      artifactLimit: 9,
      draftChoicesBonus: 0,
      nextDraftChoicesBonus: 0,
      questionMultiplierBase: 1,
      currentTotalAdjustment: 0,
      luckyBlockValueMultiplier: 1,
      pendingNextExamScore: 0,
      preventDiscardCharges: 0
    },
    triggerCounts: new Map(),
    instanceSeq: 0,
    currentEventCount: 0,
    subjects,
    nextExamQuestionModifiers: []
  };
}

export function createOwnedArtifact(state: GameState, artifactId: string): OwnedArtifact {
  state.instanceSeq += 1;
  return {
    instanceId: `${artifactId}#${state.instanceSeq}`,
    artifactId
  };
}

export function appendLog(state: GameState, line: string): void {
  state.log.push(line);
  state.onLog?.(line);
}
