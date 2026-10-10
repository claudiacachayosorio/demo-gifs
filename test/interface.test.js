// --- Imports ----------------------------------------------------------------

import assert from "node:assert";
import fs from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";

import packageJSON from "../package.json" with { type: "json" };

import { assertError, fixture, hooks, run } from "./helpers.js";

// --- Constants & Helpers ----------------------------------------------------

const usage = "Usage: npm start -- URL OUTPUT";

function expectUsageError(desc) {
  return [`Error: ${desc}`, usage].join("\n");
}

// --- Test Suite -------------------------------------------------------------

describe("Interface", () => {
  describe("information options", () => {
    it("should print help text whenever help flag or no arguments are passed", async (t) => {
      const testCases = [
        {
          args: [],
          desc: "no arguments are provided",
        },
        {
          args: ["--help"],
          desc: "long help flag",
        },
        {
          args: ["-h"],
          desc: "short help flag",
        },
        {
          args: [fixture.url, fixture.gif, "-h"],
          desc: "help flag with valid arguments",
        },
        {
          args: ["url", "-h"],
          desc: "help flag with invalid argument",
        },
        {
          args: ["-v", "-h"],
          desc: "help and version flags",
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
          desc: "long version flag",
        },
        {
          args: ["-v"],
          desc: "short version flag",
        },
        {
          args: [fixture.url, fixture.gif, "-v"],
          desc: "version flag with valid arguments",
        },
        {
          args: ["url", "-v"],
          desc: "version flag with invalid argument",
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
    it("should print an error and exit 2 when output is missing", async () => {
      const expected = expectUsageError("Output path is required.");
      await assertError(expected, 2, fixture.url);
    });

    it("should print an error and exit 2 when more than 2 arguments are passed", async () => {
      const expected = expectUsageError("Unexpected arguments 'extra arg'.");
      const args = [fixture.url, fixture.gif, "extra", "arg"];
      await assertError(expected, 2, ...args);
    });

    it("should print an error and exit 2 when URL is invalid", async () => {
      const expected = expectUsageError("URL 'url' is invalid.");
      const args = ["url", fixture.gif];
      await assertError(expected, 2, ...args);
    });

    it("should print an error and exit 2 when output is invalid", async () => {
      const expected = expectUsageError("Output 'demo' must end with '.gif'.");
      const args = [fixture.url, "demo"];
      await assertError(expected, 2, ...args);
    });

    it("should print an error and exit 2 when output exists and is a directory", async (t) => {
      const tempDir = await hooks.setupTemp();
      t.after(async () => await hooks.cleanupTemp(tempDir));

      const outputPath = path.join(tempDir, fixture.gif);
      const args = [fixture.url, outputPath];

      const expected = expectUsageError(
        `Output path '${outputPath}' is a directory.`
      );

      await fs.mkdir(outputPath);
      await assertError(expected, 2, ...args);
    });

    it("should print an error and exit 2 when output directory is a file", async (t) => {
      const tempDir = await hooks.setupTemp();
      t.after(async () => await hooks.cleanupTemp(tempDir));

      const outputDir = path.join(tempDir, "output");
      const outputPath = path.join(outputDir, fixture.gif);
      const args = [fixture.url, outputPath];

      const expected = expectUsageError(
        `Output directory '${outputDir}' is a file.`
      );

      await fs.writeFile(outputDir, "");
      await assertError(expected, 2, ...args);
    });
  });
});
