const fs = require('fs');
const path = require('path');

// 1. Patch index.html
const htmlPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Standardize to LF
html = html.replace(/\r\n/g, '\n');

const targetHtml = `          <div id="estimate-list" style="padding:15px; display:flex; flex-direction:column; gap:12px; padding-bottom:90px;">`;

const newHtml = `          <!-- Smart AI Parchi Scanner Entry Card -->
          <div style="margin: 15px; background: linear-gradient(135deg, #1e3a8a, #3b82f6); border-radius: 12px; padding: 15px; color: white; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25); display: flex; align-items: center; justify-content: space-between; gap: 15px;">
            <div style="flex: 1;">
              <h3 style="margin:0 0 5px 0; font-size:1.05rem; font-weight:700; display:flex; align-items:center; gap:5px;"><i class="fa-solid fa-brain" style="color:#60a5fa;"></i> Smart AI Parchi Scanner</h3>
              <p style="margin:0; font-size:0.78rem; color:#bfdbfe; line-height:1.3;">Apni printed bill ya hath se likhi parchi ki photo kheenchiye aur automatic table populate karein!</p>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <button onclick="openNewEstimateWithOcr('camera')" style="background:white; color:#1e3a8a; border:none; padding:8px 12px; border-radius:6px; font-weight:bold; font-size:0.8rem; display:flex; align-items:center; gap:5px; justify-content:center; box-shadow:0 2px 5px rgba(0,0,0,0.1);"><i class="fa-solid fa-camera"></i> Camera</button>
              <button onclick="openNewEstimateWithOcr('gallery')" style="background:rgba(255,255,255,0.2); color:white; border:1px solid rgba(255,255,255,0.4); padding:7px 11px; border-radius:6px; font-weight:bold; font-size:0.8rem; display:flex; align-items:center; gap:5px; justify-content:center;"><i class="fa-solid fa-image"></i> Gallery</button>
            </div>
          </div>

          <div id="estimate-list" style="padding:15px; display:flex; flex-direction:column; gap:12px; padding-bottom:90px;">`;

if (!html.includes(targetHtml)) {
  console.error("targetHtml in index.html not found!");
  process.exit(1);
}
html = html.replace(targetHtml, newHtml);
html = html.replace(/\n/g, '\r\n'); // Convert back to CRLF
fs.writeFileSync(htmlPath, html, 'utf8');
console.log("index.html patched successfully for OCR entry visibility!");


// 2. Patch app.js to add openNewEstimateWithOcr(mode)
const appPath = path.join(__dirname, '..', 'app.js');
let app = fs.readFileSync(appPath, 'utf8');

// Standardize to LF
app = app.replace(/\r\n/g, '\n');

const helperFunction = `
function openNewEstimateWithOcr(mode) {
  // 1. Open the estimate screen
  openNewEstimateScreen();
  // 2. Trigger the camera/gallery file click after a tiny delay
  setTimeout(() => {
    if (mode === 'camera') {
      const el = document.getElementById('ocr-camera-input');
      if (el) el.click();
    } else {
      const el = document.getElementById('ocr-gallery-input');
      if (el) el.click();
    }
  }, 300);
}
`;

if (!app.includes('function openNewEstimateWithOcr(')) {
  app = app + "\n" + helperFunction;
  console.log("Helper openNewEstimateWithOcr appended to app.js!");
} else {
  console.log("Helper already exists in app.js.");
}

app = app.replace(/\n/g, '\r\n'); // Convert back to CRLF
fs.writeFileSync(appPath, app, 'utf8');
console.log("app.js completely patched!");
