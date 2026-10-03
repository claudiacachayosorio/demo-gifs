import puppeteer from "puppeteer";

const url = process.argv[2];
const output = process.argv[3];

const viewport = {
  width: 700,
  height: 400,
};

async function main() {
  let browser;

  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    await page.setViewport(viewport);
    await page.screenshot({ path: output });
    //
  } finally {
    await browser.close();
  }
}

main();
