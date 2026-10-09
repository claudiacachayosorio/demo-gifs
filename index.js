// --- Imports ----------------------------------------------------------------

import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { createCanvas, loadImage } from "canvas";
import GIFEncoder from "gif-encoder-2";
import puppeteer from "puppeteer";

// --- Configuration ----------------------------------------------------------

const cmd = "npm start --";
const usage = `${cmd} URL OUTPUT`;

const args = process.argv.slice(2);
const [url, output, ...unexpected] = args;

const width = 700;
const height = 400;

// --- Utilities --------------------------------------------------------------

function onError(error) {
  console.error(`${error.name}: ${error.message}`);
  process.exitCode = 1;
}

function usageError(desc) {
  if (desc) {
    console.error(`Error: ${desc}`);
  }

  console.error(`Usage: ${usage}`);
  process.exit(2);
}

function isValidURL(urlArg) {
  try {
    const url = new URL(urlArg);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function isDirectory(path) {
  try {
    const stats = await fs.stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

async function makeTempDir() {
  return fs.mkdtemp(path.join(tmpdir(), "demo-gifs-"));
}

function getBrowserOptions() {
  return {
    args: process.env.CI ? ["--no-sandbox"] : [],
  };
}

// --- Interface --------------------------------------------------------------

function validateArgs() {
  if (args.length === 0) {
    usageError();
  }

  if (!output) {
    usageError("Output path is required.");
  }

  if (unexpected.length > 0) {
    usageError(`Unexpected arguments '${unexpected.join(" ")}'.`);
  }

  if (!isValidURL(url)) {
    usageError(`URL '${url}' is invalid.`);
  }

  if (!output.endsWith(".gif")) {
    usageError(`Output '${output}' must end with '.gif'.`);
  }

  if (!isDirectory(path)) {
    usageError(`Output path '${output}' is a directory.`);
  }
}

// --- Generator --------------------------------------------------------------

/**
 * Resolves output argument to an absolute path.
 * @param {string} output - Command line argument for GIF's output path.
 * @returns {Promise<string>} Absolute output path for GIF.
 */
async function resolveOutput(output) {
  const outputPath = path.resolve(process.cwd(), output);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  return outputPath;
}

/**
 * Takes screenshots of webpage being scrolled top to bottom.
 * @param {string} url - URL of webpage for screencasting.
 * @param {string} destDir - Directory for screenshots.
 * @param {import("puppeteer").LaunchOptions} browserOptions
 */
async function takeScreenshots(url, destDir, browserOptions) {
  const browser = await puppeteer.launch(browserOptions);

  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.goto(url);

    let frameNum = 1;

    while (true) {
      const frameName = frameNum.toString().padStart(3, "0");

      await page.screenshot({
        path: path.join(destDir, `${frameName}.png`),
      });

      const prevScrollY = await page.evaluate(() => window.scrollY);
      await page.evaluate(() => window.scrollBy(0, 100));
      const currScrollY = await page.evaluate(() => window.scrollY);

      frameNum++;

      // Stop when scrolling doesn't change page position
      if (currScrollY === prevScrollY) break;
    }
  } finally {
    await browser.close();
  }
}

/**
 * Converts screenshots into GIF.
 * @param {string} srcDir - Directory containing screenshots.
 * @param {string} outputPath - Path for generated GIF.
 * @returns {Promise<void>}
 */
async function createGIF(srcDir, outputPath) {
  const files = (await fs.readdir(srcDir)).sort();

  const encoder = new GIFEncoder(width, height);
  const writeStream = createWriteStream(outputPath);
  encoder.createReadStream().pipe(writeStream);

  encoder.start();
  encoder.setDelay(700);

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  for (const file of files) {
    const src = path.join(srcDir, file);
    const image = await loadImage(src);

    ctx.drawImage(image, 0, 0);
    encoder.addFrame(ctx);
  }

  encoder.finish();
}

/**
 * Generates animated GIF of supplied URL scroll and saves to output path.
 * @param {string} url - Validated URL for screenshots.
 * @param {string} outputPath - Resolved path for generated GIF.
 * @returns {Promise<void>}
 */
async function generateDemoGIF(url, outputPath) {
  const pngDir = await makeTempDir();
  const browserOptions = getBrowserOptions();

  try {
    await takeScreenshots(url, pngDir, browserOptions);
    await createGIF(pngDir, outputPath);
  } finally {
    await fs.rm(pngDir, { recursive: true, force: true });
  }
}

// --- Execution --------------------------------------------------------------

async function main() {
  validateArgs();

  try {
    const outputPath = await resolveOutput(output);
    await generateDemoGIF(url, outputPath);
  } catch (error) {
    onError(error);
  }
}

if (import.meta.filename === process.argv[1]) {
  main();
}
