# TODO

## ➡️ Version 1.0
### 🎯 Overview
Polish and document stable release.

### 📋 Checklist
#### PR/code work
[ ] finish `main()` refactor
[x] make `puppeteer` launch options injectable
[ ] remove obsolete/dead code from previous 0.x iterations
[ ] review error handling
[ ] review CLI behavior & settle v1 contract
#### Tests
[ ] finish output-path integration tests
[ ] have 1 end-to-end test proving URL → GIF
[ ] test important failure paths
[x] verify CI passes with injected `--no-sandbox`
#### Documentation/release
[ ] `README` reflects v1 CLI
[ ] document installation + usage
[ ] include example of GIT/output behavior
[ ] document requirements
[ ] document limitations
[ ] review `.gitignore`
[ ] cleanup package metadata
[ ] final dependency review
[ ] fresh-clone verification
[ ] review repository description
[ ] tag/release

---

## ➡️ Version 0.7
### 🎯 Overview
Settle output path behavior:
- determine path relative to project directory
- create any missing directories
- overwrite if file already exists

---

## ➡️ Version 0.6
### 🎯 Overview
Handle usage errors:
- print useful error and usage snippet
- exit unsuccessfully

### 🐛 Errors
#### Usage
- missing arguments
- invalid URL
- invalid output
#### Runtime
- temp directory
  - filesystem error
- take screenshots
  - browser error
  - page error
  - screenshot error
  - window error
- create gif
  - stream error
  - image error
  - encoder error

### 🔀 Workflow
#### Parameters
- Get URL and output
- Validate URL and output
#### Set up
- Create temp directory
#### Screenshots
- Launch headless browser
- Create page
- Set viewport
- Navigate to supplied URL
- Take screenshot
- Save PNG file to temp directory
- Scroll down by fixed amount
- Repeat until bottom is reached
- Close browser
#### GIF encoding
- Create read and write streams
- Create canvas context
- Load image from PNG
- Draw image onto context
- Pass context to GIF encoder
- Repeat for each PNG
- Save GIF file to output
#### Clean up
- Clean up temp directory

---

## ➡️ Version 0.5
### 🎯 Overview
Handle runtime errors:
- print error information
- clean up resources
- exit unsuccessfully

### 🐛 Errors
- temp directory
  - filesystem error
- take screenshots
  - browser error
  - page error
  - screenshot error
  - window error
- create gif
  - stream error
  - image error
  - encoder error

### 🔀 Workflow
1.  Get URL and output
2.  Create temp directory
3.  Launch headless browser
4.  Create page
5.  Set viewport
6.  Navigate to supplied URL
7.  Take screenshot
8.  Save PNG file to temp directory
9.  Scroll down by fixed amount
10. Repeat until bottom is reached
11. Close browser
12. Create read and write streams
13. Create canvas context
14. Load image from PNG
15. Draw image onto context
16. Pass context to GIF encoder
17. Repeat for each PNG
18. Save GIF file to output
19. Clean up temp directory

--

## ➡️ Version 0.4
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

## ➡️ Version 0.3
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

## ➡️ Version 0.2
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
