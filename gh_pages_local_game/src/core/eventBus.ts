import type { ArtifactTriggerConfig, OwnedArtifact, Timing } from "./types.js";
import type { GameState } from "./state.js";
import { calcLayerForEffects, phaseForTiming } from "./phases.js";

export interface EventBusEntry {
  owned: OwnedArtifact;
  trigger: ArtifactTriggerConfig;
  triggerIndex: number;
  slotIndex: number;
  phase: number;
  calcLayer: number;
  order: number;
}

export function collectEventEntries(state: GameState, timing: Timing): EventBusEntry[] {
  const entries = [...state.artifacts].flatMap((owned, slotIndex) => {
    const config = state.artifactById.get(owned.artifactId);
    return (config?.triggers ?? [])
      .map((trigger, triggerIndex) => ({
        owned,
        trigger,
        triggerIndex,
        slotIndex,
        phase: trigger.phase ?? phaseForTiming(trigger.timing),
        calcLayer: calcLayerForEffects(trigger.effects),
        order: trigger.order ?? trigger.priority ?? 500
      }))
      .filter((item) => item.trigger.timing === timing);
  });
  return sortEventEntries(entries);
}

export function sortEventEntries(entries: EventBusEntry[]): EventBusEntry[] {
  return [...entries].sort(
    (a, b) =>
      a.phase - b.phase ||
      targetRank(a.trigger) - targetRank(b.trigger) ||
      a.calcLayer - b.calcLayer ||
      a.order - b.order ||
      a.slotIndex - b.slotIndex ||
      a.triggerIndex - b.triggerIndex
  );
}

function targetRank(trigger: ArtifactTriggerConfig): number {
  const op = trigger.effects?.[0]?.op;
  if (!op) {
    return 900;
  }
  if (op.includes("Question")) {
    return 100;
  }
  if (op.includes("Exam")) {
    return 200;
  }
  if (op.includes("CurrentTotal")) {
    return 300;
  }
  return 500;
}
