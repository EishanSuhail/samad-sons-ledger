const fs = require('fs');
const path = require('path');

// File paths
const htmlPath = path.join(__dirname, '..', 'index.html');
const appPath = path.join(__dirname, '..', 'app.js');
const wwwHtmlPath = path.join(__dirname, '..', 'www', 'index.html');
const wwwAppPath = path.join(__dirname, '..', 'www', 'app.js');
const aiexcelFuncsPath = path.join(__dirname, 'aiexcel-functions.js');

console.log("Starting spreadsheet installation...");

// 1. Read scratch/aiexcel-functions.js
if (!fs.existsSync(aiexcelFuncsPath)) {
  console.error("Error: scratch/aiexcel-functions.js not found!");
  process.exit(1);
}
const excelFunctionsCode = fs.readFileSync(aiexcelFuncsPath, 'utf8');

// 2. Read and update index.html
if (!fs.existsSync(htmlPath)) {
  console.error("Error: index.html not found!");
  process.exit(1);
}
let html = fs.readFileSync(htmlPath, 'utf8');

// A. Add Navigation Tab
const navTabTarget = `<button class="nav-tab" id="tab-aivoice" onclick="switchTab('aivoice')">
        <i class="fa-solid fa-microphone-lines"></i>
        <span>AI Studio</span>
      </button>`;

const newNavTab = `
      <button class="nav-tab" id="tab-aiexcel" onclick="switchTab('aiexcel')">
        <i class="fa-solid fa-file-excel"></i>
        <span>AI Excel</span>
      </button>`;

if (html.includes('id="tab-aiexcel"')) {
  console.log("AI Excel Nav Tab already in HTML.");
} else if (html.includes(navTabTarget)) {
  html = html.replace(navTabTarget, navTabTarget + newNavTab);
  console.log("Injected AI Excel Nav Tab.");
} else {
  // Fallback nav replacement
  html = html.replace('</nav>', `${newNavTab}\n    </nav>`);
  console.log("Injected AI Excel Nav Tab (Fallback).");
}

// B. Add Content View Section
const viewTarget = `      <!-- TAB 5: AI VOICE STUDIO -->
      <section id="view-aivoice" class="tab-view">`;

const newViewSection = `
      <!-- TAB 7: AI EXCEL SPREADSHEET -->
      <section id="view-aiexcel" class="tab-view">
        
        <!-- Welcome Hero Banner -->
        <div class="dashboard-hero" style="background: linear-gradient(135deg, rgba(16, 124, 65, 0.15) 0%, rgba(26,29,32,0.8) 100%); border-left: 5px solid #107c41;">
          <div class="hero-header">
            <h2>AI Excel Spreadsheet</h2>
            <p>Smart, lightning-fast bills & list scanner with human-like precision.</p>
          </div>
          <i class="fa-solid fa-file-excel hero-icon" style="color: #107c41; text-shadow: 0 0 20px rgba(16, 124, 65, 0.4);"></i>
        </div>

        <!-- Smart AI Spreadsheet Scanner Card -->
        <div style="background: linear-gradient(135deg, #107c41, #1f9a55); border-radius: 12px; padding: 20px; color: white; box-shadow: 0 4px 15px rgba(16, 124, 65, 0.25); display: flex; align-items: center; justify-content: space-between; gap: 15px;">
          <div style="flex: 1;">
            <h3 style="margin:0 0 5px 0; font-size:1.1rem; font-weight:700; display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-brain" style="color:#a7f3d0;"></i> Smart AI Excel Scanner</h3>
            <p style="margin:0; font-size:0.8rem; color:#d1fae5; line-height:1.4;">Billiya ya ledger parchi ki photo kheenchiye. AI same-to-same human ki tarah analyze karke automatic pure tabular rows aur columns populate kar dega!</p>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px; flex-shrink:0;">
            <button onclick="document.getElementById('excel-camera-input').click()" style="background:white; color:#107c41; border:none; padding:10px 14px; border-radius:8px; font-weight:bold; font-size:0.85rem; display:flex; align-items:center; gap:6px; justify-content:center; box-shadow:0 2px 5px rgba(0,0,0,0.1); cursor:pointer;"><i class="fa-solid fa-camera"></i> Camera</button>
            <button onclick="document.getElementById('excel-gallery-input').click()" style="background:rgba(255,255,255,0.25); color:white; border:1px solid rgba(255,255,255,0.4); padding:9px 13px; border-radius:8px; font-weight:bold; font-size:0.85rem; display:flex; align-items:center; gap:6px; justify-content:center; cursor:pointer;"><i class="fa-solid fa-image"></i> Gallery</button>
          </div>
        </div>

        <!-- Hidden File Inputs for Excel Vision Scanner -->
        <input type="file" id="excel-camera-input" accept="image/*" capture="environment" style="display:none;" onchange="handleExcelOcr(event)">
        <input type="file" id="excel-gallery-input" accept="image/*" style="display:none;" onchange="handleExcelOcr(event)">

        <!-- Excel Interactive Sheet Diary -->
        <div class="diary-page" style="padding: 20px; border-left: 10px solid #107c41;">
          
          <div class="diary-header" style="border-bottom: 2px solid #107c41; margin-bottom: 15px;">
            <span class="diary-page-title" style="color: #107c41;"><i class="fa-solid fa-table"></i> Spreadsheet Grid</span>
            <span class="diary-date-indicator" id="excel-sheet-date-display">Active Draft</span>
          </div>

          <!-- Sheet Info Inputs -->
          <div style="display:flex; gap:12px; margin-bottom:15px; flex-wrap:wrap;">
            <div style="flex:2; min-width:200px;">
              <label style="display:block; font-size:0.75rem; font-weight:600; color:#4a5568; margin-bottom:4px;">Customer / Party / Bill Name</label>
              <input type="text" id="excel-sheet-party" placeholder="e.g. Shabir Ahmad Ledger Bill" oninput="saveExcelDraft()" style="width: 100%; border: 1px solid #cbd5e0; padding: 10px; border-radius: 6px; font-size: 0.9rem; font-family:'Outfit',sans-serif; color:#2d3748; background:#fff; outline:none; transition: border-color 0.2s;">
            </div>
            <div style="flex:1; min-width:120px; display:flex; align-items:flex-end; gap:8px;">
              <button onclick="clearExcelGrid()" style="flex:1; background:#fff; border:1px solid #cbd5e0; color:#e53e3e; padding:10px; border-radius:6px; font-weight:bold; font-size:0.85rem; height:41px; cursor:pointer;" title="Clear Active Grid"><i class="fa-solid fa-trash-can"></i> Clear</button>
            </div>
          </div>

          <!-- Dynamic Spreadsheet Grid Table -->
          <div class="table-scroll-container" style="border: 1px solid #e2e8f0; border-radius: 8px; background: white; margin-bottom: 15px;">
            <table style="width:100%; border-collapse:collapse; text-align:left; font-size:0.85rem;">
              <thead>
                <tr style="background:#f7fafc; border-bottom:2px solid #e2e8f0; color:#4a5568; font-weight:bold;">
                  <th style="padding:10px; text-align:center; width:45px;">SN</th>
                  <th style="padding:10px; min-width:150px;">Description of Goods</th>
                  <th style="padding:10px; width:70px; text-align:center;">Qty</th>
                  <th style="padding:10px; width:90px; text-align:center;">Unit</th>
                  <th style="padding:10px; width:95px; text-align:right;">Price</th>
                  <th style="padding:10px; width:110px; text-align:right;">Amount</th>
                  <th style="padding:10px; width:40px; text-align:center;"></th>
                </tr>
              </thead>
              <tbody id="excel-grid-tbody">
                <!-- Javascript will inject dynamic tr elements -->
              </tbody>
            </table>
          </div>

          <!-- Add Manual Row trigger -->
          <button onclick="addExcelRow()" style="width:100%; background:transparent; border:1px dashed #cbd5e0; padding:12px; border-radius:6px; color:#4a5568; font-weight:600; text-align:center; font-size:0.88rem; cursor:pointer; margin-bottom:15px; transition: all 0.2s;"><i class="fa-solid fa-plus" style="color:#107c41; margin-right:5px;"></i> Add New Row</button>

          <!-- Grand Totals Display Card -->
          <div style="background:#f7fafc; padding:15px; border-radius:8px; border:1px solid #edf2f7; display:flex; flex-direction:column; gap:8px;">
            <div style="display:flex; justify-content:space-between;">
              <span style="color:#718096; font-weight:500;">Total Quantity:</span>
              <strong id="excel-total-qty" style="font-size:1.1rem; color:#2d3748;">0</strong>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="color:#2d3748; font-weight:bold; font-size:1.1rem;">Total Grand Amount:</span>
              <strong id="excel-total-amount" style="color:#107c41; font-size:1.4rem;">₹0.00</strong>
            </div>
          </div>

          <!-- Physical Diary Red Margin Decoration (Custom fit) -->
          <div class="diary-margin-line" style="left: 45px; background-color:rgba(16, 124, 65, 0.15);"></div>
        </div>

        <!-- Excel Action Sticky Buttons -->
        <div style="display:flex; gap:12px; flex-wrap:wrap; padding: 0 5px;">
          <button onclick="saveExcelSheet()" style="flex:2; background:#107c41; color:white; border:none; padding:15px; border-radius:8px; font-weight:bold; font-size:1rem; cursor:pointer; box-shadow:0 4px 12px rgba(16, 124, 65, 0.3); display:flex; align-items:center; justify-content:center; gap:8px;"><i class="fa-solid fa-floppy-disk"></i> Save Spreadsheet</button>
          <button onclick="shareExcelSheet()" style="flex:1; background:#25D366; color:white; border:none; padding:15px; border-radius:8px; font-weight:bold; font-size:1rem; cursor:pointer; box-shadow:0 4px 12px rgba(37,211,102,0.3); display:flex; align-items:center; justify-content:center; gap:8px;"><i class="fa-brands fa-whatsapp"></i> Share</button>
        </div>

        <!-- Saved Spreadsheets List Section -->
        <div style="background:white; border-radius:12px; padding:18px; box-shadow:0 2px 10px rgba(0,0,0,0.05); margin-top:5px; border: 1px solid var(--border-glass);">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #edf2f7; padding-bottom:10px; margin-bottom:12px;">
            <h3 style="margin:0; color:#2d3748; font-size:1.1rem; display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-folder-open" style="color:#107c41;"></i> Saved Spreadsheets</h3>
            <span style="font-size:0.75rem; color:#718096; font-weight:600; text-transform:uppercase;">Cloud Synced</span>
          </div>

          <!-- Saved List Search Bar -->
          <div class="search-bar-wrapper" style="margin:0 0 15px 0; border: 1px solid #e2e8f0; border-radius: 8px;">
            <i class="fa-solid fa-magnifying-glass search-icon" style="color:#a0aec0;"></i>
            <input type="text" id="excel-search-input" class="search-input" placeholder="Search saved sheets by party or items..." oninput="renderSavedExcelSheets()" style="padding-left:35px; width:100%; border:none; outline:none; height:38px;">
          </div>

          <!-- Scrollable Saved List Container -->
          <div id="excel-saved-list" style="display:flex; flex-direction:column; gap:10px; max-height:350px; overflow-y:auto; padding-right:5px;">
            <!-- Javascript will render saved sheets dynamically -->
          </div>
        </div>

      </section>
`;

if (html.includes('id="view-aiexcel"')) {
  console.log("view-aiexcel section already in HTML.");
} else if (html.includes(viewTarget)) {
  html = html.replace(viewTarget, newViewSection + '\n' + viewTarget);
  console.log("Injected AI Excel View section.");
} else {
  // Fallback insert before </main>
  html = html.replace('</main>', newViewSection + '\n    </main>');
  console.log("Injected AI Excel View section (Fallback).");
}

// Write index.html updates to root and www/
fs.writeFileSync(htmlPath, html, 'utf8');
if (fs.existsSync(path.dirname(wwwHtmlPath))) {
  fs.writeFileSync(wwwHtmlPath, html, 'utf8');
  console.log("Copied index.html to www/index.html");
}


// 3. Read and update app.js
if (!fs.existsSync(appPath)) {
  console.error("Error: app.js not found!");
  process.exit(1);
}
let app = fs.readFileSync(appPath, 'utf8');

// A. Global State Update
const stateTarget = `const state = {
  currentDate: '',               // Format: YYYY-MM-DD
  entries: [],                   // All ledger entries
  rent_payments: [],             // Store rent payments
  activeTab: 'ledger'            // Current visible tab
};`;

const stateReplacement = `const state = {
  currentDate: '',               // Format: YYYY-MM-DD
  entries: [],                   // All ledger entries
  rent_payments: [],             // Store rent payments
  estimates: [],                 // Estimates
  spreadsheets: [],              // Saved spreadsheets
  activeTab: 'ledger'            // Current visible tab
};`;

if (app.includes('spreadsheets: [],')) {
  console.log("State spreadsheets definition already exists.");
} else if (app.includes(stateTarget)) {
  app = app.replace(stateTarget, stateReplacement);
  console.log("Updated state definition in app.js.");
} else {
  // Let's search for entries: []
  app = app.replace("entries: [],", "entries: [],\n  spreadsheets: [],\n  estimates: [],");
  console.log("Updated state definition in app.js (Fallback).");
}

// B. LoadLocalData Update
const loadLocalRentTarget = `  const rawRent = safeStorage.getItem(STORAGE_KEY + '_rent');
  if (rawRent) {
    try {
      state.rent_payments = JSON.parse(rawRent);
    } catch (err) {
      state.rent_payments = [];
    }
  } else {
    state.rent_payments = [];
  }`;

const loadLocalSpreadsheetBlock = `

  const rawSpreadsheet = safeStorage.getItem('samad_sons_spreadsheets');
  if (rawSpreadsheet) {
    try {
      state.spreadsheets = JSON.parse(rawSpreadsheet);
    } catch (err) {
      state.spreadsheets = [];
    }
  } else {
    state.spreadsheets = [];
  }`;

if (app.includes("'samad_sons_spreadsheets'")) {
  console.log("Local Storage spreadsheets loader already exists.");
} else if (app.includes(loadLocalRentTarget)) {
  app = app.replace(loadLocalRentTarget, loadLocalRentTarget + loadLocalSpreadsheetBlock);
  console.log("Added spreadsheets to loadLocalData.");
}

// C. SaveLocalData Update
const saveLocalTarget = `  safeStorage.setItem(STORAGE_KEY + '_rent', JSON.stringify(state.rent_payments));`;
const saveLocalSpreadsheetLine = `\n  safeStorage.setItem('samad_sons_spreadsheets', JSON.stringify(state.spreadsheets || []));`;

if (app.includes("safeStorage.setItem('samad_sons_spreadsheets'")) {
  console.log("saveLocalData spreadsheets saver already exists.");
} else if (app.includes(saveLocalTarget)) {
  app = app.replace(saveLocalTarget, saveLocalTarget + saveLocalSpreadsheetLine);
  console.log("Added spreadsheets to saveLocalData.");
}

// D. LoadCloudData Update
const loadCloudTarget = `    // 3. Fetch Estimates
    const { data: estData, error: estError } = await supabaseClient
      .from('estimates')
      .select('*');
      
    if (!estError && estData) {
      state.estimates = estData;
    }

    saveLocalData();`;

const loadCloudReplacement = `    // 3. Fetch Estimates
    const { data: estData, error: estError } = await supabaseClient
      .from('estimates')
      .select('*');
      
    if (!estError && estData) {
      state.estimates = estData;
    }

    // 4. Fetch Spreadsheets
    try {
      const { data: spreadData, error: spreadError } = await supabaseClient
        .from('saved_spreadsheets')
        .select('*');
        
      if (!spreadError && spreadData) {
        state.spreadsheets = spreadData;
      }
    } catch (e) {
      console.warn("Spreadsheet cloud load failed", e);
    }

    saveLocalData();`;

if (app.includes("from('saved_spreadsheets')")) {
  console.log("loadCloudData spreadsheets loader already exists.");
} else if (app.includes(loadCloudTarget)) {
  app = app.replace(loadCloudTarget, loadCloudReplacement);
  console.log("Added spreadsheets to loadCloudData.");
}

// E. Realtime Postgres Changes Sync Update
const realtimeTarget = `        saveLocalData();
        if (state.activeTab === 'estimates') {
          renderEstimates();
        }
      }
    )
    .subscribe((status) => {`;

const realtimeReplacement = `        saveLocalData();
        if (state.activeTab === 'estimates') {
          renderEstimates();
        }
      }
    )
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'saved_spreadsheets' },
      (payload) => {
        console.log("Realtime event (spreadsheets):", payload.eventType, payload);

        if (!state.spreadsheets) state.spreadsheets = [];

        if (payload.eventType === 'INSERT') {
          const newRec = payload.new;
          if (!state.spreadsheets.some(s => s.id === newRec.id)) {
            state.spreadsheets.push(newRec);
          }
        } else if (payload.eventType === 'UPDATE') {
          const idx = state.spreadsheets.findIndex(s => s.id === payload.new.id);
          if (idx !== -1) state.spreadsheets[idx] = payload.new;
        } else if (payload.eventType === 'DELETE') {
          state.spreadsheets = state.spreadsheets.filter(s => s.id !== payload.old.id);
        }

        saveLocalData();
        if (state.activeTab === 'aiexcel') {
          renderSavedExcelSheets();
        }
      }
    )
    .subscribe((status) => {`;

if (app.includes("table: 'saved_spreadsheets'")) {
  console.log("Realtime spreadsheets listener already exists.");
} else if (app.includes(realtimeTarget)) {
  app = app.replace(realtimeTarget, realtimeReplacement);
  console.log("Added spreadsheets realtime listener in startRealtimeSync.");
}

// F. SwitchTab & RenderApp Update
const renderAppTarget = `    } else if (state.activeTab === 'rent') {
      renderRentTab();
    }
}`;

const renderAppReplacement = `    } else if (state.activeTab === 'rent') {
      renderRentTab();
    } else if (state.activeTab === 'aiexcel') {
      initExcelTab();
    }
}`;

if (app.includes("state.activeTab === 'aiexcel'")) {
  console.log("renderApp spreadsheets trigger already exists.");
} else if (app.includes(renderAppTarget)) {
  app = app.replace(renderAppTarget, renderAppReplacement);
  console.log("Added spreadsheets trigger to renderApp.");
}

// G. Append Excel Functions to the end of app.js
if (app.includes("DYNAMIC AI EXCEL SPREADSHEET ENGINE")) {
  console.log("Excel functions already appended to app.js.");
} else {
  app += `\n\n\n${excelFunctionsCode}`;
  console.log("Appended Excel Functions to the end of app.js.");
}

// Write app.js updates to root and www/
fs.writeFileSync(appPath, app, 'utf8');
if (fs.existsSync(path.dirname(wwwAppPath))) {
  fs.writeFileSync(wwwAppPath, app, 'utf8');
  console.log("Copied app.js to www/app.js");
}

console.log("AI Excel Spreadsheet Tab & Functions installed successfully!");
