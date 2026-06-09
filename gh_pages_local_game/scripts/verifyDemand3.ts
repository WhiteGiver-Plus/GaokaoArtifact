import { loadArtifacts, runGame, type ArtifactConfig } from "../src/core/index.js";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const artifacts = await loadArtifacts();

await verifyProcessPoints(artifacts);
await verifyChainBonus(artifacts);
verifyArchetypeTags(artifacts);
await verifyTagWeightBias(artifacts);

console.log("demand3 verification passed");

async function verifyProcessPoints(artifactConfigs: ArtifactConfig[]): Promise<void> {
  const [plainWrong, processWrong, processWrongWithMultiplier] = await Promise.all([
    runGame(artifactConfigs, {
      seed: "demand3-process-plain",
      initialArtifacts: ["self_sacrifice"],
      initialArtifactMode: "load",
      subjects: ["chinese", "math", "english", "physics", "chemistry", "biology"],
      postExamDrafts: false,
      openingDrafts: 0
    }),
    runGame(artifactConfigs, {
      seed: "demand3-process-base",
      initialArtifacts: ["self_sacrifice", "process_points"],
      initialArtifactMode: "load",
      subjects: ["chinese", "math", "english", "physics", "chemistry", "biology"],
      postExamDrafts: false,
      openingDrafts: 0
    }),
    runGame(artifactConfigs, {
      seed: "demand3-process-multiplier",
      initialArtifacts: ["self_sacrifice", "process_points", "final_question_warrior"],
      initialArtifactMode: "load",
      subjects: ["chinese", "math", "english", "physics", "chemistry", "biology"],
      postExamDrafts: false,
      openingDrafts: 0
    })
  ]);

  assert(plainWrong.exams[0].score === 0, "wrong answers without process_points should still score 0");
  assert(processWrong.exams[0].score === 15, "process_points should add 1 multiplied point to each wrong question");
  assert(
    processWrongWithMultiplier.exams[0].questions[14].scoreGained === 10,
    "process_points should be affected by final-question multiplier"
  );
  assert(
    processWrongWithMultiplier.exams[0].score === 24,
    "process_points should add 14 normal wrong points plus 10 multiplied final-question points"
  );
}

async function verifyChainBonus(artifactConfigs: ArtifactConfig[]): Promise<void> {
  const chainOnly = await runGame(artifactConfigs, {
    seed: "demand3-chain-only",
    initialArtifacts: ["chain_is_method"],
    initialArtifactMode: "load",
    carryoverStats: { baseAccuracy: 0 },
    subjects: ["chinese", "math", "english", "physics", "chemistry", "biology"],
    postExamDrafts: false,
    openingDrafts: 0
  });
  const result = await runGame(artifactConfigs, {
    seed: "demand3-chain",
    initialArtifacts: ["process_points", "chain_is_method"],
    initialArtifactMode: "load",
    carryoverStats: { baseAccuracy: 0 },
    subjects: ["chinese", "math", "english", "physics", "chemistry", "biology"],
    postExamDrafts: false,
    openingDrafts: 0
  });

  assert(
    chainOnly.exams[0].score === 0,
    "chain_is_method should not add score when no prior question artifact triggered"
  );
  assert(
    result.exams[0].score === 45,
    "chain_is_method should add 30 final-score points on top of 15 process points"
  );
}

function verifyArchetypeTags(artifactConfigs: ArtifactConfig[]): void {
  const requiredTags = [
    "高正确率",
    "低正确率",
    "连败",
    "连胜",
    "胜败交替",
    "藏品流",
    "体力",
    "错题",
    "幸运方块",
    "豌豆"
  ];
  const tags = new Set(artifactConfigs.flatMap((artifact) => artifact.tags));
  for (const tag of requiredTags) {
    assert(tags.has(tag), `missing archetype tag: ${tag}`);
  }
  assert(!tags.has("blank"), "legacy internal blank tag should not be player-facing");
}

async function verifyTagWeightBias(artifactConfigs: ArtifactConfig[]): Promise<void> {
  const weightedRuns = await countOfferedArtifacts(artifactConfigs, ["eureka"], 1200);
  const baselineRuns = await countOfferedArtifacts(artifactConfigs, [], 1200);
  const highAccuracyIds = new Set(
    artifactConfigs
      .filter((artifact) => artifact.id !== "eureka" && artifact.tags.includes("高正确率"))
      .map((artifact) => artifact.id)
  );

  const weightedHighAccuracy = countIds(weightedRuns, highAccuracyIds);
  const baselineHighAccuracy = countIds(baselineRuns, highAccuracyIds);
  assert(
    weightedHighAccuracy > baselineHighAccuracy,
    `same-tag weighting should increase 高正确率 offers (${weightedHighAccuracy} <= ${baselineHighAccuracy})`
  );
}

async function countOfferedArtifacts(
  artifactConfigs: ArtifactConfig[],
  initialArtifacts: string[],
  runs: number
): Promise<string[]> {
  const offered: string[] = [];
  for (let i = 0; i < runs; i += 1) {
    await runGame(
      artifactConfigs,
      {
        seed: `demand3-weight-${initialArtifacts.join("-") || "baseline"}-${i}`,
        initialArtifacts,
        initialArtifactMode: "load",
        subjects: ["chinese", "math", "english", "physics", "chemistry", "biology"],
        preExamDrafts: true,
        postExamDrafts: false,
        openingDrafts: 0
      },
      {
        chooseArtifact: (choices) => {
          offered.push(...choices.map((choice) => choice.id));
          return -1;
        }
      }
    );
  }
  return offered;
}

function countIds(ids: string[], targetIds: Set<string>): number {
  return ids.reduce((sum, id) => sum + (targetIds.has(id) ? 1 : 0), 0);
}
