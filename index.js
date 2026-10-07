// --- Imports ----------------------------------------------------------------

import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { createCanvas, Image } from "canvas";
import GIFEncoder from "gif-encoder-2";
import puppeteer from "puppeteer";

// --- Configuration ----------------------------------------------------------

const cmd = "npm start --";
const usage = `${cmd} URL OUTPUT`;

const options = process.argv.slice(2);
const [url, output, ...unexpected] = options;

const width = 700;
const height = 400;

// --- Helpers ----------------------------------------------------------------

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

function isValidURL(input) {
  try {
    const url = new URL(input);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function getOutputPath(output) {
  const outputPath = path.resolve(process.cwd(), output);
  const outputDir = path.dirname(outputPath);

  await fs.mkdir(outputDir, { recursive: true });
  return outputPath;
}

async function makeTempDir() {
  const prefix = path.join(tmpdir(), "demo-gifs-");
  const dir = await fs.mkdtemp(prefix);
  return dir;
}

async function takeScreenshots(url, destDir, browserOptions) {
  const browser = await puppeteer.launch(browserOptions);

  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.goto(url);

    let frameNum = 1;

    while (true) {
      const pngNum = frameNum.toString().padStart(3, "0");

      await page.screenshot({
        path: path.join(destDir, `${pngNum}.png`),
      });

      const prevScrollY = await page.evaluate(() => window.scrollY);
      await page.evaluate(() => window.scrollBy(0, 100));
      const currScrollY = await page.evaluate(() => window.scrollY);

      if (currScrollY === prevScrollY) break;
      frameNum++;
    }
  } finally {
    await browser.close();
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = reject;

    image.src = src;
  });
}

async function createGif(srcDir, outputPath) {
  const files = await fs.readdir(srcDir);

  const encoder = new GIFEncoder(width, height);
  const writeStream = createWriteStream(outputPath);
  encoder.createReadStream().pipe(writeStream);

  encoder.start();
  encoder.setDelay(700);

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  for (const file of files.sort()) {
    const src = path.join(srcDir, file);
    const image = await loadImage(src);

    ctx.drawImage(image, 0, 0);
    encoder.addFrame(ctx);
  }

  encoder.finish();
}

// --- Execution --------------------------------------------------------------

async function generateGif(url, outputPath) {
  const pngDir = await makeTempDir();
  const browserOptions = {
    args: process.env.CI ? ["--no-sandbox"] : [],
  };

  try {
    await takeScreenshots(url, pngDir, browserOptions);
    await createGif(pngDir, outputPath);
  } finally {
    await fs.rm(pngDir, { recursive: true, force: true });
  }
}

async function main() {
  if (options.length === 0) {
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

  try {
    const outputPath = await getOutputPath(output);
    await generateGif(url, outputPath);
  } catch (error) {
    onError(error);
  }
}

if (import.meta.filename === process.argv[1]) {
  main();
}
