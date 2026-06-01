const fs = require('fs');
const path = require('path');

const filesToPatch = [
  path.join(__dirname, '..', 'app.js'),
  path.join(__dirname, '..', 'www', 'app.js')
];

filesToPatch.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  console.log(`Patching ${filePath}...`);

  // Normalize all line endings to Unix style LF first
  content = content.replace(/\r\n/g, '\n');

  // 1. Patch loadLocalData to load state.spreadsheets
  const loadLocalTarget = `  const rawRent = safeStorage.getItem(STORAGE_KEY + '_rent');
  if (rawRent) {
    try {
      state.rent_payments = JSON.parse(rawRent);
    } catch (err) {
      state.rent_payments = [];
    }
  } else {
    state.rent_payments = [];
  }
}`;

  const loadLocalReplacement = `  const rawRent = safeStorage.getItem(STORAGE_KEY + '_rent');
  if (rawRent) {
    try {
      state.rent_payments = JSON.parse(rawRent);
    } catch (err) {
      state.rent_payments = [];
    }
  } else {
    state.rent_payments = [];
  }

  const rawSpread = safeStorage.getItem('samad_sons_spreadsheets');
  if (rawSpread) {
    try {
      state.spreadsheets = JSON.parse(rawSpread);
    } catch (err) {
      state.spreadsheets = [];
    }
  } else {
    state.spreadsheets = [];
  }
}`;

  if (content.includes(loadLocalTarget)) {
    content = content.replace(loadLocalTarget, loadLocalReplacement);
    console.log('  -> loadLocalData patched successfully.');
  } else {
    console.warn('  -> WARNING: loadLocalData target NOT found.');
  }

  // 2. Patch switchTab and renderApp
  const switchTabTarget = `function switchTab(tabId) {
  state.activeTab = tabId;

  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(\`tab-\${tabId}\`).classList.add('active');

  document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));
  document.getElementById(\`view-\${tabId}\`).classList.add('active');

  renderApp();
}

function renderApp() {
  if (state.activeTab === 'ledger') {
    renderLedger();
  } else if (state.activeTab === 'dashboard') {
    renderDashboard();
  } else if (state.activeTab === 'customers') {
    renderCustomerAccounts();
  } else if (state.activeTab === 'estimates') {
      renderEstimates();
    } else if (state.activeTab === 'aivoice') {
      initVoiceStudio();
    } else if (state.activeTab === 'rent') {
      renderRentTab();
    }
}`;

  const switchTabReplacement = `function switchTab(tabId) {
  state.activeTab = tabId;

  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(\`tab-\${tabId}\`).classList.add('active');

  document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));
  document.getElementById(\`view-\${tabId}\`).classList.add('active');

  if (tabId === 'aiexcel') {
    initExcelTab();
  } else {
    renderApp();
  }
}

function renderApp() {
  if (state.activeTab === 'ledger') {
    renderLedger();
  } else if (state.activeTab === 'dashboard') {
    renderDashboard();
  } else if (state.activeTab === 'customers') {
    renderCustomerAccounts();
  } else if (state.activeTab === 'estimates') {
      renderEstimates();
    } else if (state.activeTab === 'aivoice') {
      initVoiceStudio();
    } else if (state.activeTab === 'rent') {
      renderRentTab();
    } else if (state.activeTab === 'aiexcel') {
      renderSavedExcelSheets();
    }
}`;

  if (content.includes(switchTabTarget)) {
    content = content.replace(switchTabTarget, switchTabReplacement);
    console.log('  -> switchTab & renderApp patched successfully.');
  } else {
    console.warn('  -> WARNING: switchTab & renderApp target NOT found.');
  }

  // 3. Patch saveExcelDraft
  const saveExcelDraftTarget = `async function saveExcelDraft() {
  updateExcelSyncStatus('saving');
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
      const { error } = await supabaseClient
        .from('saved_spreadsheets')
        .upsert({
          id: '00000000-0000-0000-0000-000000000000',
          title: party || 'Active Draft',
          date: new Date().toISOString(),
          items: draftData,
          total_qty: 0,
          total_amount: 0
        });
      if (error) throw error;
      updateExcelSyncStatus('draft_synced');
    } catch (e) {
      console.warn("Active draft cloud upsert failed:", e);
      updateExcelSyncStatus('draft_offline');
    }
  } else {
    updateExcelSyncStatus('draft_offline');
  }
}`;

  const saveExcelDraftReplacement = `let excelDraftSyncTimeout = null;

function saveExcelDraft() {
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

  updateExcelSyncStatus('saving');

  // Debounce the cloud sync to avoid network congestion and UI thread block
  if (excelDraftSyncTimeout) {
    clearTimeout(excelDraftSyncTimeout);
  }
  
  excelDraftSyncTimeout = setTimeout(() => {
    if (isCloudReady && supabaseClient) {
      supabaseClient
        .from('saved_spreadsheets')
        .upsert({
          id: '00000000-0000-0000-0000-000000000000',
          title: party || 'Active Draft',
          date: new Date().toISOString(),
          items: draftData,
          total_qty: 0,
          total_amount: 0
        })
        .then(({ error }) => {
          if (error) {
            console.warn("Active draft cloud upsert failed:", error);
            updateExcelSyncStatus('draft_offline');
          } else {
            updateExcelSyncStatus('draft_synced');
          }
        })
        .catch(err => {
          console.warn("Active draft cloud upsert failed:", err);
          updateExcelSyncStatus('draft_offline');
        });
    } else {
      updateExcelSyncStatus('draft_offline');
    }
  }, 1000); // 1 second debounce
}`;

  if (content.includes(saveExcelDraftTarget)) {
    content = content.replace(saveExcelDraftTarget, saveExcelDraftReplacement);
    console.log('  -> saveExcelDraft patched successfully.');
  } else {
    console.warn('  -> WARNING: saveExcelDraft target NOT found.');
  }

  // 4. Patch saveExcelSheet
  const saveExcelSheetTarget = `async function saveExcelSheet() {
  updateExcelSyncStatus('saving');
  const title = document.getElementById('excel-sheet-party').value.trim() || 'Untitled Sheet';
  const items = [];
  let totalQty = 0;
  let totalAmount = 0;
  
  activeExcelRows.forEach(rowId => {
    const rowEl = document.getElementById(rowId);
    if (rowEl) {
      const desc = rowEl.querySelector('.excel-desc').value.trim();
      const qty = parseFloat(rowEl.querySelector('.excel-qty').value) || 0;
      const unit = rowEl.querySelector('.excel-unit').value;
      const price = parseFloat(rowEl.querySelector('.excel-price').value) || 0;
      const amt = qty * price;
      
      if (desc) {
        items.push({ desc, qty, unit, price, amt });
        totalQty += qty;
        totalAmount += amt;
      }
    }
  });
  
  if (items.length === 0) {
    alert("Please add at least one item description.");
    updateExcelSyncStatus('draft_offline');
    return;
  }
  
  const sheet = {
    id: generateUUID(),
    title,
    date: new Date().toISOString(),
    items,
    total_qty: totalQty,
    total_amount: totalAmount
  };
  
  if (!state.spreadsheets) state.spreadsheets = [];
  state.spreadsheets.push(sheet);
  
  // Save locally
  safeStorage.setItem(EXCEL_STORAGE_KEY, JSON.stringify(state.spreadsheets));
  safeStorage.removeItem(EXCEL_STORAGE_KEY + '_draft');
  
  showToast("Excel Sheet saved locally!", "fa-solid fa-file-circle-check");
  updateExcelSyncStatus('sheet_saved_offline');
  renderSavedExcelSheets();
  
  // Sync to Supabase
  if (isCloudReady && supabaseClient) {
    try {
      const { error } = await supabaseClient
        .from('saved_spreadsheets')
        .upsert(sheet);
      if (error) throw error;
      showToast("Sheet synced to cloud backup successfully!", "fa-solid fa-cloud");
      updateExcelSyncStatus('sheet_saved_synced');
    } catch (err) {
      console.error("Supabase Excel sync failed:", err);
      showToast("Offline Mode: Saved locally, cloud sync pending.", "fa-solid fa-wifi-slash");
      updateExcelSyncStatus('sheet_saved_offline');
    }
  } else {
    updateExcelSyncStatus('sheet_saved_offline');
  }
}`;

  const saveExcelSheetReplacement = `function saveExcelSheet() {
  updateExcelSyncStatus('saving');
  const title = document.getElementById('excel-sheet-party').value.trim() || 'Untitled Sheet';
  const items = [];
  let totalQty = 0;
  let totalAmount = 0;
  
  activeExcelRows.forEach(rowId => {
    const rowEl = document.getElementById(rowId);
    if (rowEl) {
      const desc = rowEl.querySelector('.excel-desc').value.trim();
      const qty = parseFloat(rowEl.querySelector('.excel-qty').value) || 0;
      const unit = rowEl.querySelector('.excel-unit').value;
      const price = parseFloat(rowEl.querySelector('.excel-price').value) || 0;
      const amt = qty * price;
      
      if (desc) {
        items.push({ desc, qty, unit, price, amt });
        totalQty += qty;
        totalAmount += amt;
      }
    }
  });
  
  if (items.length === 0) {
    alert("Please add at least one item description.");
    updateExcelSyncStatus('draft_offline');
    return;
  }
  
  const sheet = {
    id: generateUUID(),
    title,
    date: new Date().toISOString(),
    items,
    total_qty: totalQty,
    total_amount: totalAmount
  };
  
  if (!state.spreadsheets) state.spreadsheets = [];
  state.spreadsheets.push(sheet);
  
  // Save locally
  safeStorage.setItem(EXCEL_STORAGE_KEY, JSON.stringify(state.spreadsheets));
  safeStorage.removeItem(EXCEL_STORAGE_KEY + '_draft');
  
  showToast("Excel Sheet saved locally!", "fa-solid fa-file-circle-check");
  updateExcelSyncStatus('sheet_saved_offline');
  renderSavedExcelSheets();
  
  // Sync to Supabase in background
  if (isCloudReady && supabaseClient) {
    supabaseClient
      .from('saved_spreadsheets')
      .upsert(sheet)
      .then(({ error }) => {
        if (error) {
          console.error("Supabase Excel sync failed:", error);
          showToast("Offline Mode: Saved locally, cloud sync pending.", "fa-solid fa-wifi-slash");
          updateExcelSyncStatus('sheet_saved_offline');
        } else {
          showToast("Sheet synced to cloud backup successfully!", "fa-solid fa-cloud");
          updateExcelSyncStatus('sheet_saved_synced');
        }
      })
      .catch(err => {
        console.error("Supabase Excel sync failed:", err);
        showToast("Offline Mode: Saved locally, cloud sync pending.", "fa-solid fa-wifi-slash");
        updateExcelSyncStatus('sheet_saved_offline');
      });
  } else {
    updateExcelSyncStatus('sheet_saved_offline');
  }
}`;

  if (content.includes(saveExcelSheetTarget)) {
    content = content.replace(saveExcelSheetTarget, saveExcelSheetReplacement);
    console.log('  -> saveExcelSheet patched successfully.');
  } else {
    console.warn('  -> WARNING: saveExcelSheet target NOT found.');
  }

  // Save the modified file back as LF (which is standard and works perfectly on all environments)
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Finished patching ${filePath}\n`);
});

console.log("Patching complete!");
