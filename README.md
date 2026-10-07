# demo-gifs
Generate an animated GIF of a webpage being scrolled from top to bottom. Useful for quick web project demos.

## :camera: Example
![Animated GIF of the Wikipedia page for Chinchillidae being scrolled through from top to bottom.](.github/assets/demo.gif)

## :package: Installation
**Requirements:** Node.js 22.12.0 or later
```shell
git clone https://github.com/claudiacachayosorio/demo-gifs.git
cd demo-gifs
npm install
```

## :keyboard: Usage
```shell
npm start -- URL OUTPUT
```
* `URL` — webpage to capture
* `OUTPUT` — path for generated GIF

### Example
```shell
npm start -- https://example.com demo.gif
```

## :hammer_and_wrench: Development
Run the test suite:
```shell
npm test
```
Run all checks:
```shell
npm check
```

## :bulb: Inspiration
* [Build a screenshot pipeline](https://www.codementor.io/projects/web/build-a-screenshot-pipeline-c22ccscro8) by Raphael Sztwiorok
* [Using Puppeteer to make animated GIFs of page scrolls](https://dev.to/aimerib/using-puppeteer-to-make-animated-gifs-of-page-scrolls-1lko) by Aimeri Baddouh
