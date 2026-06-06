export const REQUIRED_SUBJECTS = ["chinese", "math", "english"] as const;
export const ELECTIVE_SUBJECTS = [
  "physics",
  "chemistry",
  "biology",
  "politics",
  "history",
  "geography"
] as const;

export const SUBJECT_LABELS: Record<SubjectId, string> = {
  chinese: "语文",
  math: "数学",
  english: "英语",
  physics: "物理",
  chemistry: "化学",
  biology: "生物",
  politics: "政治",
  history: "历史",
  geography: "地理"
};

export type SubjectId =
  | (typeof REQUIRED_SUBJECTS)[number]
  | (typeof ELECTIVE_SUBJECTS)[number];

export type Rarity = "common" | "uncommon" | "rare" | "special";

export type Timing =
  | "RUN_START"
  | "DRAFT_OFFER"
  | "ARTIFACT_GAINED"
  | "ARTIFACT_LOST"
  | "EXAM_START"
  | "QUESTION_BEFORE_ROLL"
  | "QUESTION_AFTER_ROLL"
  | "QUESTION_SCORE"
  | "QUESTION_END"
  | "EXAM_END"
  | "RUN_END"
  | "OTHER_ARTIFACT_TRIGGERED";

export type CompareOp = "eq" | "neq" | "lt" | "lte" | "gt" | "gte";

export type ConditionConfig =
  | { kind: "always" }
  | { kind: "subject"; subjects: SubjectId[] }
  | { kind: "questionIndex"; op: CompareOp; value: number }
  | { kind: "questionIndexIn"; values: number[] }
  | { kind: "questionModulo"; modulo: number; equals: number }
  | { kind: "result"; value: "correct" | "wrong" }
  | { kind: "lastResult"; value: "correct" | "wrong" }
  | {
      kind: "streak";
      streak: "correct" | "wrong";
      op: CompareOp | "multipleOf";
      value: number;
    }
  | { kind: "wrongCount"; op: CompareOp; value: number }
  | { kind: "score"; op: CompareOp; value: number }
  | { kind: "stamina"; op: CompareOp; value: number }
  | { kind: "accuracy"; op: CompareOp; value: number }
  | { kind: "examAllWrong" }
  | { kind: "scoreRepeatedDigit"; count: number }
  | { kind: "scoreStraight" }
  | { kind: "scorePalindrome" }
  | { kind: "scoreSquare" }
  | { kind: "scoreCube" }
  | { kind: "ownedArtifact"; id: string }
  | { kind: "ownedTagCount"; tag: string; op: CompareOp; value: number }
  | { kind: "lostArtifactIsSelf" }
  | { kind: "randomChance"; chance: number }
  | { kind: "all"; conditions: ConditionConfig[] }
  | { kind: "any"; conditions: ConditionConfig[] }
  | { kind: "not"; condition: ConditionConfig };

export type EffectConfig =
  | {
      op: "addStat";
      stat:
        | "baseAccuracy"
        | "stamina"
        | "staminaDecay"
        | "staminaFloor"
        | "artifactLimit"
        | "draftChoicesBonus"
        | "nextDraftChoicesBonus"
        | "questionMultiplierBase";
      value: number;
    }
  | { op: "setStatMin"; stat: "staminaFloor"; value: number }
  | { op: "addQuestionAccuracy"; value: number }
  | { op: "addQuestionMultiplier"; value: number }
  | { op: "multiplyQuestionMultiplier"; value: number }
  | {
      op: "multiplyQuestionMultiplierByStreak";
      streak: "correct" | "wrong";
      base: number;
      usePrevious?: boolean;
    }
  | { op: "addExamMultiplier"; value: number }
  | { op: "multiplyExamMultiplier"; value: number }
  | { op: "multiplyRunMultiplier"; value: number }
  | { op: "addQuestionScore"; value: number }
  | { op: "convertAccuracyOverflowToQuestionMultiplier" }
  | { op: "addExamScore"; value: number }
  | { op: "addExamPostBonus"; value: number }
  | { op: "setExamScoreToFull" }
  | { op: "addNextExamScore"; value: number }
  | { op: "forceResult"; result: "correct" | "wrong" }
  | {
      op: "queueQuestionModifier";
      target: "accuracy" | "multiplier";
      value: number;
      mode?: "add" | "multiply";
      duration: number;
      scope?: "currentExam" | "nextExam";
    }
  | { op: "gainRandomArtifacts"; count: number }
  | { op: "offerDraft"; choices: number; picks: number }
  | { op: "destroySelf" }
  | { op: "destroyOther"; select: "leftmost" | "rightmost" | "random" }
  | { op: "destroyAllOtherAndMultiplyRun"; factorPerDestroyed: number }
  | { op: "maximizeOnesDigit" }
  | { op: "maximizeDigitSwap" }
  | { op: "preventNextDiscard" }
  | { op: "log"; message: string };

export interface TriggerLimitConfig {
  scope: "run" | "exam";
  count: number;
}

export interface ArtifactTriggerConfig {
  timing: Timing;
  phase?: number;
  order?: number;
  priority?: number;
  condition?: ConditionConfig;
  effects?: EffectConfig[];
  handler?: "mimicRight" | "repeatOtherTrigger" | "triggerRightOnOtherTrigger" | "luckyBlock";
  params?: Record<string, unknown>;
  limit?: TriggerLimitConfig;
}

export type ModifierTarget =
  | "baseAccuracy"
  | "finalAccuracy"
  | "staminaDecay"
  | "staminaFloor"
  | "artifactLimit"
  | "draftChoicesBonus"
  | "questionMultiplier"
  | "examMultiplier"
  | "runMultiplier"
  | "luckyBlockChance"
  | "luckyBlockValue";

export type ModifierMode = "add" | "multiply" | "min" | "max" | "set";

export interface ModifierConfig {
  target: ModifierTarget;
  mode: ModifierMode;
  value: number;
  phase?: number;
  order?: number;
  condition?: ConditionConfig;
}

export interface ArtifactConfig {
  id: string;
  name: string;
  source: string;
  rarity: Rarity;
  tags: string[];
  maxCopies?: number;
  draftable?: boolean;
  description: string;
  modifiers?: ModifierConfig[];
  triggers: ArtifactTriggerConfig[];
}

export interface OwnedArtifact {
  instanceId: string;
  artifactId: string;
}

export interface QuestionLog {
  subject: SubjectId;
  questionIndex: number;
  staminaBefore: number;
  staminaAfter: number;
  accuracy: number;
  roll: number;
  correct: boolean;
  scoreGained: number;
}

export interface ExamLog {
  subject: SubjectId;
  score: number;
  correctCount: number;
  wrongCount: number;
  questions: QuestionLog[];
}

export interface RunResult {
  seed: string;
  subjects: SubjectId[];
  artifactNames: string[];
  exams: ExamLog[];
  totalScore: number;
  log: string[];
}

export interface GameOptions {
  seed?: string;
  subjects?: SubjectId[];
  autoPolicy?: "first" | "random" | "rare";
}

export interface DraftOffer {
  choices: ArtifactConfig[];
  picked: ArtifactConfig;
}

export interface ChoiceHooks {
  chooseArtifact?: (choices: ArtifactConfig[], reason: string) => Promise<number> | number;
  chooseDiscard?: (owned: ArtifactConfig[]) => Promise<number> | number;
  chooseOnesDigit?: (score: number, subject: SubjectId) => Promise<number> | number;
  chooseDigitSwap?:
    | ((score: number, subject: SubjectId) => Promise<[number, number] | undefined> | [number, number] | undefined);
  onLog?: (line: string) => void;
  onArtifactsChanged?: (owned: ArtifactConfig[]) => void;
  onExamStart?: (exam: { index: number; subject: SubjectId; startingScore: number }) => void;
  beforeQuestion?: (exam: { index: number; subject: SubjectId; questionIndex: number }) => Promise<void> | void;
  onQuestion?: (question: QuestionLog, exam: { index: number; subject: SubjectId; rawScore: number }) => void;
  onExamEnd?: (exam: ExamLog) => void;
  onRunEnd?: (result: RunResult) => void;
}

export interface QuestionModifier {
  target: "accuracy" | "multiplier";
  value: number;
  mode: "add" | "multiply";
  remaining: number;
  source: string;
}

export interface RunStats {
  baseAccuracy: number;
  stamina: number;
  staminaDecay: number;
  staminaFloor: number;
  artifactLimit: number;
  draftChoicesBonus: number;
  nextDraftChoicesBonus: number;
  questionMultiplierBase: number;
  runMultiplier: number;
  runMultiplierAdds: number[];
  runMultiplierMuls: number[];
  runPostBonus: number;
  luckyBlockValueMultiplier: number;
  pendingNextExamScore: number;
  preventDiscardCharges: number;
}

export interface ExamState {
  index: number;
  subject: SubjectId;
  questionCount: number;
  pointsPerQuestion: number;
  fullScore: number;
  questionIndex: number;
  rawScore: number;
  examMultiplier: number;
  correctCount: number;
  wrongCount: number;
  correctStreak: number;
  wrongStreak: number;
  previousWrongStreak: number;
  lastResult?: "correct" | "wrong";
  currentResult?: "correct" | "wrong";
  currentAccuracyBonus: number;
  currentFinalAccuracy: number;
  currentQuestionMultiplier: number;
  questionMultiplierAdds: number[];
  questionMultiplierMuls: number[];
  currentQuestionFlatScore: number;
  examMultiplierAdds: number[];
  examMultiplierMuls: number[];
  examPostBonus: number;
  forcedResult?: "correct" | "wrong";
  currentQuestionLog?: QuestionLog;
  questionLogs: QuestionLog[];
  questionModifiers: QuestionModifier[];
}

export interface TriggerContext {
  timing: Timing;
  owner: OwnedArtifact;
  triggerIndex: number;
  trigger: ArtifactTriggerConfig;
  lostArtifact?: OwnedArtifact;
  replay?: boolean;
  mimicDepth?: number;
  sourceTrigger?: TriggerContext;
}
