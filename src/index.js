import puppeteer from "puppeteer";

const url = process.argv[2];
const output = process.argv[3];

const viewport = {
  width: 700,
  height: 400,
};

async function main() {
  const browser = await puppeteer.launch();

  try {
    const page = await browser.newPage();
    await page.setViewport(viewport);
    await page.goto(url);

    let isAtBottom = false;
    let pngNum = 1;

    while (!isAtBottom) {
      await page.screenshot({ path: `${output}/${pngNum}.png` });
      pngNum++;

      isAtBottom = await page.evaluate(() => {
        return (
          window.innerHeight + window.scrollY >= document.body.scrollHeight
        );
      });

      await page.evaluate(() => window.scrollBy(0, 100));
    }

    //
  } finally {
    await browser.close();
  }
}

main();
