# TODO

## Version 0.3
### 🎯 Overview
Generate sequential screenshots of webpage being scrolled top to bottom.
```shell
npm start -- https://example.com
# output to tmpDir: 1.png, 2.png, ...
```
### 🔀 Workflow
1. Get URL and filename
2. Create temp directory
3. Launch headless browser
4. Open page
5. Set viewport
6. Navigate to supplied URL
7. Take screenshot
8. Save PNG file to temp directory
9. Scroll down by fixed amount
10. Repeat until bottom is reached
11. Close browser
12. Clean up temp directory

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
