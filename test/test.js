// --- Imports ----------------------------------------------------------------

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
//import fs from "node:fs/promises";
//import { tmpdir } from "node:os";
//import path from "node:path";
import { describe, it } from "node:test";
import { promisify } from "node:util";

// --- Helpers ----------------------------------------------------------------

const execFileAsync = promisify(execFile);

/*async function setupTemp() {
  const prefix = path.join(tmpdir(), "demo-gifs-test-");
  const temp = await fs.mkdtemp(prefix);
  return temp;
}

async function cleanupTemp(temp) {
  await fs.rm(temp, { recursive: true, force: true });
}*/

async function run(...args) {
  const result = await execFileAsync(
    process.execPath,
    ["../index.js", ...args],
    { cwd: import.meta.dirname }
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

// --- Tests ------------------------------------------------------------------

describe("interface", () => {
  it("should report an error when arguments are missing", async (t) => {
    const expected = expectUsageError("Missing arguments.");

    await t.test("no URL, no output", async () => {
      await assertError(expected, 2);
    });

    await t.test("URL, no output", async () => {
      await assertError(expected, 2, "https://example.com");
    });
  });
});

/*describe("getOutputPath", () => {
  it("should resolve path relative to current directory", async (t) => {
    const tempDir = await setupTemp(process.cwd());
    t.after(async () => await cleanupTemp(tempDir));

    const outputDir = path.basename(tempDir);
    const relPath = path.join(outputDir, "demo.gif");

    const expected = path.join(tempDir, "demo.gif");
    const actual = await getOutputPath(relPath);

    assert.strictEqual(actual, expected);
  });

  it("should create missing directories", async (t) => {
    const tempDir = await setupTemp(tmpdir());
    t.after(async () => await cleanupTemp(tempDir));

    const outputDir = path.join(tempDir, "nested");
    const expected = path.join(outputDir, "demo.gif");
    const actual = await getOutputPath(expected);

    assert.strictEqual(actual, expected);

    const stats = await fs.stat(outputDir);
    assert.ok(stats.isDirectory());
  });
});*/
