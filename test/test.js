// --- Imports ----------------------------------------------------------------

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { describe, it } from "node:test";
import { promisify } from "node:util";

// --- Helpers ----------------------------------------------------------------

const execFileAsync = promisify(execFile);

async function run(...args) {
  const result = await execFileAsync(
    process.execPath,
    ["../index.js", ...args],
    { cwd: __dirname }
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
    assert.strictEqual(error.stderr, expectedStderr);
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
