// --- Imports ----------------------------------------------------------------

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test, { describe, it } from "node:test";
import { promisify } from "node:util";

import packageJSON from "../package.json" with { type: "json" };

// --- Constants --------------------------------------------------------------

const testCWD = import.meta.dirname;

const mockGIF = "demo.gif";
const mockURL = "https://example.com";

const usage = "Usage: npm start -- URL OUTPUT";

// --- Hooks & Utilities ------------------------------------------------------

const execFileAsync = promisify(execFile);

async function setupTemp() {
  return fs.mkdtemp(path.join(tmpdir(), "demo-gifs-test-"));
}

async function cleanupTemp(temp) {
  await fs.rm(temp, { recursive: true, force: true });
}

function expectUsageError(desc) {
  return [`Error: ${desc}`, usage].join("\n");
}

// --- Main Helpers -----------------------------------------------------------

/**
 * Executes index.js without spawning a shell.
 * @param  {...string} args - Arguments to pass to index.js.
 * @returns {Promise<{stdout: string, stderr: string}>} - Child process output.
 */
async function run(...args) {
  const result = await execFileAsync(
    process.execPath,
    ["../index.js", ...args],
    { cwd: testCWD }
  );

  return result;
}

/**
 * Checks whether a file has a valid GIF signature.
 * @param {string} filePath - Path to the file to check.
 * @returns {Promise<boolean>} Whether the file has a GIF signature.
 */
async function isGIF(filePath) {
  const fileHandle = await fs.open(filePath);

  try {
    const buffer = Buffer.alloc(6);
    await fileHandle.read(buffer, 0, 6, 0);
    const header = buffer.toString("ascii");

    return header === "GIF87a" || header === "GIF89a";
  } catch {
    return false;
  } finally {
    await fileHandle.close();
  }
}

/**
 * Verifies error output and exit code for the specified arguments.
 * @param {string} expectedStderr - Expected stderr output.
 * @param {number} expectedCode - Expected exit code.
 * @param {...string} args - Arguments to pass to run().
 * @returns {Promise<void>}
 */
async function assertError(expectedStderr, expectedCode, ...args) {
  await assert.rejects(run(...args), (error) => {
    assert.strictEqual(error.code, expectedCode);
    assert.strictEqual(error.stderr.trim(), expectedStderr);
    return true;
  });
}

/**
 * Verifies that a GIF was created at the specified path.
 * @param {string} outputPath - Absolute path for generated GIF.
 * @param {string} [outputArg] - Output argument passed to run().
 * @returns {Promise<void>}
 */
async function assertSuccess(outputPath, outputArg = outputPath) {
  await run(mockURL, outputArg);
  assert.ok(await isGIF(outputPath));
}

// --- Integration Tests ------------------------------------------------------

describe("interface", () => {
  describe("metadata options", () => {
    it("should print help text whenever help flag is passed", async (t) => {
      const testCases = [
        {
          args: ["--help"],
          desc: "long flag: --help",
        },
        {
          args: ["-h"],
          desc: "short flag: -h",
        },
        {
          args: [mockURL, mockGIF, "-h"],
          desc: "multiple valid arguments",
        },
        {
          args: ["url", "-h"],
          desc: "valid and invalid arguments",
        },
        {
          args: ["-v", "-h"],
          desc: "version and help flags",
        },
      ];

      for (const { args, desc } of testCases) {
        await t.test(desc, async () => {
          const { stdout } = await run(...args);
          assert.ok(stdout.includes(usage));
          assert.ok(stdout.includes("Arguments:"));
          assert.ok(stdout.includes("Options:"));
        });
      }
    });

    it("should print version information when version flag is passed", async (t) => {
      const testCases = [
        {
          args: ["--version"],
          desc: "long flag: --version",
        },
        {
          args: ["-v"],
          desc: "short flag: -v",
        },
        {
          args: [mockURL, mockGIF, "-v"],
          desc: "multiple valid arguments",
        },
        {
          args: ["url", "-v"],
          desc: "valid and invalid arguments",
        },
      ];

      for (const { args, desc } of testCases) {
        await t.test(desc, async () => {
          const { stdout } = await run(...args);
          assert.strictEqual(stdout.trim(), packageJSON.version.trim());
        });
      }
    });
  });

  describe("usage errors", () => {
    it("should print usage and exit 2 when no arguments are passed", async () => {
      await assertError(usage, 2);
    });

    it("should print an error and exit 2 when output is missing", async () => {
      const expected = expectUsageError("Output path is required.");
      await assertError(expected, 2, mockURL);
    });

    it("should print an error and exit 2 when more than 2 arguments are passed", async () => {
      const expected = expectUsageError("Unexpected arguments 'extra arg'.");
      const args = [mockURL, mockGIF, "extra", "arg"];
      await assertError(expected, 2, ...args);
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

    it("should print an error and exit 2 when output exists and is a directory", async (t) => {
      const tempDir = await setupTemp();
      t.after(async () => await cleanupTemp(tempDir));

      const outputPath = path.join(tempDir, mockGIF);
      const args = [mockURL, outputPath];

      const expected = expectUsageError(
        `Output path '${outputPath}' is a directory.`
      );

      await fs.mkdir(outputPath);
      await assertError(expected, 2, ...args);
    });
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

  it("should successfully create GIF when given an absolute path", async () => {
    const outputPath = path.join(tempDir, mockGIF);
    await assertSuccess(outputPath);
  });

  it("should successfully create GIF when given a relative path", async () => {
    const outputPath = path.join(tempDir, mockGIF);
    const relPath = path.relative(testCWD, outputPath);
    await assertSuccess(outputPath, relPath);
  });

  it("should successfully create GIF when output directory doesn't exist", async () => {
    const outputPath = path.join(tempDir, "nested", mockGIF);
    await assertSuccess(outputPath);
  });

  it("should successfully overwrite GIF when file already exists", async () => {
    const outputPath = path.join(tempDir, mockGIF);
    const mockContent = "mock content";

    await fs.writeFile(outputPath, mockContent);
    await assertSuccess(outputPath);

    const currContent = await fs.readFile(outputPath, "utf-8");
    assert.notStrictEqual(currContent, mockContent);
  });
});
