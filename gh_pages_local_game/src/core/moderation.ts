import { DOWNLOADED_NICKNAME_SENSITIVE_WORDS } from "./nicknameSensitiveWords.generated.js";

export const DEFAULT_NICKNAME = "考生";
export const DEBUG_NICKNAME = "Debug模式";
export const MAX_NICKNAME_LENGTH = 40;

export type NicknameReviewCode =
  | "nickname_clean"
  | "nickname_empty"
  | "nickname_too_long"
  | "nickname_sensitive"
  | "invalid_nickname";

export interface NicknameReview {
  ok: boolean;
  code: NicknameReviewCode;
  message: string;
  error?: Exclude<NicknameReviewCode, "nickname_clean" | "nickname_empty">;
}

const MODERATION_CHAR_MAP: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "@": "a",
  "$": "s",
  "!": "i",
  "|": "i",
  "屮": "艹"
};

const DOWNLOADED_IGNORE_TERMS = new Set(
  [
    "bt",
    "js",
    "ly",
    "qq",
    "sm",
    "代理",
    "代购",
    "到货",
    "本店",
    "崩盘",
    "救市",
    "客服",
    "招聘",
    "兼职",
    "全职",
    "网络",
    "网购",
    "淘宝",
    "微店",
    "技师",
    "咪咪",
    "大波",
    "孔丹",
    "阿波罗网"
  ].map(normalizeModerationText)
);

const LOCAL_NICKNAME_SENSITIVE_TERMS = [
  "傻逼",
  "傻屄",
  "煞笔",
  "傻比",
  "沙比",
  "傻b",
  "草你妈",
  "操你妈",
  "艹你妈",
  "日你妈",
  "你妈死了",
  "妈死了",
  "nmsl",
  "cnm",
  "fuck",
  "fck",
  "bitch",
  "色情",
  "成人视频",
  "成人直播",
  "成人片",
  "支那",
  "黑鬼",
  "尼哥",
  "nigger",
  "nigga",
  "nazi",
  "hitler",
  "杀人",
  "砍人",
  "炸学校",
  "炸弹",
  "恐怖袭击",
  "代考",
  "作弊",
  "买分",
  "改分",
  "保过",
  "办证",
  "发票",
  "赌博",
  "博彩",
  "赌场",
  "下注",
  "网赌",
  "加微信",
  "微信号",
  "v信",
  "qq群",
  "qq号",
  "电报群",
  "telegram",
  "tg群"
];

const LOCAL_POLITICAL_ALIAS_TERMS = [
  "近平",
  "习总",
  "习大大",
  "习帝",
  "习皇",
  "习包子",
  "庆丰",
  "庆丰帝",
  "总加速师",
  "加速师",
  "维尼",
  "小熊维尼",
  "泽民",
  "江总",
  "江core",
  "江蛤",
  "蛤蟆",
  "膜蛤",
  "长者",
  "涛哥",
  "胡总",
  "家宝",
  "温总",
  "温影帝",
  "克强",
  "泽东",
  "毛选",
  "太祖",
  "六四",
  "8964",
  "八九六四",
  "64事件",
  "天安门事件",
  "轮功",
  "法轮",
  "flg"
];

const SENSITIVE_SUBSTRINGS = Array.from(
  new Set(
    [...DOWNLOADED_NICKNAME_SENSITIVE_WORDS, ...LOCAL_NICKNAME_SENSITIVE_TERMS, ...LOCAL_POLITICAL_ALIAS_TERMS]
      .map(normalizeModerationText)
      .filter(shouldUseSensitiveTerm)
  )
);

const SENSITIVE_EXACT = new Set(
  ["sb", "cnm", "nmsl", "jb", "md", "fuck", "fck", "shit", "bitch"]
    .map(normalizeModerationText)
);

export function reviewNickname(value: unknown): NicknameReview {
  if (value !== undefined && value !== null && typeof value !== "string") {
    return {
      ok: false,
      code: "invalid_nickname",
      error: "invalid_nickname",
      message: "姓名格式不正确，请重新输入。"
    };
  }

  const raw = typeof value === "string" ? value : "";
  const nickname = normalizeNicknameSpacing(raw);
  if (!nickname) {
    return {
      ok: true,
      code: "nickname_empty",
      message: ""
    };
  }

  if (Array.from(nickname).length > MAX_NICKNAME_LENGTH) {
    return {
      ok: false,
      code: "nickname_too_long",
      error: "nickname_too_long",
      message: `姓名最多 ${MAX_NICKNAME_LENGTH} 个字符。`
    };
  }

  const compact = normalizeModerationText(nickname);
  if (SENSITIVE_EXACT.has(compact) || SENSITIVE_SUBSTRINGS.some((term) => compact.includes(term))) {
    return {
      ok: false,
      code: "nickname_sensitive",
      error: "nickname_sensitive",
      message: "包含敏感词"
    };
  }

  return {
    ok: true,
    code: "nickname_clean",
    message: ""
  };
}

export function sanitizeNickname(value: unknown, fallback = DEFAULT_NICKNAME): string {
  const raw = typeof value === "string" ? value : "";
  const normalized = normalizeNicknameSpacing(raw);
  if (!normalized) return fallback;
  return Array.from(normalized).slice(0, MAX_NICKNAME_LENGTH).join("");
}

export function nicknameErrorMessage(error: string | undefined): string | undefined {
  switch (error) {
    case "nickname_sensitive":
      return "包含敏感词，请修改后再提交。";
    case "nickname_too_long":
      return `姓名最多 ${MAX_NICKNAME_LENGTH} 个字符，请修改后再提交。`;
    case "invalid_nickname":
      return "姓名格式不正确，请修改后再提交。";
    default:
      return undefined;
  }
}

export function publicNickname(value: unknown): string {
  const review = reviewNickname(value);
  return review.ok ? sanitizeNickname(value) : DEFAULT_NICKNAME;
}

function normalizeNicknameSpacing(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function shouldUseSensitiveTerm(term: string): boolean {
  if (!term || DOWNLOADED_IGNORE_TERMS.has(term)) return false;
  if (/^[a-z0-9]{1,2}$/.test(term)) return false;
  return Array.from(term).length > 1;
}

function normalizeModerationText(value: string): string {
  return Array.from(value.normalize("NFKC").toLowerCase())
    .map((char) => MODERATION_CHAR_MAP[char] ?? char)
    .join("")
    .replace(/[\s\p{P}\p{S}_]+/gu, "");
}
