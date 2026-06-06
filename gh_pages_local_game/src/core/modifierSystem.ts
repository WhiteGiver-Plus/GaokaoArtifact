import type { ExamState, ModifierConfig, ModifierTarget, OwnedArtifact } from "./types.js";
import type { GameState } from "./state.js";
import { evaluateCondition } from "./conditions.js";

export interface ModifierContext {
  exam?: ExamState;
}

export function queryModifierValue(
  state: GameState,
  target: ModifierTarget,
  baseValue: number,
  context: ModifierContext = {}
): number {
  const active = collectActiveModifiers(state, target, context);
  let value = baseValue;

  for (const modifier of sortModifiers(active).filter((item) => item.mode === "set")) {
    value = modifier.value;
  }
  for (const modifier of sortModifiers(active).filter((item) => item.mode === "add")) {
    value += modifier.value;
  }
  for (const modifier of sortModifiers(active).filter((item) => item.mode === "multiply")) {
    value *= modifier.value;
  }
  for (const modifier of sortModifiers(active).filter((item) => item.mode === "min")) {
    value = Math.max(value, modifier.value);
  }
  for (const modifier of sortModifiers(active).filter((item) => item.mode === "max")) {
    value = Math.min(value, modifier.value);
  }

  return value;
}

function collectActiveModifiers(
  state: GameState,
  target: ModifierTarget,
  context: ModifierContext
): ModifierConfig[] {
  const modifiers: ModifierConfig[] = [];
  for (const owned of state.artifacts) {
    const config = state.artifactById.get(owned.artifactId);
    for (const modifier of config?.modifiers ?? []) {
      if (modifier.target !== target) {
        continue;
      }
      if (!evaluateCondition(modifier.condition, state, { exam: context.exam, owner: owned })) {
        continue;
      }
      modifiers.push(modifier);
    }
  }
  return modifiers;
}

function sortModifiers(modifiers: ModifierConfig[]): ModifierConfig[] {
  return [...modifiers].sort(
    (a, b) => (a.phase ?? 0) - (b.phase ?? 0) || (a.order ?? 500) - (b.order ?? 500)
  );
}
