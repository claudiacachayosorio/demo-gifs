// --- Imports ----------------------------------------------------------------

import assert from "node:assert";
import fs from "node:fs/promises";
import path from "node:path";
import test, { describe, it } from "node:test";

import { fixture, hooks, isEmptyDir, isGIF, run } from "./helpers.js";

// --- Constants & Helpers ----------------------------------------------------

const defaultLog = `
    Will generate GIF demo for '${fixture.url}' and save it as '${fixture.gif}'
  `.trim();

async function assertLogs({
  flag = "--dry-run",
  dirPath,
  outputArg,
  logs = [],
}) {
  const outputPath = path.join(dirPath, fixture.gif);
  const output = outputArg ?? outputPath;
  const args = [flag, fixture.url, output];

  const expectedLogs = [
    `GIF path: ${outputPath}`,
    ...(logs.length > 0 ? logs : [defaultLog]),
  ];

  const { stdout } = await run(...args);
  expectedLogs.forEach((log) => {
    assert.ok(stdout.includes(`[DRY RUN] ${log}`));
  });
}

// --- Test Suite -------------------------------------------------------------

describe("Dry Run", () => {
  let tempDir;

  test.beforeEach(async () => {
    tempDir = await hooks.setupTemp();
  });

  test.afterEach(async () => {
    await hooks.cleanupTemp(tempDir);
  });

  it("should report the planned output without generating GIF", async () => {
    await assertLogs({ dirPath: tempDir });
    assert.ok(await isEmptyDir(tempDir));
  });

  it("should accept short dry run flag", async () => {
    await assertLogs({ dirPath: tempDir, flag: "-d" });
    assert.ok(await isEmptyDir(tempDir));
  });

  it("should resolve relative path and use it in output report", async () => {
    const relDirPath = path.relative(fixture.cwd, tempDir);

    await assertLogs({
      dirPath: tempDir,
      outputArg: path.join(relDirPath, fixture.gif),
    });

    assert.ok(await isEmptyDir(tempDir));
  });

  it("should report missing directories without creating them", async () => {
    const nestedDir = path.join(tempDir, "nested");

    await assertLogs({
      dirPath: nestedDir,
      logs: [defaultLog, `Will create missing directories for '${nestedDir}'`],
    });

    assert.ok(await isEmptyDir(tempDir));
  });

  it("should report overwriting existing file without modifying it", async () => {
    const mockFile = path.join(tempDir, fixture.gif);
    const mockContent = "mock content";

    await fs.writeFile(mockFile, mockContent);

    await assertLogs({
      dirPath: tempDir,
      logs: [
        `Will overwrite '${fixture.gif}' with GIF demo for '${fixture.url}'`,
      ],
    });

    const fileIsGIF = await isGIF(mockFile);
    assert.ok(!fileIsGIF);

    const content = await fs.readFile(mockFile, "utf-8");
    assert.strictEqual(content, mockContent);
  });
});
