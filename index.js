// --- Imports ----------------------------------------------------------------

import fs from "node:fs/promises";
import path from "node:path";
import { createWriteStream } from "node:fs";
import { tmpdir } from "node:os";

import GIFEncoder from "gif-encoder-2";
import puppeteer from "puppeteer";
import { createCanvas, Image } from "canvas";

// --- Configuration ----------------------------------------------------------

const cmd = "npm start --";
const usage = `${cmd} URL OUTPUT`;

const url = process.argv[2];
const output = process.argv[3];

const width = 700;
const height = 400;

// --- Helpers ----------------------------------------------------------------

function onError(error) {
  console.error(`${error.name}: ${error.message}`);
  process.exitCode = 1;
}

function usageError(message) {
  console.error(`Error: ${message}`);
  console.error(`Usage: ${usage}`);
  process.exit(2);
}

function isValidURL(input) {
  if (!URL.parse(input)) return false;
  const url = new URL(input);
  return url.protocol === "http:" || url.protocol === "https:";
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

async function takeScreenshots(url, destDir) {
  const browser = await puppeteer.launch();

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

  try {
    await takeScreenshots(url, pngDir);
    await createGif(pngDir, outputPath);
  } finally {
    await fs.rm(pngDir, { recursive: true, force: true });
  }
}

async function main() {
  if (!url || !output) {
    usageError("Missing arguments.");
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

// --- Exports ----------------------------------------------------------------

export { getOutputPath };
