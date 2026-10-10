// --- Imports ----------------------------------------------------------------

import assert from "node:assert";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

// --- Constants --------------------------------------------------------------

export const fixture = {
  cwd: import.meta.dirname,
  gif: "demo.gif",
  url: "https://example.com",
};

// --- Hooks ------------------------------------------------------------------

export const hooks = {
  setupTemp: async () => {
    return fs.mkdtemp(path.join(tmpdir(), "demo-gifs-test-"));
  },

  cleanupTemp: async (temp) => {
    await fs.rm(temp, { recursive: true, force: true });
  },
};

// --- Helpers ----------------------------------------------------------------

const execFileAsync = promisify(execFile);

/**
 * Executes index.js without spawning a shell.
 * @param {...string} args - Arguments to pass to index.js.
 * @returns {Promise<{stdout: string, stderr: string}>} - Child process output.
 */
export async function run(...args) {
  return execFileAsync(process.execPath, ["../index.js", ...args], {
    cwd: fixture.cwd,
  });
}

export async function isEmptyDir(path) {
  const dir = await fs.opendir(path);
  try {
    const entry = await dir.read();
    return entry === null;
  } catch {
    return false;
  } finally {
    await dir.close();
  }
}

/**
 * Checks whether a file has a valid GIF signature.
 * @param {string} filePath - Path to the file to check.
 * @returns {Promise<boolean>} Whether the file has a GIF signature.
 */
export async function isGIF(filePath) {
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
export async function assertError(expectedStderr, expectedCode, ...args) {
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
export async function assertSuccess(outputPath, outputArg = outputPath) {
  await run(fixture.url, outputArg);
  assert.ok(await isGIF(outputPath));
}
