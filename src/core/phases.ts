import type { EffectConfig, Timing } from "./types.js";

export const PHASE = {
  ARTIFACT_GAINED: 3000,
  ARTIFACT_LOST: 3100,
  ARTIFACT_LIMIT_CHECK: 3200,
  EXAM_START: 4100,
  EXAM_START_SCORE: 4200,
  QUESTION_PREPARE: 5000,
  QUESTION_BEFORE_ACCURACY: 5100,
  QUESTION_RESULT_MODIFY: 5300,
  QUESTION_SCORE_MODIFY: 5500,
  QUESTION_AFTER_SCORE: 5700,
  QUESTION_STAMINA_DECAY: 5800,
  QUESTION_END: 5900,
  EXAM_END_PRE_SCORE: 6000,
  EXAM_PATTERN_TRIGGER: 6200,
  EXAM_MULTIPLIER_MODIFY: 6300,
  EXAM_POST_FLAT_BONUS: 6500,
  EXAM_FINALIZE: 6600,
  RUN_END_PRE_TOTAL: 8000,
  RUN_TOTAL_MULTIPLIER: 8100,
  OTHER_ARTIFACT_TRIGGERED: 9000
} as const;

export function phaseForTiming(timing: Timing): number {
  const map: Record<Timing, number> = {
    RUN_START: 1000,
    DRAFT_OFFER: 2100,
    ARTIFACT_GAINED: PHASE.ARTIFACT_GAINED,
    ARTIFACT_LOST: PHASE.ARTIFACT_LOST,
    EXAM_START: PHASE.EXAM_START,
    QUESTION_BEFORE_ROLL: PHASE.QUESTION_BEFORE_ACCURACY,
    QUESTION_AFTER_ROLL: PHASE.QUESTION_RESULT_MODIFY,
    QUESTION_SCORE: PHASE.QUESTION_SCORE_MODIFY,
    QUESTION_END: PHASE.QUESTION_END,
    EXAM_END: PHASE.EXAM_PATTERN_TRIGGER,
    RUN_END: PHASE.RUN_TOTAL_MULTIPLIER,
    OTHER_ARTIFACT_TRIGGERED: PHASE.OTHER_ARTIFACT_TRIGGERED
  };
  return map[timing];
}

export function calcLayerForEffects(effects: EffectConfig[] = []): number {
  if (effects.some((effect) => isMultiplyEffect(effect))) {
    return 200;
  }
  if (effects.some((effect) => isAddEffect(effect))) {
    return 100;
  }
  if (effects.some((effect) => effect.op === "setStatMin" || effect.op === "setExamScoreToFull")) {
    return 300;
  }
  return 500;
}

function isAddEffect(effect: EffectConfig): boolean {
  return [
    "addStat",
    "addQuestionAccuracy",
    "addQuestionMultiplier",
    "addQuestionScore",
    "convertAccuracyOverflowToQuestionMultiplier",
    "addExamMultiplier",
    "addExamScore",
    "addExamPostBonus",
    "addNextExamScore"
  ].includes(effect.op);
}

function isMultiplyEffect(effect: EffectConfig): boolean {
  return [
    "multiplyQuestionMultiplier",
    "multiplyQuestionMultiplierByStreak",
    "multiplyExamMultiplier",
    "multiplyRunMultiplier"
  ].includes(effect.op);
}
