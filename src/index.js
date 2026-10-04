import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import puppeteer from "puppeteer";

const url = process.argv[2];
//const output = process.argv[3];

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

    //
  } finally {
    await browser.close();
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

main();
