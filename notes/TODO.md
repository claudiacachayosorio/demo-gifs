# TODO

## Version 0.3
### 🎯 Overview
Generate sequential screenshots of webpage being scrolled top to bottom.
```shell
npm start -- https://example.com temp/example
# output: temp/example_01.png, temp/example_02.png, ...
```
### 🔀 Workflow
1. Get URL and filename
2. Launch headless browser
3. Open page
4. Set viewport
5. Navigate to supplied URL
6. Take screenshot
7. Save PNG file to supplied path
8. Scroll down by fixed amount
9. Repeat until bottom is reached
10. Close browser

---

## Version 0.2
### 🎯 Overview
Generate 1 screenshot.
```shell
npm start -- https://example.com example.png
# output: example.png
```
### 🔀 Workflow
1. Get URL
2. Launch browser
3. Open page
4. Set viewport
5. Navigate
6. Take screenshot
7. Save PNG file
8. Close browser
