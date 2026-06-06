import type { CompareOp } from "./types.js";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function compare(value: number, op: CompareOp, target: number): boolean {
  switch (op) {
    case "eq":
      return value === target;
    case "neq":
      return value !== target;
    case "lt":
      return value < target;
    case "lte":
      return value <= target;
    case "gt":
      return value > target;
    case "gte":
      return value >= target;
  }
}

export function scoreForPattern(score: number): number {
  return Math.round(score);
}

export function hasRepeatedDigit(score: number, count: number): boolean {
  const digits = Math.abs(scoreForPattern(score)).toString().split("");
  return digits.some((digit) => digits.filter((item) => item === digit).length >= count);
}

export function hasStraightDigits(score: number): boolean {
  const digits = Math.abs(scoreForPattern(score)).toString();
  return "0123456789".includes(digits) || "9876543210".includes(digits);
}

export function isSquare(score: number): boolean {
  const value = scoreForPattern(score);
  if (value < 0) {
    return false;
  }
  const root = Math.floor(Math.sqrt(value));
  return root * root === value;
}

export function isCube(score: number): boolean {
  const value = scoreForPattern(score);
  const root = Math.round(Math.cbrt(value));
  return root * root * root === value;
}

export function isPalindromeScore(score: number): boolean {
  const text = Math.abs(scoreForPattern(score)).toString();
  return text.length > 1 && text === text.split("").reverse().join("");
}
