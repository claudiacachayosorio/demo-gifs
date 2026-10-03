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
    await page.screenshot({ path: output });
    //
  } finally {
    await browser.close();
  }
}

main();
