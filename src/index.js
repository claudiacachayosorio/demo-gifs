import fs from "node:fs/promises";
import fsSync from "node:fs";
import os from "node:os";
import path from "node:path";
import puppeteer from "puppeteer";
import GIFEncoder from "gif-encoder-2";
import { createCanvas, Image } from "canvas";

const url = process.argv[2];
const output = process.argv[3];

const width = 700;
const height = 400;

function loadImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.src = src;
  });
}

async function main() {
  const tmpPrefix = path.join(os.tmpdir(), "demo-gifs-");
  const tmpDir = await fs.mkdtemp(tmpPrefix);

  const browser = await puppeteer.launch();

  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.goto(url);

    let frameNum = 1;

    while (true) {
      const pngNum = frameNum.toString().padStart(3, "0");

      await page.screenshot({
        path: path.join(tmpDir, `${pngNum}.png`),
      });

      frameNum++;

      const prevScrollY = await page.evaluate(() => window.scrollY);
      await page.evaluate(() => window.scrollBy(0, 100));
      const currScrollY = await page.evaluate(() => window.scrollY);

      if (currScrollY === prevScrollY) break;
    }

    const files = await fs.readdir(tmpDir);
    const outputPath = path.join(".", output);

    const encoder = new GIFEncoder(width, height);
    const writeStream = fsSync.createWriteStream(outputPath);
    encoder.createReadStream().pipe(writeStream);

    encoder.start();
    encoder.setDelay(700);

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    for (const file of files.sort()) {
      const src = path.join(tmpDir, file);
      const image = await loadImage(src);
      ctx.drawImage(image, 0, 0);
      encoder.addFrame(ctx);
    }

    encoder.finish();

    //
  } finally {
    await browser.close();
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

main();
