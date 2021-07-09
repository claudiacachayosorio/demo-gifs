const puppeteer		= require('puppeteer');
const GIFencoder	= require('gif-encoder');
const getPixels		= require('get-pixels');
const fs			= require('fs');

// Input data
let fn	= process.argv[2];
let url	= process.argv[3];

// vertical length of each scroll in pixels
const scrollDepth = 100;
// dimensions of screenshots
const viewport = {
	width: 800,
	height: 600
};

// Directories
const outDir = './demos/';
const outPath = `${outDir}${fn}.gif`;
// temporary directory for PNGs
const workDir = './temp/';

// Create directories if inexistent
if (!fs.existsSync(workDir)) fs.mkdirSync(workDir);
if (!fs.existsSync(outDir))	 fs.mkdirSync(outDir);

const file = fs.createWriteStream(outPath);
const encoder = new GIFencoder(viewport.width, viewport.height);

encoder.setFrameRate(5);
encoder.pipe(file);
encoder.setQuality(40);
encoder.setDelay(700);
encoder.writeHeader();
encoder.setRepeat(0);

function addToGif(images, counter = 0) {
	getPixels(images[counter], (err, pixels) => {
		encoder.addFrame(pixels.data);
		encoder.read();

		if (counter === images.length - 1) {
			encoder.finish();
			cleanUp(images, err => {
				if (err) console.log(err);
				else {
					fs.rmdirSync(workDir);
					process.exit(0);
				}
			});
			console.log(`${fn}.gif created`);
		}
		else addToGif(images, ++counter);
	});
};

function cleanUp(listOfPNGs, cb) {
	let i = listOfPNGs.length;

	listOfPNGs.forEach(filepath => {
		fs.unlink(filepath, err => {
			--i;

			if (err)		 cb(err);
			else if (i <= 0) cb(null);
		});
	});
};

(async () => {

	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();

	async function scrollPage() {
		await page.evaluate(async (scrollDepth) => {
			window.scrollBy(0, scrollDepth);
		}, scrollDepth);
	};

	await page.setViewport(viewport);
	await page.goto(url);

	const bodyHeight = await page.evaluate(() => document.body.clientHeight);
	const numberOfPNGs = Math.floor(bodyHeight / scrollDepth);

	for (let i = 0; i <= numberOfPNGs; i++) {
		await page.screenshot({
			path: workDir + i + '.png'
		});
		await scrollPage();
	};

	await browser.close();

	let listOfPNGs = fs.readdirSync(workDir)
		.map(a => a.substr(0, a.length - 4) + '')
		.sort((a, b) => a - b)
		.map(a => workDir + a.substr(0, a.length) + '.png');
	
	addToGif(listOfPNGs);

})();