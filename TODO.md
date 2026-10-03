# TODO
## Version 1.0.0

### 🎯 Purpose
Create an animated GIF demonstrating a webpage being scrolled from top to bottom.

### ⌨️ Usage
`node src/index.js URL FILENAME`
#### ➡️ Example
`node src/index.js https://example.com example.gif`

### ⚙️ Behavior
1. Launch a headless browser
2. Navigate to the supplied URL
3. Set a fixed viewport size
4. Capture the visible page as a frame
5. Scroll downward by a fixed amount
6. Repeat until the bottom of the page is reached
7. Encode the captured frames into an animated GIF
8. Write the GIF to the requested output path
9. Clean up temporary resources
10. Close the browser

#### 🐛 Errors
- Invalid/missing output cause useful error
- Runtime errors cause unsuccessful execution
- Resources are cleaned up when possible

### 📐 Constraints
- GIF output only
- 1 URL per invocation
- headless browser only
- fixed viewport dimensions
- fixed scroll distance
- fixed frame timing
- no configuration file
- no external configuration
- no advanced CLI options

### ✏️ Refactoring
#### 🟢 Reuse
- puppeteer/browser automation
- fixed viewport & scroll distance
- sequential screenshots
- GIF output
- temporary intermediate frames
- asynchronous workflow
#### 🟡 Revisit
- CLI argument handling
- page-bottom detection
- frame numbering
- GIF encoding library
- image decoding library
- temp file management
#### 🔴 Replace
- callback recursion
- manual async counters
- `require`
- `substr`
- `process.exit(0)` on success
- implicit error handling
- browser cleanup only on success

### 🚩 Milestones
1. Create modern Node.js project
2. Accept URL + output path
3. Open URL with browser
4. Capture 1 screenshot
5. Scroll + capture multiple frames
6. Detect page bottom
7. Encode frames into GIF
8. Clean up temp resources
9. Add basic error handling
10. Polish
