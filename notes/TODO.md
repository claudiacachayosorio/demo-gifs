# TODO

## Version 0.5
### 🎯 Overview
Handle usage and runtime errors.

### 🐛 Errors
#### ⌨️ Usage
- missing URL
- missing output
- invalid URL
  - link doesn't exist
- invalid output
  - malformed: doesn't end in `.gif`
  - target directory doesn't exist
  - path isn't writable
#### ▶️ Runtime
- create temp directory
  - filesystem error
- launch browser
  - puppeteer error
- take screenshots
  - page creation error
  - navigation error
  - screenshot error
  - page.evaluate() error
- create gif
  - filesystem error
  - stream error
  - image error
  - encoder error
- cleanup
  - browser error
  - filesystem error

### 🔀 Workflow
1. Get URL and output
2. Validate URL and output
3. Create temp directory
4. Launch headless browser
5. Create page
6. Set viewport
7. Navigate to supplied URL
8. Take screenshot
9. Save PNG file to temp directory
10. Scroll down by fixed amount
11. Repeat until bottom is reached
12. Create read and write streams
13. Create canvas context
14. Load image from PNG
15. Draw image onto context
16. Pass context to GIF encoder
17. Repeat for each PNG
18. Save GIF file to output
19. Close browser
20. Clean up temp directory

--

## Version 0.4
### 🎯 Overview
Generate an animated gif.
```shell
npm start -- https://example.com example.gif
# output: example.gif
```
### 🔀 Workflow
1. Get URL and output
2. Create temp directory
3. Launch headless browser
4. Open page
5. Set viewport
6. Navigate to supplied URL
7. Take screenshot
8. Save PNG file to temp directory
9. Scroll down by fixed amount
10. Repeat until bottom is reached
11. Create read and write streams
12. Create canvas context
13. Load image from PNG
14. Draw image onto context
15. Pass context to GIF encoder
16. Repeat for each PNG
17. Save GIF file to output
18. Close browser
19. Clean up temp directory

---

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
