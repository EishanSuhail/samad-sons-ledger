const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'app.js');
const wwwAppPath = path.join(__dirname, '..', 'www', 'app.js');
const htmlPath = path.join(__dirname, '..', 'index.html');
const wwwHtmlPath = path.join(__dirname, '..', 'www', 'index.html');

console.log("Installing Predictive Intelligence Engine, Autocomplete Pricing Dictionary, & Text-to-Speech...");

// 1. Update index.html to add Datalist element
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  
  const datalistMarkup = `\n        <!-- Dynamic Autocomplete Suggestions Datalist -->\n        <datalist id="excel-desc-suggestions"></datalist>\n`;
  
  if (html.includes('id="excel-desc-suggestions"')) {
    console.log("Datalist suggestions already exist in index.html.");
  } else {
    html = html.replace('<section id="view-aiexcel" class="tab-view">', '<section id="view-aiexcel" class="tab-view">' + datalistMarkup);
    console.log("Injected excel-desc-suggestions datalist into index.html.");
  }
  
  fs.writeFileSync(htmlPath, html, 'utf8');
  if (fs.existsSync(wwwHtmlPath)) {
    fs.writeFileSync(wwwHtmlPath, html, 'utf8');
  }
}

// 2. Update app.js (and www/app.js)
if (fs.existsSync(appPath)) {
  let app = fs.readFileSync(appPath, 'utf8');
  
  // A. Replace input description field to support datalist suggestions and auto price-fill trigger
  const oldDescInput = `<input type="text" class="excel-desc" value="\${desc}" placeholder="Enter item name..." style="width: 100%; border: none; padding: 6px; outline: none; font-size: 0.9rem;" oninput="saveExcelDraft()">`;
  
  const smartDescInput = `<input type="text" class="excel-desc" list="excel-desc-suggestions" value="\${desc}" placeholder="Enter item name..." style="width: 100%; border: none; padding: 6px; outline: none; font-size: 0.9rem; font-weight: 500;" oninput="handleExcelDescChange(this, '\${rowId}')" autocomplete="off">`;

  if (app.includes('list="excel-desc-suggestions"')) {
    console.log("addExcelRow description field already supports datalist.");
  } else if (app.includes(oldDescInput)) {
    app = app.replace(oldDescInput, smartDescInput);
    console.log("Upgraded Excel row description input in app.js.");
  } else {
    // Try to replace inside string
    app = app.replace('class="excel-desc"', 'class="excel-desc" list="excel-desc-suggestions" oninput="handleExcelDescChange(this, \'${rowId}\')"');
    console.log("Upgraded Excel row description input in app.js (Fallback).");
  }

  // B. Add dynamic TTS speak button and dynamic pricing suggestions helper inside rowHtml
  const oldActionCol = `<td style="padding: 6px; text-align: center;">\n        <button onclick="removeExcelRow('\${rowId}')" style="background: none; border: none; color: #e53e3e; cursor: pointer; padding: 4px;"><i class="fa-solid fa-trash-can"></i></button>\n      </td>`;
  
  const smartActionCol = `<td style="padding: 6px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 4px; height: 100%;">\n        <button onclick="speakExcelRow('\${rowId}')" style="background: none; border: none; color: #107c41; cursor: pointer; padding: 4px;" title="Speak details"><i class="fa-solid fa-volume-high"></i></button>\n        <button onclick="removeExcelRow('\${rowId}')" style="background: none; border: none; color: #e53e3e; cursor: pointer; padding: 4px;" title="Delete row"><i class="fa-solid fa-trash-can"></i></button>\n      </td>`;

  if (app.includes("speakExcelRow")) {
    console.log("Row speaker button already exists in app.js.");
  } else if (app.includes(oldActionCol)) {
    app = app.replace(oldActionCol, smartActionCol);
    console.log("Injected audio speaking row button inside app.js.");
  }

  // C. Add startup trigger to populate datalist when tab switches
  const switchTabExcelTarget = `} else if (state.activeTab === 'aiexcel') {
      initExcelTab();
    }`;

  const switchTabExcelReplacement = `} else if (state.activeTab === 'aiexcel') {
      initExcelTab();
      populateExcelDatalist();
    }`;

  if (app.includes("populateExcelDatalist();")) {
    console.log("populateExcelDatalist is already triggered on switchTab.");
  } else if (app.includes(switchTabExcelTarget)) {
    app = app.replace(switchTabExcelTarget, switchTabExcelReplacement);
    console.log("Added populateExcelDatalist trigger to switchTab.");
  }

  // D. Append Predictive Intelligence and Price Lookup Engine functions to the end
  const predictiveEngineFunctions = `
// --------------------------------------------------------------------------
// PREDICTIVE HISTORICAL SUGGESTIONS & TTS ENGINE
// --------------------------------------------------------------------------
function populateExcelDatalist() {
  const datalist = document.getElementById('excel-desc-suggestions');
  if (!datalist) return;
  
  datalist.innerHTML = '';
  const itemsSet = new Set();
  
  // Pull unique items from historic store ledger diary entries
  if (state.entries) {
    state.entries.forEach(e => {
      if (e.item && !e.item.endsWith('\\u200B')) {
        const cleanName = e.item.split('<br>')[0].trim().toUpperCase();
        if (cleanName.length > 2) itemsSet.add(cleanName);
      }
    });
  }
  
  // Standard high-quality catalog items
  const premiumCatalog = [
    "CGI ROOFING SHEET 10FT", "STEEL NAILS 2 INCH", "PVC BEND PIPE 4 INCH",
    "DISTEMPER WHITE PAINT 10L", "BLACK WIRE COIL 5KG", "CEMENT BAGS OPC 53",
    "BRASS DOOR LOCKS PREMIUM", "COPPER WIRING BUNDLE 1.5MM", "FIBER GLASS 2-1/2\\"",
    "NAILS 4\\" X 8 10 PKT/ CASE SPARK", "NAILS 3\\" X 12 10 PKT/ CASE SPARK",
    "CANCREAT NAILS 2\\"", "NSE BUS GREEN 500 ML", "SHOE NAILS", "FEVICOL SH 250 GM",
    "BAINDING WIRE SPARK", "PIPE SS 1\\" X 15' CURTAIN"
  ];
  premiumCatalog.forEach(item => itemsSet.add(item.toUpperCase()));
  
  itemsSet.forEach(item => {
    const option = document.createElement('option');
    option.value = item;
    datalist.appendChild(option);
  });
}

function handleExcelDescChange(inputEl, rowId) {
  saveExcelDraft();
  const val = inputEl.value.trim().toUpperCase();
  if (!val) return;
  
  // Auto pricing engine: checks if item was sold historically and pre-fills
  if (state.entries) {
    const match = state.entries.find(e => e.item.split('<br>')[0].trim().toUpperCase() === val);
    if (match) {
      const rowEl = document.getElementById(rowId);
      if (rowEl) {
        const priceInput = rowEl.querySelector('.excel-price');
        if (priceInput && (!priceInput.value || parseFloat(priceInput.value) === 0)) {
          priceInput.value = match.rate;
          calcExcelRow(rowId);
          showToast("Intelligent pricing pre-filled from history!", "fa-solid fa-wand-magic-sparkles");
        }
      }
    }
  }
}

function speakExcelRow(rowId) {
  const rowEl = document.getElementById(rowId);
  if (!rowEl) return;
  
  const desc = rowEl.querySelector('.excel-desc').value.trim() || 'Empty Item';
  const qty = rowEl.querySelector('.excel-qty').value || '0';
  const unit = rowEl.querySelector('.excel-unit').value || 'Pcs';
  const price = rowEl.querySelector('.excel-price').value || '0';
  const amount = parseFloat(qty) * parseFloat(price);
  
  const speechText = desc + ". Quantity: " + qty + " " + unit + ". Unit Price: " + price + " rupees. Total amount is " + amount.toFixed(2) + " rupees.";
  
  if (typeof speakTts === 'function') {
    speakTts(speechText);
  } else if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // stop current audio
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = 'en-IN';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }
  showToast("Audio Speak: Auditing row...", "fa-solid fa-volume-high");
}
`;

  if (app.includes("function populateExcelDatalist()")) {
    console.log("populateExcelDatalist already appended to app.js.");
  } else {
    app += `\n${predictiveEngineFunctions}`;
    console.log("Appended Predictive pricing and Speak functions to app.js.");
  }

  fs.writeFileSync(appPath, app, 'utf8');
  if (fs.existsSync(wwwAppPath)) {
    fs.writeFileSync(wwwAppPath, app, 'utf8');
  }
}

console.log("Predictive Pricing suggestions & TTS fully installed!");
