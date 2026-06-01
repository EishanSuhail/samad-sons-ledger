const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'app.js');
const wwwAppPath = path.join(__dirname, '..', 'www', 'app.js');
const htmlPath = path.join(__dirname, '..', 'index.html');
const wwwHtmlPath = path.join(__dirname, '..', 'www', 'index.html');

console.log("Starting Super-Smart AI OCR Patcher...");

// 1. Update index.html to add Grid Search Input
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  
  const searchSectionTarget = `          <!-- Sheet Info Inputs -->
          <div style="display:flex; gap:12px; margin-bottom:15px; flex-wrap:wrap;">
            <div style="flex:2; min-width:200px;">
              <label style="display:block; font-size:0.75rem; font-weight:600; color:#4a5568; margin-bottom:4px;">Customer / Party / Bill Name</label>
              <input type="text" id="excel-sheet-party" placeholder="e.g. Shabir Ahmad Ledger Bill" oninput="saveExcelDraft()" style="width: 100%; border: 1px solid #cbd5e0; padding: 10px; border-radius: 6px; font-size: 0.9rem; font-family:'Outfit',sans-serif; color:#2d3748; background:#fff; outline:none; transition: border-color 0.2s;">
            </div>
            <div style="flex:1; min-width:120px; display:flex; align-items:flex-end; gap:8px;">
              <button onclick="clearExcelGrid()" style="flex:1; background:#fff; border:1px solid #cbd5e0; color:#e53e3e; padding:10px; border-radius:6px; font-weight:bold; font-size:0.85rem; height:41px; cursor:pointer;" title="Clear Active Grid"><i class="fa-solid fa-trash-can"></i> Clear</button>
            </div>
          </div>`;

  const searchSectionReplacement = `          <!-- Sheet Info Inputs -->
          <div style="display:flex; gap:12px; margin-bottom:15px; flex-wrap:wrap;">
            <div style="flex:2; min-width:200px;">
              <label style="display:block; font-size:0.75rem; font-weight:600; color:#4a5568; margin-bottom:4px;">Customer / Party / Bill Name</label>
              <input type="text" id="excel-sheet-party" placeholder="e.g. Shabir Ahmad Ledger Bill" oninput="saveExcelDraft()" style="width: 100%; border: 1px solid #cbd5e0; padding: 10px; border-radius: 6px; font-size: 0.9rem; font-family:'Outfit',sans-serif; color:#2d3748; background:#fff; outline:none; transition: border-color 0.2s;">
            </div>
            <div style="flex:1; min-width:150px;">
              <label style="display:block; font-size:0.75rem; font-weight:600; color:#4a5568; margin-bottom:4px;">Filter Grid Items</label>
              <input type="text" id="excel-grid-search" placeholder="Type to search rows..." oninput="filterActiveExcelGrid()" style="width: 100%; border: 1px solid #cbd5e0; padding: 10px; border-radius: 6px; font-size: 0.9rem; font-family:'Outfit',sans-serif; color:#2d3748; background:#fff; outline:none;">
            </div>
            <div style="display:flex; align-items:flex-end; gap:8px;">
              <button onclick="clearExcelGrid()" style="background:#fff; border:1px solid #cbd5e0; color:#e53e3e; padding:10px 14px; border-radius:6px; font-weight:bold; font-size:0.85rem; height:41px; cursor:pointer;" title="Clear Active Grid"><i class="fa-solid fa-trash-can"></i> Clear</button>
            </div>
          </div>`;

  if (html.includes('id="excel-grid-search"')) {
    console.log("excel-grid-search input already exists in index.html.");
  } else if (html.includes(searchSectionTarget)) {
    html = html.replace(searchSectionTarget, searchSectionReplacement);
    console.log("Injected active grid search filter into index.html.");
  } else {
    // Fallback replacement
    html = html.replace('id="excel-sheet-party"', 'id="excel-sheet-party"');
    console.warn("Could not find exact sheet inputs template match, check manual changes.");
  }
  
  fs.writeFileSync(htmlPath, html, 'utf8');
  if (fs.existsSync(wwwHtmlPath)) {
    fs.writeFileSync(wwwHtmlPath, html, 'utf8');
  }
}

// 2. Update app.js (and copy to www/app.js)
if (fs.existsSync(appPath)) {
  let app = fs.readFileSync(appPath, 'utf8');
  
  // A. Replace the Vision OCR Prompts with highly sophisticated human-auditor directions
  const oldPrompt = `"Analyze this image of a handwritten or printed list, bill, invoice, or slip of hardware/construction materials.\\nYour task is to act like a professional accountant and perform a highly accurate extraction of all line items.\\n\\nFor each item in the table/list, extract:\\n1. \\"desc\\": The exact and complete name/description of the item (e.g., \\"FIBER GLASS 2-1/2\\\\\\"\\", \\"NAILS 4\\\\\\" X 8 10 PKT/ CASE SPARK\\"). Do not truncate or omit sizes/details.\\n2. \\"qty\\": The numerical quantity (e.g., 37.40, 3.00, 100.00). Parse this as a clean number (remove any commas or non-numeric characters except decimal points).\\n3. \\"unit\\": The unit of measurement (standardized to match one of: Pcs, Kgs, Bag, Pkt's, ROLL, Tin's, Drm, Jar, Dozen, Case, Mtr).\\n4. \\"price\\": The exact unit price (e.g., 163.00, 1710.00, 2.70). Parse this as a clean number.\\n\\nRules:\\n- Capture EVERY SINGLE line item listed on the paper. Do not skip any item.\\n- Ensure 100% accuracy of quantities and prices. Double check that they match the original image exactly.\\n- Do not include totals, taxes, headers, or signature lines as items. Only extract individual goods/services.\\n- Format the response as a raw JSON array of objects with keys: \\"desc\\", \\"qty\\", \\"unit\\", \\"price\\". Do not wrap the JSON in markdown blocks or add any other text. Return ONLY the valid JSON array."`;
  
  const superSmartPrompt = `"Analyze this image of a handwritten or printed list, bill, invoice, or slip of hardware, sanitary, or construction materials.\\nYour task is to act like an extremely intelligent, professional human auditor and perform a 100% correct, zero-mistakes tabular extraction of all line items.\\n\\nRules for Unrivaled Accuracy & Quality:\\n1. \\"desc\\" (Complete Descriptions): Extract the EXACT and COMPLETE description/name of the item. Never truncate, omit, or half-write sizes, dimensions, or details (e.g. write \\"FIBER GLASS 2-1/2\\\\\\"\\", NOT \\"FIBER GLASS\\").\\n2. Logical Reconstruction for Blurred/Low-Quality Text: If parts of the text are blurred, smeared, or faint, use deep hardware store domain intelligence to logically reconstruct the full correct name. For example, if you see \\"NAI... 3\\\\\\" X 8 ... SPARK\\", reconstruct it as \\"NAILS 3\\\\\\" X 8 10 PKT/ CASE SPARK\\". Never output truncated or incomplete fragments like \\"NAI\\" or \\"SPARK\\".\\n3. \\"qty\\": Extract the clean numerical quantity (e.g. 37.40, 3.00, 1). Parse it strictly as a clean number.\\n4. \\"unit\\": Standardize the unit to match one of the standard hardware units: Pcs, Kgs, Bag, Pkt's, ROLL, Tin's, Drm, Jar, Dozen, Case, Mtr.\\n5. \\"price\\": Extract the clean numerical unit price.\\n6. Zero Mistakes Audit: Before outputting, cross-verify all values. If a total item amount is visible in the row, ensure that parsed Qty * Price matches the total. If they differ slightly, use human logic to choose the most correct base values. Do not capture totals, taxes, or headers as individual items.\\n\\nFormat: Return strictly a valid raw JSON array of objects with keys: \\"desc\\", \\"qty\\", \\"unit\\", \\"price\\". Do not wrap the JSON in markdown code blocks or write any other conversational text. Return ONLY the valid JSON array."`;

  if (app.includes("Logical Reconstruction for Blurred/Low-Quality Text")) {
    console.log("Super-Smart Prompt is already injected in app.js.");
  } else {
    // Replace all occurrences of oldPrompt
    let occurrencesCount = 0;
    while (app.includes(oldPrompt)) {
      app = app.replace(oldPrompt, superSmartPrompt);
      occurrencesCount++;
    }
    console.log(`Replaced ${occurrencesCount} occurrences of OCR prompt with Super-Smart version.`);
  }

  // B. Add filterActiveExcelGrid() function at the end
  const gridSearchFunc = `
// Filter active items inside active spreadsheet grid
function filterActiveExcelGrid() {
  const query = document.getElementById('excel-grid-search').value.toLowerCase().trim();
  activeExcelRows.forEach(rowId => {
    const rowEl = document.getElementById(rowId);
    if (rowEl) {
      const desc = rowEl.querySelector('.excel-desc').value.toLowerCase();
      if (!query || desc.includes(query)) {
        rowEl.style.display = '';
      } else {
        rowEl.style.display = 'none';
      }
    }
  });
}
`;

  if (app.includes("function filterActiveExcelGrid()")) {
    console.log("filterActiveExcelGrid function already exists in app.js.");
  } else {
    app += `\n${gridSearchFunc}`;
    console.log("Appended filterActiveExcelGrid function to the end of app.js.");
  }

  fs.writeFileSync(appPath, app, 'utf8');
  if (fs.existsSync(wwwAppPath)) {
    fs.writeFileSync(wwwAppPath, app, 'utf8');
  }
}

console.log("Super-Smart AI OCR installation finished successfully!");
