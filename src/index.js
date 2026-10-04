import fs from "node:fs/promises";
import fsSync from "node:fs";
import os from "node:os";
import path from "node:path";
import puppeteer from "puppeteer";
import GIFEncoder from "gif-encoder-2";

const url = process.argv[2];
const output = process.argv[3];

const viewport = {
  width: 700,
  height: 400,
};

async function main() {
  const tmpPrefix = path.join(os.tmpdir(), "demo-gifs-");
  const tmpDir = await fs.mkdtemp(tmpPrefix);

  const browser = await puppeteer.launch();

  try {
    const page = await browser.newPage();
    await page.setViewport(viewport);
    await page.goto(url);

    let pngNum = 1;

    while (true) {
      await page.screenshot({
        path: path.join(tmpDir, `${pngNum}.png`),
      });

      pngNum++;

      const prevScrollY = await page.evaluate(() => window.scrollY);
      await page.evaluate(() => window.scrollBy(0, 100));
      const currScrollY = await page.evaluate(() => window.scrollY);

      if (currScrollY === prevScrollY) break;
    }

    const frames = await fs.readdir(tmpDir);
    const outputPath = path.join(".", output);

    const encoder = new GIFEncoder({ width: 350, height: 200 });
    const writeStream = fsSync.createWriteStream(outputPath);
    encoder.createReadStream().pipe(writeStream);

    encoder.start();
    encoder.setDelay(100);

    frames.sort().forEach((frame) => {
      encoder.addFrame(path.join(tmpDir, frame));
    });

    encoder.finish();

    //
  } finally {
    await browser.close();
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

main();
