// ==========================================================================
// DYNAMIC AI EXCEL SPREADSHEET ENGINE
// ==========================================================================

let activeExcelRows = []; // Array of active row IDs
const EXCEL_STORAGE_KEY = 'samad_sons_spreadsheets';

function initExcelTab() {
  const loaded = loadExcelDraft();
  if (!loaded) {
    document.getElementById('excel-sheet-party').value = '';
    document.getElementById('excel-grid-tbody').innerHTML = '';
    activeExcelRows = [];
    addExcelRow(); 
    updateExcelTotals();
  }
  renderSavedExcelSheets();
}

function addExcelRow(desc='', qty='', unit='Pcs', price='') {
  const rowId = 'excel-row-' + Date.now() + Math.random();
  activeExcelRows.push(rowId);
  
  const tbody = document.getElementById('excel-grid-tbody');
  
  // Standard units options
  const units = ["Pcs", "Kgs", "Bag", "Pkt's", "ROLL", "Tin's", "Drm", "Jar", "Dozen", "Case", "Mtr"];
  let selectOptions = '';
  units.forEach(u => {
    selectOptions += `<option value="${u}" ${unit === u ? 'selected' : ''}>${u}</option>`;
  });

  const rowHtml = `
    <tr id="${rowId}" style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;">
      <td class="excel-sn" style="padding: 8px; text-align: center; font-weight: bold; color: #718096; background: #f7fafc;">${activeExcelRows.length}</td>
      <td style="padding: 6px;">
        <input type="text" class="excel-desc" value="${desc}" placeholder="Enter item name..." style="width: 100%; border: none; padding: 6px; outline: none; font-size: 0.9rem;" oninput="saveExcelDraft()">
      </td>
      <td style="padding: 6px;">
        <input type="number" class="excel-qty" value="${qty}" placeholder="0" style="width: 100%; border: none; padding: 6px; outline: none; font-size: 0.9rem; font-weight: bold; text-align: center;" oninput="calcExcelRow('${rowId}')">
      </td>
      <td style="padding: 6px;">
        <select class="excel-unit" onchange="saveExcelDraft()" style="width: 100%; border: none; padding: 6px; outline: none; background: transparent; font-size: 0.9rem;">
          ${selectOptions}
        </select>
      </td>
      <td style="padding: 6px;">
        <input type="number" class="excel-price" value="${price}" placeholder="0.00" style="width: 100%; border: none; padding: 6px; outline: none; font-size: 0.9rem; font-weight: bold; text-align: right;" oninput="calcExcelRow('${rowId}')">
      </td>
      <td style="padding: 8px; font-weight: bold; text-align: right; color: #2d3748; background: #fafafa;">
        ₹<span class="excel-amt">0.00</span>
      </td>
      <td style="padding: 6px; text-align: center;">
        <button onclick="removeExcelRow('${rowId}')" style="background: none; border: none; color: #e53e3e; cursor: pointer; padding: 4px;"><i class="fa-solid fa-trash-can"></i></button>
      </td>
    </tr>
  `;
  
  tbody.insertAdjacentHTML('beforeend', rowHtml);
  if (qty && price) {
    calcExcelRow(rowId);
  } else {
    updateExcelTotals();
  }
}

function removeExcelRow(rowId) {
  const rowEl = document.getElementById(rowId);
  if (rowEl) rowEl.remove();
  activeExcelRows = activeExcelRows.filter(id => id !== rowId);
  reindexExcelSn();
  updateExcelTotals();
  saveExcelDraft();
}

function reindexExcelSn() {
  const snCells = document.querySelectorAll('#excel-grid-tbody .excel-sn');
  snCells.forEach((cell, idx) => {
    cell.textContent = idx + 1;
  });
}

function calcExcelRow(rowId) {
  const rowEl = document.getElementById(rowId);
  if (!rowEl) return;
  
  const qty = parseFloat(rowEl.querySelector('.excel-qty').value) || 0;
  const price = parseFloat(rowEl.querySelector('.excel-price').value) || 0;
  const amount = qty * price;
  
  rowEl.querySelector('.excel-amt').textContent = amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  updateExcelTotals();
  saveExcelDraft();
}

function updateExcelTotals() {
  let totalQty = 0;
  let totalAmount = 0;
  
  activeExcelRows.forEach(rowId => {
    const rowEl = document.getElementById(rowId);
    if (rowEl) {
      const qty = parseFloat(rowEl.querySelector('.excel-qty').value) || 0;
      const price = parseFloat(rowEl.querySelector('.excel-price').value) || 0;
      totalQty += qty;
      totalAmount += (qty * price);
    }
  });
  
  document.getElementById('excel-total-qty').textContent = totalQty;
  document.getElementById('excel-total-amount').textContent = '₹' + totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

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
  
  safeStorage.setItem(EXCEL_STORAGE_KEY + '_draft', JSON.stringify({ party, items }));
}

function loadExcelDraft() {
  const raw = safeStorage.getItem(EXCEL_STORAGE_KEY + '_draft');
  if (!raw) return false;
  
  try {
    const draft = JSON.parse(raw);
    document.getElementById('excel-sheet-party').value = draft.party || '';
    
    const tbody = document.getElementById('excel-grid-tbody');
    tbody.innerHTML = '';
    activeExcelRows = [];
    
    if (draft.items && draft.items.length > 0) {
      draft.items.forEach(item => {
        addExcelRow(item.desc, item.qty, item.unit, item.price);
      });
    } else {
      addExcelRow();
    }
    return true;
  } catch (err) {
    return false;
  }
}

function clearExcelGrid() {
  if (confirm("Kya aap active Excel grid ko clear karna chahte hain?")) {
    document.getElementById('excel-sheet-party').value = '';
    document.getElementById('excel-grid-tbody').innerHTML = '';
    activeExcelRows = [];
    safeStorage.removeItem(EXCEL_STORAGE_KEY + '_draft');
    addExcelRow();
    updateExcelTotals();
    showToast("Grid cleared successfully!", "fa-solid fa-trash-can");
  }
}

async function saveExcelSheet() {
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
  renderSavedExcelSheets();
  
  // Sync to Supabase
  if (isCloudReady && supabaseClient) {
    try {
      const { error } = await supabaseClient
        .from('saved_spreadsheets')
        .insert([sheet]);
      if (error) throw error;
      showToast("Sheet synced to cloud backup successfully!", "fa-solid fa-cloud");
    } catch (err) {
      console.error("Supabase Excel sync failed:", err);
      showToast("Offline Mode: Saved locally, cloud sync pending.", "fa-solid fa-wifi-slash");
    }
  }
}

function renderSavedExcelSheets() {
  const container = document.getElementById('excel-saved-list');
  if (!container) return;
  
  container.innerHTML = '';
  const searchInput = document.getElementById('excel-search-input');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  
  if (!state.spreadsheets) state.spreadsheets = [];
  
  let list = state.spreadsheets;
  if (query) {
    list = list.filter(s => s.title.toLowerCase().includes(query) || s.items.some(i => i.desc.toLowerCase().includes(query)));
  }
  
  list.sort((a,b) => new Date(b.date) - new Date(a.date));
  
  if (list.length === 0) {
    container.innerHTML = `<div style="text-align:center; color:#a0aec0; padding:15px; font-size:0.85rem;"><i class="fa-solid fa-box-open" style="font-size:1.5rem; display:block; margin-bottom:5px;"></i> No saved sheets found.</div>`;
    return;
  }
  
  list.forEach(sheet => {
    const dt = new Date(sheet.date);
    const dateStr = dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const div = document.createElement('div');
    div.style.cssText = "display:flex; justify-content:space-between; align-items:center; border:1px solid #edf2f7; padding:10px; border-radius:8px; background:#fafafa;";
    
    div.innerHTML = `
      <div onclick="loadSavedExcelSheet('${sheet.id}')" style="flex:1; cursor:pointer;">
        <strong style="color:#2d3748; font-size:0.95rem; display:block;">${escapeHTML(sheet.title)}</strong>
        <span style="font-size:0.75rem; color:#718096;"><i class="fa-regular fa-calendar"></i> ${dateStr} | ${sheet.items.length} items</span>
      </div>
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-weight:bold; color:#107c41; font-size:0.95rem;">₹${sheet.total_amount.toLocaleString('en-IN', {maximumFractionDigits:2})}</span>
        <button onclick="deleteExcelSheet('${sheet.id}')" style="background:none; border:none; color:#e53e3e; cursor:pointer; padding:5px;"><i class="fa-solid fa-trash-can"></i></button>
      </div>
    `;
    container.appendChild(div);
  });
}

function loadSavedExcelSheet(sheetId) {
  const sheet = state.spreadsheets.find(s => s.id === sheetId);
  if (!sheet) return;
  
  document.getElementById('excel-sheet-party').value = sheet.title;
  
  const tbody = document.getElementById('excel-grid-tbody');
  tbody.innerHTML = '';
  activeExcelRows = [];
  
  sheet.items.forEach(item => {
    addExcelRow(item.desc, item.qty, item.unit, item.price);
  });
  
  showToast(`Loaded sheet: ${sheet.title}`, "fa-solid fa-folder-open");
}

async function deleteExcelSheet(sheetId) {
  if (!confirm("Are you sure you want to delete this sheet completely?")) return;
  
  state.spreadsheets = state.spreadsheets.filter(s => s.id !== sheetId);
  safeStorage.setItem(EXCEL_STORAGE_KEY, JSON.stringify(state.spreadsheets));
  renderSavedExcelSheets();
  showToast("Excel Sheet deleted locally.", "fa-solid fa-trash-can");
  
  if (isCloudReady && supabaseClient) {
    try {
      const { error } = await supabaseClient
        .from('saved_spreadsheets')
        .delete()
        .eq('id', sheetId);
      if (error) throw error;
      showToast("Sheet deleted from cloud backup.", "fa-solid fa-trash-can");
    } catch (err) {
      console.error("Cloud Excel deletion failed:", err);
    }
  }
}

async function shareExcelSheet() {
  const title = document.getElementById('excel-sheet-party').value.trim() || 'Untitled Sheet';
  let shareText = `*SAMAD & SONS HARDWARE STORE*\n`;
  shareText += `*Spreadsheet:* ${title}\n`;
  shareText += `*Date:* ${new Date().toLocaleDateString()}\n\n`;
  shareText += `SN | Description | Qty | Unit | Price | Amount\n`;
  shareText += `-----------------------------------------------\n`;
  
  let sn = 1;
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
        shareText += `${sn}. | ${desc} | ${qty} | ${unit} | ₹${price} | ₹${amt.toFixed(2)}\n`;
        totalAmount += amt;
        sn++;
      }
    }
  });
  
  shareText += `-----------------------------------------------\n`;
  shareText += `*Total Amount:* ₹${totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: title,
        text: shareText
      });
      showToast("Spreadsheet shared successfully!", "fa-solid fa-share");
    } catch (err) {
      copyToClipboard(shareText);
    }
  } else {
    copyToClipboard(shareText);
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert("📋 WhatsApp Format Copied!\nExcel Sheet text formatted has been copied to your clipboard. You can paste and send it directly on WhatsApp.");
  }).catch(() => {
    alert("Failed to copy to clipboard.");
  });
}

// ----------------------------------------------------
// AI OCR SCANNER FOR EXCEL GRID (Gemini 2.5/2.0/1.5 Fallback Chain)
// ----------------------------------------------------
async function handleExcelOcr(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const geminiKey = safeStorage.getItem('gemini_api_key');
  const openaiKey = safeStorage.getItem('openai_api_key');
  
  if (!geminiKey && !openaiKey) {
    // Seeding with same 21 items for Demo Mode
    showToast("Opening Demo Excel Scanner...", "fa-solid fa-wand-magic-sparkles");
    setTimeout(() => {
      alert("💡 DEMO MODE SIMULATION:\nWe are simulating a highly intelligent spreadsheet scan.\nTo scan real bills into Excel 100% FREE, save your Gemini API Key in the AI Studio Settings!");
      
      document.getElementById('excel-sheet-party').value = "Ghulam Rasool Bhat (Bill Sync)";
      const tbody = document.getElementById('excel-grid-tbody');
      tbody.innerHTML = '';
      activeExcelRows = [];
      
      const demoItems = [
        { desc: "FIBER GLASS 2-1/2\"", qty: 37.40, unit: "Kgs", price: 163.00 },
        { desc: "NAILS 4\" X 8 10 PKT/ CASE SPARK", qty: 3.00, unit: "Case", price: 1710.00 },
        { desc: "NAILS 3\" X 12 10 PKT/ CASE SPARK", qty: 3.00, unit: "Case", price: 1740.00 },
        { desc: "NAILS 2\" X 14 10 PKT/CASE SPARK", qty: 1.00, unit: "Case", price: 1770.00 },
        { desc: "NAILS 3\" X 8 10 PKT/ CASE SPARK", qty: 1.00, unit: "Case", price: 1710.00 },
        { desc: "NAILS 5\" X 6 10 PKT/ CASE SPARK", qty: 2.00, unit: "Case", price: 1710.00 },
        { desc: "NAILS 6\" X 6 10 PKT/ CASE SPARK", qty: 1.00, unit: "Case", price: 1710.00 },
        { desc: "CANCREAT NAILS 2\" (950 GRM/PKT) P GOLD", qty: 4.00, unit: "Pkt's", price: 128.00 },
        { desc: "CANCREAT NAILS 3\" (950 GRM/PKT) P GOLD", qty: 4.00, unit: "Pkt's", price: 128.00 },
        { desc: "CANCREAT NAILS 2-1/2\" (950 GRM/PKT)", qty: 4.00, unit: "Pkt's", price: 128.00 },
        { desc: "CANCREAT NAILS 5\" (950 GRM/PKT) P GOLD", qty: 4.00, unit: "Pkt's", price: 128.00 },
        { desc: "CANCREAT NAILS 6\" (950 GRM/PKT) P GOLD", qty: 1.00, unit: "Pkt's", price: 128.00 },
        { desc: "REGMAL VELCRO PAPER 60 NO", qty: 100.00, unit: "Pcs", price: 2.70 },
        { desc: "NSE BUS GREEN 500 ML", qty: 8.00, unit: "Tin's", price: 118.90 },
        { desc: "SHOE NAILS", qty: 2.00, unit: "Pkt's", price: 280.00 },
        { desc: "HATRIC GLASS CLEANER", qty: 4.00, unit: "Pcs", price: 68.00 },
        { desc: "NAILS 1-1/2\" 17 NO HEAD LESS", qty: 2.00, unit: "Pkt's", price: 205.00 },
        { desc: "NAILS 3/4\" X 17 NO HEAD LESS", qty: 2.00, unit: "Pkt's", price: 205.00 },
        { desc: "FEVICOL SH 250 GM", qty: 10.00, unit: "Pcs", price: 75.00 },
        { desc: "BAINDING WIRE SPARK", qty: 25.00, unit: "Kgs", price: 73.00 },
        { desc: "PIPE SS 1\" X 15' CURTAIN EX HY", qty: 25.00, unit: "Pcs", price: 288.00 }
      ];
      
      demoItems.forEach(item => {
        addExcelRow(item.desc, item.qty, item.unit, item.price);
      });
      showToast("Demo spreadsheet generated perfectly!", "fa-solid fa-file-excel");
      saveExcelDraft();
    }, 1500);
    return;
  }
  
  showToast("Analyzing Spreadsheet with Vision AI...", "fa-solid fa-spinner fa-spin");
  
  try {
    const base64Img = await compressAndResizeImage(file);
    let items = [];
    
    if (geminiKey) {
      const base64Clean = base64Img.split(',')[1];
      const mimeType = base64Img.split(';')[0].split(':')[1];
      
      let parsedItems = null;
      let lastError = null;
      
      const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
      
      for (const model of models) {
        try {
          console.log("Excel OCR: Trying model", model);
          const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [{
                parts: [
                  {
                    text: "Analyze this image of a handwritten or printed list, bill, invoice, or slip of hardware/construction materials.\nYour task is to act like a professional accountant and perform a highly accurate extraction of all line items.\n\nFor each item in the table/list, extract:\n1. \"desc\": The exact and complete name/description of the item (e.g., \"FIBER GLASS 2-1/2\\\"\", \"NAILS 4\\\" X 8 10 PKT/ CASE SPARK\"). Do not truncate or omit sizes/details.\n2. \"qty\": The numerical quantity (e.g., 37.40, 3.00, 100.00). Parse this as a clean number (remove any commas or non-numeric characters except decimal points).\n3. \"unit\": The unit of measurement (standardized to match one of: Pcs, Kgs, Bag, Pkt's, ROLL, Tin's, Drm, Jar, Dozen, Case, Mtr).\n4. \"price\": The exact unit price (e.g., 163.00, 1710.00, 2.70). Parse this as a clean number.\n\nRules:\n- Capture EVERY SINGLE line item listed on the paper. Do not skip any item.\n- Ensure 100% accuracy of quantities and prices. Double check that they match the original image exactly.\n- Do not include totals, taxes, headers, or signature lines as items. Only extract individual goods/services.\n- Format the response as a raw JSON array of objects with keys: \"desc\", \"qty\", \"unit\", \"price\". Do not wrap the JSON in markdown blocks or add any other text. Return ONLY the valid JSON array."
                  },
                  {
                    inlineData: {
                      mimeType: mimeType || "image/jpeg",
                      data: base64Clean
                    }
                  }
                ]
              }]
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            const textResult = data.candidates[0].content.parts[0].text.trim();
            console.log(`Success with model ${model}. Raw Result:`, textResult);
            
            let cleanJson = textResult.trim();
            if (cleanJson.startsWith('```')) {
              cleanJson = cleanJson.replace(/^\`\`\`(json)?/i, '').replace(/\`\`\`$/, '').trim();
            }
            const jsonStart = cleanJson.indexOf('[');
            const jsonEnd = cleanJson.lastIndexOf(']');
            if (jsonStart !== -1 && jsonEnd !== -1) {
              cleanJson = cleanJson.substring(jsonStart, jsonEnd + 1);
            }
            
            parsedItems = JSON.parse(cleanJson);
            break;
          } else {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData.error?.message || `HTTP ${response.status}`;
            console.warn(`Model ${model} failed: ${errMsg}`);
            lastError = new Error(errMsg);
          }
        } catch (err) {
          console.warn(`Error trying model ${model}:`, err);
          lastError = err;
        }
      }
      
      if (!parsedItems) {
        throw lastError || new Error("Failed all Gemini models in the dynamic fallback list.");
      }
      items = parsedItems;
      
    } else {
      // Fallback to OpenAI Vision API if only OpenAI is configured
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this image of a handwritten or printed list, bill, invoice, or slip of hardware/construction materials.\nYour task is to act like a professional accountant and perform a highly accurate extraction of all line items.\n\nFor each item in the table/list, extract:\n1. \"desc\": The exact and complete name/description of the item (e.g., \"FIBER GLASS 2-1/2\\\"\", \"NAILS 4\\\" X 8 10 PKT/ CASE SPARK\"). Do not truncate or omit sizes/details.\n2. \"qty\": The numerical quantity (e.g., 37.40, 3.00, 100.00). Parse this as a clean number (remove any commas or non-numeric characters except decimal points).\n3. \"unit\": The unit of measurement (standardized to match one of: Pcs, Kgs, Bag, Pkt's, ROLL, Tin's, Drm, Jar, Dozen, Case, Mtr).\n4. \"price\": The exact unit price (e.g., 163.00, 1710.00, 2.70). Parse this as a clean number.\n\nRules:\n- Capture EVERY SINGLE line item listed on the paper. Do not skip any item.\n- Ensure 100% accuracy of quantities and prices. Double check that they match the original image exactly.\n- Do not include totals, taxes, headers, or signature lines as items. Only extract individual goods/services.\n- Format the response as a raw JSON array of objects with keys: \"desc\", \"qty\", \"unit\", \"price\". Do not wrap the JSON in markdown blocks or add any other text. Return ONLY the valid JSON array."
                },
                {
                  type: "image_url",
                  image_url: {
                    "url": base64Img
                  }
                }
              ]
            }
          ],
          max_tokens: 1500
        })
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || "Failed to call OpenAI API");
      }
      
      const data = await response.json();
      const textResult = data.choices[0].message.content.trim();
      console.log("OpenAI Vision Raw Result:", textResult);
      
      const cleanJson = textResult.replace(/^\s*\`\`\`json\s*/i, '').replace(/\`\`\`$/, '').trim();
      items = JSON.parse(cleanJson);
    }
    
    if (Array.isArray(items)) {
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
      saveExcelDraft();
    } else {
      throw new Error("Invalid output format from AI.");
    }
    
  } catch (err) {
    console.error("Excel OCR Error:", err);
    alert("AI Excel Scanner failed: " + err.message + "\nEnsure you have internet and a valid API key.");
  }
}
