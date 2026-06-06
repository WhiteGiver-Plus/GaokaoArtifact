import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("artifacts wiki", () => {
  it("builds a static searchable wiki page", async () => {
    const html = await readFile("artifacts_wiki/index.html", "utf8");
    expect(html).toContain("Artifacts Wiki");
    expect(html).toContain("big_pity");
    expect(html).toContain("Strict Triggers & Effects");
  });
});
