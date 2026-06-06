import { describe, expect, it } from "vitest";
import { WEB_ARTIFACTS } from "../web_game/src/artifacts.generated.js";

describe("web game artifact data", () => {
  it("uses the shared 62-artifact config", () => {
    expect(WEB_ARTIFACTS).toHaveLength(62);
    expect(new Set(WEB_ARTIFACTS.map((artifact) => artifact.id)).size).toBe(62);
  });
});
