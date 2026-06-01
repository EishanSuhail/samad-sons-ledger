const fs = require('fs');
const path = require('path');

// ----------------------------------------------------
// 1. PATCH index.html
// ----------------------------------------------------
const htmlPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Standardize to LF
html = html.replace(/\r\n/g, '\n');

// 1a. Insert P2P Sync Card inside AI Studio View
const targetVoiceStudioHeader = `      <!-- TAB 5: AI VOICE STUDIO -->
      <section id="view-aivoice" class="tab-view">
        <div class="dashboard-hero" style="background: linear-gradient(135deg, #1e3a8a, #3b82f6);">
          <div class="hero-header">
            <h2>AI Voice Studio</h2>
            <p>Generate highly realistic human voices using ElevenLabs or System TTS.</p>
          </div>
        </div>

        <div style="padding: 15px;">`;

const newVoiceStudioHeader = `      <!-- TAB 5: AI VOICE STUDIO -->
      <section id="view-aivoice" class="tab-view">
        <div class="dashboard-hero" style="background: linear-gradient(135deg, #1e3a8a, #3b82f6);">
          <div class="hero-header">
            <h2>AI Voice Studio</h2>
            <p>Generate highly realistic human voices using ElevenLabs or System TTS.</p>
          </div>
        </div>

        <div style="padding: 15px;">

          <!-- P2P Offline Sync Card -->
          <div style="background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 16px; padding: 20px; margin-bottom: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); color: white; position: relative; overflow: hidden; border: 1px solid rgba(255,255,255,0.05);">
            <div style="position: absolute; top: -20px; right: -20px; width: 80px; height: 80px; background: rgba(56, 189, 248, 0.1); border-radius: 50%; filter: blur(20px);"></div>
            <h3 style="margin-top: 0; font-size: 1.2rem; color: #f8fafc; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; font-weight: 700;">
              <i class="fa-solid fa-wifi-slash" style="color: #38bdf8; font-size: 1.3rem;"></i> P2P Offline Local Sync
            </h3>
            <p style="font-size: 0.85rem; color: #94a3b8; margin: 0 0 18px 0; line-height: 1.4;">Bina internet do phones ke darmiyan khata ledger data direct sync karein! Dynamic QR codes ke zariye fast aur secure transfer.</p>
            
            <div style="display: flex; gap: 12px;">
              <button onclick="openP2pSendModal()" style="flex: 1; background: linear-gradient(135deg, #0284c7, #0369a1); color: white; border: none; padding: 12px 10px; border-radius: 10px; font-weight: bold; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3); transition: all 0.2s;"><i class="fa-solid fa-qrcode"></i> Bhejein (Send)</button>
              <button onclick="openP2pReceiveModal()" style="flex: 1; background: linear-gradient(135deg, #10b981, #047857); color: white; border: none; padding: 12px 10px; border-radius: 10px; font-weight: bold; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); transition: all 0.2s;"><i class="fa-solid fa-expand"></i> Scan (Receive)</button>
            </div>
          </div>`;

if (html.includes(targetVoiceStudioHeader)) {
  html = html.replace(targetVoiceStudioHeader, newVoiceStudioHeader);
  console.log("P2P Local Sync Card inserted into index.html!");
} else if (html.includes('p2p-send-dialog')) {
  console.log("P2P Card already in index.html");
} else {
  console.error("Could not locate voice studio header in index.html");
  process.exit(1);
}

// 1b. Insert Modals and Offline Script References right before app.js script tag
const targetScriptTag = `<script src="app.js"></script>`;

const newScriptTags = `  <!-- P2P Send Dialog -->
  <dialog id="p2p-send-dialog" class="custom-dialog" style="width: 95%; max-width: 450px; padding: 0;">
    <div class="dialog-content" style="display:flex; flex-direction:column; max-height: 90vh;">
      <div class="dialog-header" style="padding: 15px; border-bottom: 1px solid #edf2f7; background: #f8fafc; border-radius: 16px 16px 0 0;">
        <h3 style="margin:0; font-size:1.15rem; color:#1e293b; display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-qrcode" style="color:#0284c7;"></i> P2P Offline Sync (Send)</h3>
        <button type="button" class="close-dialog-btn" onclick="closeP2pSendDialog()"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="dialog-body" style="padding: 20px; overflow-y: auto; background: #fff; text-align:center;">
        
        <div id="p2p-send-config" style="margin-bottom:15px; text-align:left;">
          <label style="display:block; font-size:0.85rem; font-weight:600; color:#4a5568; margin-bottom:5px;">Select Sync Range (Kitna Data Bhejna Hai?)</label>
          <select id="p2p-sync-range" onchange="generateSyncQR()" style="width:100%; padding:10px; border-radius:8px; border:1px solid #cbd5e0; font-weight:500;">
            <option value="today">Today's Entries Only (Recommended)</option>
            <option value="3days">Last 3 Days Entries</option>
            <option value="all">All Entries (Full Ledger Backup)</option>
          </select>
        </div>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:15px; display:inline-block; margin-bottom:15px; position:relative;">
          <canvas id="p2p-qr-canvas" style="display:block; margin:0 auto; max-width:250px; height:auto;"></canvas>
        </div>

        <div id="p2p-pagination" style="display:none; justify-content:space-between; align-items:center; margin-bottom:15px; background:#e0f2fe; padding:8px 12px; border-radius:8px; color:#0369a1; font-weight:600; font-size:0.9rem;">
          <button onclick="prevQrPage()" id="btn-prev-qr" style="background:white; border:1px solid #0284c7; padding:4px 10px; border-radius:4px; font-weight:bold; color:#0284c7;"><i class="fa-solid fa-chevron-left"></i> Back</button>
          <span id="p2p-page-indicator">QR Code 1 of 1</span>
          <button onclick="nextQrPage()" id="btn-next-qr" style="background:white; border:1px solid #0284c7; padding:4px 10px; border-radius:4px; font-weight:bold; color:#0284c7;">Next <i class="fa-solid fa-chevron-right"></i></button>
        </div>

        <p style="font-size:0.85rem; color:#64748b; line-height:1.4; margin:0;">
          Dusre phone par <strong>"Scan (Receive)"</strong> button dabakar is QR code ko scan karein.<br>
          <span style="color:#0284c7; font-weight:600;" id="p2p-send-summary">0 entries found.</span>
        </p>

      </div>
      <div style="padding: 15px; border-top: 1px solid #edf2f7; background: #f8fafc; border-radius: 0 0 16px 16px;">
        <button type="button" onclick="closeP2pSendDialog()" style="width:100%; background:#64748b; border:none; padding:12px; border-radius:8px; color:white; font-weight:600; font-size:1rem;">Done</button>
      </div>
    </div>
  </dialog>

  <!-- P2P Receive Dialog -->
  <dialog id="p2p-receive-dialog" class="custom-dialog" style="width: 95%; max-width: 450px; padding: 0;">
    <div class="dialog-content" style="display:flex; flex-direction:column; max-height: 90vh;">
      <div class="dialog-header" style="padding: 15px; border-bottom: 1px solid #edf2f7; background: #f8fafc; border-radius: 16px 16px 0 0;">
        <h3 style="margin:0; font-size:1.15rem; color:#1e293b; display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-expand" style="color:#10b981;"></i> P2P Offline Sync (Receive)</h3>
        <button type="button" class="close-dialog-btn" onclick="closeP2pReceiveDialog()"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="dialog-body" style="padding: 20px; overflow-y: auto; background: #fff; text-align:center;">
        
        <div style="background:#e6fffa; border:1px dashed #319795; border-radius:12px; padding:20px; color:#234e52; font-weight:600; font-size:1rem; margin-bottom:20px;">
          <i class="fa-solid fa-mobile-screen-button" style="font-size:2rem; color:#319795; margin-bottom:10px; display:block;"></i>
          Dusre phone ka QR Code scan karke data merge karein!
        </div>

        <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:15px;">
          <button onclick="document.getElementById('p2p-camera-input').click()" style="background:linear-gradient(135deg, #10b981, #059669); color:white; border:none; padding:15px; border-radius:10px; font-weight:bold; font-size:1.05rem; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 12px rgba(16,185,129,0.3);"><i class="fa-solid fa-camera"></i> Use Camera (Scan QR)</button>
          <button onclick="document.getElementById('p2p-gallery-input').click()" style="background:white; border:1px solid #cbd5e0; padding:12px; border-radius:10px; font-weight:bold; font-size:0.95rem; color:#4a5568; display:flex; align-items:center; justify-content:center; gap:8px;"><i class="fa-solid fa-image" style="color:#10b981;"></i> Choose from Gallery</button>
        </div>

        <div id="p2p-scanned-status" style="display:none; background:#edf2f7; border-radius:8px; padding:10px; color:#2d3748; font-size:0.85rem; font-weight:bold; margin-top:10px; line-height: 1.4;">
          No code scanned yet.
        </div>

        <!-- Hidden inputs for P2P photo scanner -->
        <input type="file" id="p2p-camera-input" accept="image/*" capture="environment" style="display:none;" onchange="handleP2pQrScan(event)">
        <input type="file" id="p2p-gallery-input" accept="image/*" style="display:none;" onchange="handleP2pQrScan(event)">

      </div>
      <div style="padding: 15px; border-top: 1px solid #edf2f7; background: #f8fafc; border-radius: 0 0 16px 16px;">
        <button type="button" onclick="closeP2pReceiveDialog()" style="width:100%; background:#64748b; border:none; padding:12px; border-radius:8px; color:white; font-weight:600; font-size:1rem;">Cancel</button>
      </div>
    </div>
  </dialog>

  <!-- Offline QR Libraries -->
  <script src="qrious.min.js"></script>
  <script src="jsqr.min.js"></script>
  <script src="app.js"></script>`;

if (html.includes(targetScriptTag)) {
  html = html.replace(targetScriptTag, newScriptTags);
  console.log("P2P Dialogs and scripts inserted into index.html!");
} else if (html.includes('p2p-send-dialog')) {
  console.log("P2P Dialogs already present.");
} else {
  console.error("Could not find script src=app.js in index.html");
  process.exit(1);
}

html = html.replace(/\n/g, '\r\n'); // Convert back to CRLF
fs.writeFileSync(htmlPath, html, 'utf8');
console.log("index.html fully patched!");


// ----------------------------------------------------
// 2. PATCH app.js (Append P2P Functions)
// ----------------------------------------------------
const appPath = path.join(__dirname, '..', 'app.js');
let app = fs.readFileSync(appPath, 'utf8');

// Standardize to LF
app = app.replace(/\r\n/g, '\n');

// Read the pure functions from p2p-functions.js
const p2pEngineFunctions = fs.readFileSync(path.join(__dirname, 'p2p-functions.js'), 'utf8');

if (!app.includes('function openP2pSendModal(')) {
  app = app + "\n" + p2pEngineFunctions;
  console.log("P2P Engine Functions appended to app.js!");
} else {
  console.log("P2P Engine Functions already present in app.js");
}

app = app.replace(/\n/g, '\r\n'); // Convert back to CRLF
fs.writeFileSync(appPath, app, 'utf8');
console.log("app.js completely patched!");
