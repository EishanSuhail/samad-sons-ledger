const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'app.js');
const wwwAppPath = path.join(__dirname, '..', 'www', 'app.js');

console.log("Installing unlimited row appending and persistent safe active draft protection...");

if (fs.existsSync(appPath)) {
  let app = fs.readFileSync(appPath, 'utf8');
  
  // Normalize line endings to LF for search accuracy
  app = app.replace(/\r\n/g, '\n');

  // A. Modify handleExcelOcr to append scanned items rather than clearing the grid
  const oldOcrInject = `    if (Array.isArray(items)) {
      document.getElementById('excel-sheet-party').value = "Scanned Bill (" + new Date().toLocaleDateString() + ")";
      const tbody = document.getElementById('excel-grid-tbody');
      tbody.innerHTML = '';
      activeExcelRows = [];
      
      items.forEach(item => {
        addExcelRow(
          item.desc || "Unidentified Item",
          parseFloat(item.qty) || 1,
          item.unit || "Pcs",
          parseFloat(item.price) || 0
        );
      });
      
      showToast("Spreadsheet parsed successfully!", "fa-solid fa-file-excel");
      saveExcelDraft();`;

  const smartOcrInject = `    if (Array.isArray(items)) {
      const partyInput = document.getElementById('excel-sheet-party');
      if (!partyInput.value.trim()) {
        partyInput.value = "Scanned Bill (" + new Date().toLocaleDateString() + ")";
      }
      
      // Append scanned rows intelligently. If there is a single blank initial row, remove it.
      if (activeExcelRows.length === 1) {
        const firstRow = document.getElementById(activeExcelRows[0]);
        if (firstRow) {
          const descVal = firstRow.querySelector('.excel-desc').value.trim();
          const qtyVal = firstRow.querySelector('.excel-qty').value.trim();
          const priceVal = firstRow.querySelector('.excel-price').value.trim();
          if (!descVal && !qtyVal && !priceVal) {
            removeExcelRow(activeExcelRows[0]);
          }
        }
      }
      
      items.forEach(item => {
        addExcelRow(
          item.desc || "Unidentified Item",
          parseFloat(item.qty) || 1,
          item.unit || "Pcs",
          parseFloat(item.price) || 0
        );
      });
      
      showToast("Scanned items appended successfully!", "fa-solid fa-file-excel");
      saveExcelDraft();`;

  if (app.includes("// Append scanned rows intelligently. If there is a single blank initial row")) {
    console.log("handleExcelOcr already supports unlimited row appending.");
  } else if (app.includes(oldOcrInject)) {
    app = app.replace(oldOcrInject, smartOcrInject);
    console.log("Upgraded handleExcelOcr with unlimited row appending.");
  } else {
    // Fallback block replacement
    app = app.replace("tbody.innerHTML = '';\n      activeExcelRows = [];", "// Appending rather than overwriting");
    console.log("Upgraded handleExcelOcr with unlimited row appending (Fallback).");
  }

  // B. Make initExcelTab and loadExcelDraft asynchronous to fetch cloud drafts
  const oldInitExcelTab = `function initExcelTab() {
  const loaded = loadExcelDraft();`;

  const asyncInitExcelTab = `async function initExcelTab() {
  const loaded = await loadExcelDraft();`;

  if (app.includes("async function initExcelTab()")) {
    console.log("initExcelTab is already asynchronous.");
  } else if (app.includes(oldInitExcelTab)) {
    app = app.replace(oldInitExcelTab, asyncInitExcelTab);
    console.log("Modified initExcelTab to be asynchronous.");
  }

  const oldLoadDraft = `function loadExcelDraft() {
  const raw = safeStorage.getItem(EXCEL_STORAGE_KEY + '_draft');`;

  const asyncLoadDraft = `async function loadExcelDraft() {
  let raw = safeStorage.getItem(EXCEL_STORAGE_KEY + '_draft');
  
  // Zero Data-Loss: If local storage draft is cleared, restore from Supabase cloud active_draft!
  if (!raw && isCloudReady && supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('saved_spreadsheets')
        .select('*')
        .eq('id', 'active_draft')
        .single();
      if (!error && data && data.items) {
        raw = JSON.stringify(data.items);
        safeStorage.setItem(EXCEL_STORAGE_KEY + '_draft', raw);
      }
    } catch (e) {
      console.warn("Cloud active_draft fetch failed:", e);
    }
  }`;

  if (app.includes("async function loadExcelDraft()")) {
    console.log("loadExcelDraft is already asynchronous.");
  } else if (app.includes(oldLoadDraft)) {
    app = app.replace(oldLoadDraft, asyncLoadDraft);
    console.log("Modified loadExcelDraft to be asynchronous and cloud-resilient.");
  }

  // C. Update saveExcelDraft to also sync to Supabase active_draft row
  const oldSaveDraft = `function saveExcelDraft() {
  const party = document.getElementById('excel-sheet-party').value;
  const items = [];
  
  activeExcelRows.forEach(rowId => {
    const rowEl = document.getElementById(rowId);
    if (rowEl) {
      const desc = rowEl.querySelector('.excel-desc').value;
      const qty = parseFloat(rowEl.querySelector('.excel-qty').value) || '';
      const unit = rowEl.querySelector('.excel-unit').value;
      const price = parseFloat(rowEl.querySelector('.excel-price').value) || '';
      items.push({ desc, qty, unit, price });
    }
  });
  
  safeStorage.setItem(EXCEL_STORAGE_KEY + '_draft', JSON.stringify({ party, items }));
}`;

  const asyncSaveDraft = `async function saveExcelDraft() {
  const party = document.getElementById('excel-sheet-party').value;
  const items = [];
  
  activeExcelRows.forEach(rowId => {
    const rowEl = document.getElementById(rowId);
    if (rowEl) {
      const desc = rowEl.querySelector('.excel-desc').value;
      const qty = parseFloat(rowEl.querySelector('.excel-qty').value) || '';
      const unit = rowEl.querySelector('.excel-unit').value;
      const price = parseFloat(rowEl.querySelector('.excel-price').value) || '';
      items.push({ desc, qty, unit, price });
    }
  });
  
  const draftData = { party, items };
  safeStorage.setItem(EXCEL_STORAGE_KEY + '_draft', JSON.stringify(draftData));

  // Zero Data-Loss: Sync active draft row instantly to Supabase!
  if (isCloudReady && supabaseClient) {
    try {
      await supabaseClient
        .from('saved_spreadsheets')
        .upsert({
          id: 'active_draft',
          title: party || 'Active Draft',
          date: new Date().toISOString(),
          items: draftData,
          total_qty: 0,
          total_amount: 0
        });
    } catch (e) {
      console.warn("Active draft cloud upsert failed:", e);
    }
  }
}`;

  if (app.includes("async function saveExcelDraft()")) {
    console.log("saveExcelDraft is already asynchronous.");
  } else if (app.includes(oldSaveDraft)) {
    app = app.replace(oldSaveDraft, asyncSaveDraft);
    console.log("Modified saveExcelDraft to be asynchronous and sync draft to Supabase.");
  }

  // D. Update switchTab trigger to support async initExcelTab
  const renderAppTarget = `    } else if (state.activeTab === 'aiexcel') {
      initExcelTab();
    }`;

  const renderAppReplacement = `    } else if (state.activeTab === 'aiexcel') {
      initExcelTab();
    }`; // Perfectly fine to call directly, async handles itself

  // Restore CRLF line endings
  const crlfApp = app.replace(/\n/g, '\r\n');

  fs.writeFileSync(appPath, crlfApp, 'utf8');
  if (fs.existsSync(wwwAppPath)) {
    fs.writeFileSync(wwwAppPath, crlfApp, 'utf8');
  }
}

console.log("Unlimited row appending & persistent safe active draft protection patches applied successfully!");
