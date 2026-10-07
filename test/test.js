// --- Imports ----------------------------------------------------------------

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test, { describe, it } from "node:test";
import { promisify } from "node:util";

// --- Constants --------------------------------------------------------------

const testCWD = import.meta.dirname;
const mockGIF = "demo.gif";
const mockURL = "https://example.com";

// --- Helpers ----------------------------------------------------------------

const execFileAsync = promisify(execFile);

async function setupTemp() {
  const prefix = path.join(tmpdir(), "demo-gifs-test-");
  const temp = await fs.mkdtemp(prefix);
  return temp;
}

async function cleanupTemp(temp) {
  await fs.rm(temp, { recursive: true, force: true });
}

async function run(...args) {
  const result = await execFileAsync(
    process.execPath,
    ["../index.js", ...args],
    { cwd: testCWD }
  );

  return result;
}

function expectUsageError(desc) {
  const usage = "Usage: npm start -- URL OUTPUT";
  return [`Error: ${desc}`, usage].join("\n");
}

async function assertError(expectedStderr, expectedCode, ...args) {
  await assert.rejects(run(...args), (error) => {
    assert.strictEqual(error.code, expectedCode);
    assert.strictEqual(error.stderr.trim(), expectedStderr);
    return true;
  });
}

async function assertSuccess(outputPath, outputArg = outputPath) {
  await run(mockURL, outputArg);
  const stats = await fs.stat(outputPath);
  assert.ok(stats.isFile());
}

// --- Integration Tests ------------------------------------------------------

describe("interface", () => {
  it("should print an error and exit 2 when arguments are missing", async (t) => {
    const expected = expectUsageError("Missing arguments.");
    const args = [];

    await t.test("no URL, no output", async () => {
      await assertError(expected, 2, ...args);
    });

    await t.test("URL, no output", async () => {
      args.push(mockURL);
      await assertError(expected, 2, ...args);
    });
  });

  it("should print an error and exit 2 when URL is invalid", async () => {
    const expected = expectUsageError("URL 'url' is invalid.");
    const args = ["url", mockGIF];
    await assertError(expected, 2, ...args);
  });

  it("should print an error and exit 2 when output is invalid", async () => {
    const expected = expectUsageError("Output 'demo' must end with '.gif'.");
    const args = [mockURL, "demo"];
    await assertError(expected, 2, ...args);
  });
});

describe("generator", () => {
  let tempDir;

  test.beforeEach(async () => {
    tempDir = await setupTemp();
  });

  test.afterEach(async () => {
    await cleanupTemp(tempDir);
  });

  it("should successfully save GIF to output when given absolute path", async () => {
    const outputPath = path.join(tempDir, mockGIF);
    await assertSuccess(outputPath);
  });

  it("should successfully save GIF to output when given relative path", async () => {
    const outputPath = path.join(tempDir, mockGIF);
    const relPath = path.relative(testCWD, outputPath);
    await assertSuccess(outputPath, relPath);
  });

  it("should create missing directories and successfully save GIF when output directory doesn't exist", async () => {
    const outputPath = path.join(tempDir, "nested", mockGIF);
    await assertSuccess(outputPath);
  });
});
