// --- Imports ----------------------------------------------------------------

import fs from "node:fs/promises";
import path from "node:path";
import { createWriteStream } from "node:fs";
import { tmpdir } from "node:os";

import GIFEncoder from "gif-encoder-2";
import puppeteer from "puppeteer";
import { createCanvas, Image } from "canvas";

// --- Configuration ----------------------------------------------------------

const url = process.argv[2];
const output = process.argv[3];

const width = 700;
const height = 400;

// --- Helpers ----------------------------------------------------------------

function onError(error) {
  console.error(`${error.name}: ${error.message}`);
  process.exitCode = 1;
}

async function takeScreenshots(browser, destDir) {
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

// --- Orchestration ----------------------------------------------------------

async function main() {
  let pngDir;
  let browser;

  try {
    const pngDirPrefix = path.join(tmpdir(), "demo-gifs-");
    pngDir = await fs.mkdtemp(pngDirPrefix);

    browser = await puppeteer.launch();
    await takeScreenshots(browser, pngDir);
    const outputPath = path.join(".", output);
    await createGif(pngDir, outputPath);
    //
  } catch (error) {
    onError(error);
    //
  } finally {
    try {
      if (browser) await browser.close();
      await fs.rm(pngDir, { recursive: true, force: true });
      //
    } catch (error) {
      onError(error);
    }
  }
}

main();
