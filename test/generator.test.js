// --- Imports ----------------------------------------------------------------

import assert from "node:assert";
import fs from "node:fs/promises";
import path from "node:path";
import test, { describe, it } from "node:test";

import { assertSuccess, fixture, hooks } from "./helpers.js";

// --- Test Suite -------------------------------------------------------------

describe("Generator", () => {
  let tempDir;

  test.beforeEach(async () => {
    tempDir = await hooks.setupTemp();
  });

  test.afterEach(async () => {
    await hooks.cleanupTemp(tempDir);
  });

  it("should successfully create GIF when given an absolute path", async () => {
    const outputPath = path.join(tempDir, fixture.gif);
    await assertSuccess(outputPath);
  });

  it("should successfully create GIF when given a relative path", async () => {
    const outputPath = path.join(tempDir, fixture.gif);
    const relPath = path.relative(fixture.cwd, outputPath);
    await assertSuccess(outputPath, relPath);
  });

  it("should successfully create GIF when output directory doesn't exist", async () => {
    const outputPath = path.join(tempDir, "nested", fixture.gif);
    await assertSuccess(outputPath);
  });

  it("should successfully overwrite GIF when file already exists", async () => {
    const outputPath = path.join(tempDir, fixture.gif);
    const mockContent = "mock content";

    await fs.writeFile(outputPath, mockContent);
    await assertSuccess(outputPath);

    const currContent = await fs.readFile(outputPath, "utf-8");
    assert.notStrictEqual(currContent, mockContent);
  });
});
