import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import type {
  ArtifactConfig,
  ArtifactTriggerConfig,
  EffectConfig,
  Rarity,
  Timing
} from "./types.js";

const TIMINGS: Set<Timing> = new Set([
  "RUN_START",
  "DRAFT_OFFER",
  "ARTIFACT_GAINED",
  "ARTIFACT_LOST",
  "EXAM_START",
  "QUESTION_BEFORE_ROLL",
  "QUESTION_AFTER_ROLL",
  "QUESTION_SCORE",
  "QUESTION_END",
  "EXAM_END",
  "RUN_END",
  "OTHER_ARTIFACT_TRIGGERED"
]);

const RARITIES: Set<Rarity> = new Set(["common", "uncommon", "rare", "special"]);

export async function loadArtifacts(
  filePath = path.join(process.cwd(), "data", "artifacts")
): Promise<ArtifactConfig[]> {
  const parsed = await readArtifactJson(filePath);
  return validateArtifacts(parsed);
}

async function readArtifactJson(filePath: string): Promise<unknown[]> {
  const info = await stat(filePath);
  if (!info.isDirectory()) {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as unknown[];
  }
  const files = (await readdir(filePath))
    .filter((file) => file.endsWith(".json"))
    .sort();
  const chunks = await Promise.all(
    files.map(async (file) => JSON.parse(await readFile(path.join(filePath, file), "utf8")))
  );
  return chunks.flat() as unknown[];
}

export function validateArtifacts(parsed: unknown): ArtifactConfig[] {
  if (!Array.isArray(parsed)) {
    throw new Error("Artifact config must be an array.");
  }

  const ids = new Set<string>();
  const artifacts = parsed.map((item, index) => validateArtifact(item, index));
  for (const artifact of artifacts) {
    if (ids.has(artifact.id)) {
      throw new Error(`Duplicate artifact id: ${artifact.id}`);
    }
    ids.add(artifact.id);
  }
  return artifacts;
}

function validateArtifact(item: unknown, index: number): ArtifactConfig {
  const artifact = asRecord(item, `artifact[${index}]`);
  const id = requireString(artifact, "id", index);
  const name = requireString(artifact, "name", index);
  const source = requireString(artifact, "source", index);
  const rarity = requireString(artifact, "rarity", index) as Rarity;
  const description = requireString(artifact, "description", index);
  if (!RARITIES.has(rarity)) {
    throw new Error(`Invalid rarity for ${id}: ${rarity}`);
  }
  const tagsValue = artifact.tags;
  if (!Array.isArray(tagsValue) || tagsValue.some((tag) => typeof tag !== "string")) {
    throw new Error(`Artifact ${id} must have string[] tags.`);
  }
  const triggersValue = artifact.triggers;
  if (!Array.isArray(triggersValue)) {
    throw new Error(`Artifact ${id} must have triggers array.`);
  }
  const triggers = triggersValue.map((trigger, triggerIndex) =>
    validateTrigger(trigger, id, triggerIndex)
  );

  return {
    id,
    name,
    source,
    rarity,
    tags: tagsValue,
    description,
    modifiers: Array.isArray(artifact.modifiers) ? (artifact.modifiers as ArtifactConfig["modifiers"]) : [],
    triggers,
    maxCopies: optionalNumber(artifact.maxCopies, 1),
    draftable: optionalBoolean(artifact.draftable, true)
  };
}

function validateTrigger(
  value: unknown,
  artifactId: string,
  triggerIndex: number
): ArtifactTriggerConfig {
  const trigger = asRecord(value, `${artifactId}.triggers[${triggerIndex}]`);
  const timing = requireString(trigger, "timing", triggerIndex) as Timing;
  if (!TIMINGS.has(timing)) {
    throw new Error(`Artifact ${artifactId} has invalid timing: ${timing}`);
  }

  const effects = trigger.effects;
  if (effects !== undefined && !Array.isArray(effects)) {
    throw new Error(`Artifact ${artifactId} trigger ${triggerIndex} effects must be an array.`);
  }
  if (effects) {
    for (const effect of effects) {
      validateEffect(effect as EffectConfig, artifactId, triggerIndex);
    }
  }

  return trigger as unknown as ArtifactTriggerConfig;
}

function validateEffect(effect: EffectConfig, artifactId: string, triggerIndex: number): void {
  if (!effect || typeof effect !== "object" || typeof (effect as { op?: unknown }).op !== "string") {
    throw new Error(`Artifact ${artifactId} trigger ${triggerIndex} has invalid effect.`);
  }
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function requireString(record: Record<string, unknown>, key: string, index: number): string {
  const value = record[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Item ${index} missing string field ${key}.`);
  }
  return value;
}

function optionalNumber(value: unknown, fallback: number): number {
  return typeof value === "number" ? value : fallback;
}

function optionalBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}
