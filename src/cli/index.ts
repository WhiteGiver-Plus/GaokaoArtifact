import { createInterface } from "node:readline/promises";
import type { Interface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import {
  ELECTIVE_SUBJECTS,
  SUBJECT_LABELS,
  loadArtifacts,
  runGame,
  type ArtifactConfig,
  type ChoiceHooks,
  type SubjectId
} from "../core/index.js";

interface CliArgs {
  command: "play" | "simulate";
  seed?: string;
  autoPolicy: "first" | "random" | "rare";
  subjects?: SubjectId[];
}

const args = parseArgs(process.argv.slice(2));
const artifacts = await loadArtifacts();
const rl = args.command === "play" ? createInterface({ input, output }) : undefined;

try {
  const subjects = args.subjects ?? (rl ? await promptSubjects(rl) : undefined);
  const hooks = rl ? createInteractiveHooks(rl) : createStreamingHooks();
  const result = await runGame(
    artifacts,
    { seed: args.seed, autoPolicy: args.autoPolicy, subjects },
    hooks
  );
  printResult(result);
} finally {
  rl?.close();
}

function parseArgs(argv: string[]): CliArgs {
  const command = argv[0] === "play" ? "play" : "simulate";
  const args: CliArgs = { command, autoPolicy: "first" };
  const positional: string[] = [];
  for (let i = 1; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === "--seed") {
      args.seed = argv[++i];
    } else if (value.startsWith("--seed=")) {
      args.seed = value.slice("--seed=".length);
    } else if (value === "--auto") {
      args.autoPolicy = parseAutoPolicy(argv[++i]);
    } else if (value.startsWith("--auto=")) {
      args.autoPolicy = parseAutoPolicy(value.slice("--auto=".length));
    } else if (value === "--subjects") {
      args.subjects = parseSubjects(argv[++i]);
    } else if (value.startsWith("--subjects=")) {
      args.subjects = parseSubjects(value.slice("--subjects=".length));
    } else {
      positional.push(value);
    }
  }
  args.seed ??= positional[0];
  args.autoPolicy = parseAutoPolicy(positional[1] ?? args.autoPolicy);
  return args;
}

function parseAutoPolicy(value: string | undefined): CliArgs["autoPolicy"] {
  if (value === "random" || value === "rare") {
    return value;
  }
  return "first";
}

function parseSubjects(value: string | undefined): SubjectId[] | undefined {
  if (!value) {
    return undefined;
  }
  const subjects = value.split(",").map((item) => item.trim()) as SubjectId[];
  return subjects.length === 3 ? subjects : undefined;
}

function createInteractiveHooks(rl: Interface): ChoiceHooks {
  return {
    chooseArtifact: async (choices, reason) => {
      output.write(`\n${reason}\n`);
      printChoices(choices);
      return promptIndex(rl, "选择遗物编号: ", choices.length);
    },
    chooseDiscard: async (owned) => {
      output.write("\n遗物超出上限，需要丢弃一件。\n");
      printChoices(owned);
      return promptIndex(rl, "丢弃遗物编号: ", owned.length);
    },
    chooseOnesDigit: async (score, subject) => {
      const answer = await rl.question(
        `\n${SUBJECT_LABELS[subject]} 当前分数 ${score}，C语言大佬触发：个位改成 0-9 哪个数字？直接回车默认 9: `
      );
      const digit = Number.parseInt(answer, 10);
      return Number.isInteger(digit) ? digit : 9;
    },
    chooseDigitSwap: async (score, subject) => {
      const digits = Math.abs(Math.round(score)).toString();
      const answer = await rl.question(
        `\n${SUBJECT_LABELS[subject]} 当前分数 ${score}，数学爱好者触发：数字 ${digits}，输入要交换的两位位置如 1,3；直接回车自动最优: `
      );
      return parseSwap(answer, digits.length);
    },
    onLog: (line) => output.write(`\n${line}\n`)
  };
}

function createStreamingHooks(): ChoiceHooks {
  return {
    onLog: (line) => output.write(`${line}\n`)
  };
}

function printChoices(choices: ArtifactConfig[]): void {
  choices.forEach((choice, index) => {
    output.write(`${index + 1}. [${choice.rarity}] ${choice.name} - ${choice.description}\n`);
  });
}

async function promptIndex(
  rl: Interface,
  prompt: string,
  length: number
): Promise<number> {
  const answer = await rl.question(prompt);
  const parsed = Number.parseInt(answer, 10);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Math.min(length - 1, Math.max(0, parsed - 1));
}

function parseSwap(answer: string, length: number): [number, number] | undefined {
  const parts = answer
    .split(/[,\s]+/)
    .map((item) => Number.parseInt(item, 10))
    .filter((item) => Number.isInteger(item));
  if (parts.length < 2) {
    return undefined;
  }
  const left = parts[0] - 1;
  const right = parts[1] - 1;
  if (left < 0 || right < 0 || left >= length || right >= length || left === right) {
    return undefined;
  }
  return [left, right];
}

async function promptSubjects(rl: Interface): Promise<SubjectId[] | undefined> {
  output.write("\n选考科目可选: ");
  output.write(ELECTIVE_SUBJECTS.map((subject) => `${subject}=${SUBJECT_LABELS[subject]}`).join(", "));
  output.write("\n");
  const answer = await rl.question("输入 3 个英文 id，用逗号分隔；直接回车默认物化生: ");
  return parseSubjects(answer);
}

function printResult(result: Awaited<ReturnType<typeof runGame>>): void {
  output.write(`\nSeed: ${result.seed}\n`);
  output.write(`科目: ${result.subjects.map((subject) => SUBJECT_LABELS[subject]).join(" / ")}\n`);
  output.write(`最终遗物: ${result.artifactNames.join("、") || "无"}\n\n`);
  for (const exam of result.exams) {
    output.write(
      `${SUBJECT_LABELS[exam.subject]}: ${exam.score} 分，` +
        `正确 ${exam.correctCount}，错误 ${exam.wrongCount}\n`
    );
  }
  output.write(`\n总分: ${result.totalScore}\n`);
}
