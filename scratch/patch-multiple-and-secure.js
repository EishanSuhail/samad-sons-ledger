const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'app.js');
const wwwAppPath = path.join(__dirname, '..', 'www', 'app.js');
const htmlPath = path.join(__dirname, '..', 'index.html');
const wwwHtmlPath = path.join(__dirname, '..', 'www', 'index.html');

console.log("Installing Multiple Gallery Photo uploads and Secure PIN Sheet deletions...");

// 1. Update index.html to add 'multiple' to gallery input
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  
  const oldGalleryInput = `<input type="file" id="excel-gallery-input" accept="image/*" style="display:none;" onchange="handleExcelOcr(event)">`;
  const smartGalleryInput = `<input type="file" id="excel-gallery-input" accept="image/*" multiple style="display:none;" onchange="handleExcelOcr(event)">`;

  if (html.includes('id="excel-gallery-input" accept="image/*" multiple')) {
    console.log("Gallery input already supports multiple files selection.");
  } else if (html.includes(oldGalleryInput)) {
    html = html.replace(oldGalleryInput, smartGalleryInput);
    console.log("Upgraded gallery input to support multiple selection.");
  } else {
    // Fallback search
    html = html.replace('id="excel-gallery-input"', 'id="excel-gallery-input" multiple');
    console.log("Upgraded gallery input to support multiple selection (Fallback).");
  }
  
  fs.writeFileSync(htmlPath, html, 'utf8');
  if (fs.existsSync(wwwHtmlPath)) {
    fs.writeFileSync(wwwHtmlPath, html, 'utf8');
  }
}

// 2. Update app.js (and www/app.js)
if (fs.existsSync(appPath)) {
  let app = fs.readFileSync(appPath, 'utf8');
  
  // Normalize line endings to LF
  app = app.replace(/\r\n/g, '\n');

  // A. Replace deleteExcelSheet to require verifyPinForAction
  const oldDeleteExcelSheet = `async function deleteExcelSheet(sheetId) {
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
}`;

  const secureDeleteExcelSheet = `async function deleteExcelSheet(sheetId) {
  if (!confirm("Are you sure you want to delete this sheet completely?")) return;
  
  verifyPinForAction(async () => {
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
  });
}`;

  if (app.includes("verifyPinForAction(async () => {\n    state.spreadsheets = state.spreadsheets.filter")) {
    console.log("deleteExcelSheet is already secured behind PIN password.");
  } else if (app.includes(oldDeleteExcelSheet)) {
    app = app.replace(oldDeleteExcelSheet, secureDeleteExcelSheet);
    console.log("Secured spreadsheet deletion logic with verifyPinForAction!");
  } else {
    console.warn("Could not find standard deleteExcelSheet target in app.js.");
  }

  // B. Replace handleExcelOcr with sequential multi-photo parser
  const startMarker = 'async function handleExcelOcr(event) {';
  const nextFunctionMarker = '// Filter active items inside active spreadsheet grid';
  
  const startIdx = app.indexOf(startMarker);
  const endIdx = app.indexOf(nextFunctionMarker);
  
  if (startIdx !== -1 && endIdx !== -1) {
    const originalOcrBlock = app.substring(startIdx, endIdx);
    
    // Construct the smart OCR function safely using String.fromCharCode(96) to completely avoid backticks syntax bugs
    const bt3 = 'String.fromCharCode(96) + String.fromCharCode(96) + String.fromCharCode(96)';
    
    const smartOcrBlock = `async function handleExcelOcr(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;
  
  const geminiKey = safeStorage.getItem('gemini_api_key');
  const openaiKey = safeStorage.getItem('openai_api_key');
  
  showToast("Starting scan of " + files.length + " photos...", "fa-solid fa-wand-magic-sparkles");
  
  for (let fIdx = 0; fIdx < files.length; fIdx++) {
    const file = files[fIdx];
    showToast("Analyzing photo " + (fIdx + 1) + " of " + files.length + "...", "fa-solid fa-spinner fa-spin");
    
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
            console.log("Excel OCR: Trying model " + model + " for file " + (fIdx + 1));
            const response = await fetch("https://generativelanguage.googleapis.com/v1/models/" + model + ":generateContent?key=" + geminiKey, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [
                    {
                      text: "Analyze this image of a handwritten or printed list, bill, invoice, or slip of hardware, sanitary, or construction materials.\\nYour task is to act like an extremely intelligent, professional human auditor and perform a 100% correct, zero-mistakes tabular extraction of all line items.\\n\\nRules for Unrivaled Accuracy & Quality:\\n1. \\"desc\\" (Complete Descriptions): Extract the EXACT and COMPLETE description/name of the item. Never truncate, omit, or half-write sizes, dimensions, or details (e.g. write \\"FIBER GLASS 2-1/2\\\\\\"\\", NOT \\"FIBER GLASS\\").\\n2. Logical Reconstruction for Blurred/Low-Quality Text: If parts of the text are blurred, smeared, or faint, use deep hardware store domain intelligence to logically reconstruct the full correct name. For example, if you see \\"NAI... 3\\\\\\" X 8 ... SPARK\\", reconstruct it as \\"NAILS 3\\\\\\" X 8 10 PKT/ CASE SPARK\\". Never output truncated or incomplete fragments like \\"NAI\\" or \\"SPARK\\".\\n3. \\"qty\\": Extract the clean numerical quantity (e.g. 37.40, 3.00, 1). Parse it strictly as a clean number.\\n4. \\"unit\\": Standardize the unit to match one of the standard hardware units: Pcs, Kgs, Bag, Pkt's, ROLL, Tin's, Drm, Jar, Dozen, Case, Mtr.\\n5. \\"price\\": Extract the clean numerical unit price.\\n6. Zero Mistakes Audit: Before outputting, cross-verify all values. If a total item amount is visible in the row, ensure that parsed Qty * Price matches the total. If they differ slightly, use human logic to choose the most correct base values. Do not capture totals, taxes, or headers as individual items.\\n\\nFormat: Return strictly a valid raw JSON array of objects with keys: \\"desc\\", \\"qty\\", \\"unit\\", \\"price\\". Do not wrap the JSON in markdown code blocks or write any other conversational text. Return ONLY the valid JSON array."
                    },
                    {
                      inlineData: { mimeType: mimeType || "image/jpeg", data: base64Clean }
                    }
                  ]
                }]
              })
            });
            
            if (response.ok) {
              const data = await response.json();
              const textResult = data.candidates[0].content.parts[0].text.trim();
              let cleanJson = textResult.trim();
              
              const backticks = ${bt3};
              if (cleanJson.startsWith(backticks)) {
                cleanJson = cleanJson.replace(/^\\`\\`\\`(json)?/i, '').replace(/\\`\\`\\`$/, '').trim();
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
              lastError = new Error(errData.error?.message || ("HTTP " + response.status));
            }
          } catch (err) {
            lastError = err;
          }
        }
        
        if (!parsedItems) throw lastError || new Error("Failed all Gemini models for photo " + (fIdx + 1));
        items = parsedItems;
      } else if (openaiKey) {
        // Fallback to OpenAI Vision API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + openaiKey
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Analyze this image of a handwritten or printed list, bill, invoice, or slip of hardware, sanitary, or construction materials.\\nYour task is to act like an extremely intelligent, professional human auditor and perform a 100% correct, zero-mistakes tabular extraction of all line items.\\n\\nRules for Unrivaled Accuracy & Quality:\\n1. \\"desc\\" (Complete Descriptions): Extract the EXACT and COMPLETE description/name of the item. Never truncate, omit, or half-write sizes, dimensions, or details (e.g. write \\"FIBER GLASS 2-1/2\\\\\\"\\", NOT \\"FIBER GLASS\\").\\n2. Logical Reconstruction for Blurred/Low-Quality Text: If parts of the text are blurred, smeared, or faint, use deep hardware store domain intelligence to logically reconstruct the full correct name. For example, if you see \\"NAI... 3\\\\\\" X 8 ... SPARK\\", reconstruct it as \\"NAILS 3\\\\\\" X 8 10 PKT/ CASE SPARK\\". Never output truncated or incomplete fragments like \\"NAI\\" or \\"SPARK\\".\\n3. \\"qty\\": Extract the clean numerical quantity (e.g. 37.40, 3.00, 1). Parse it strictly as a clean number.\\n4. \\"unit\\": Standardize the unit to match one of the standard hardware units: Pcs, Kgs, Bag, Pkt's, ROLL, Tin's, Drm, Jar, Dozen, Case, Mtr.\\n5. \\"price\\": Extract the clean numerical unit price.\\n6. Zero Mistakes Audit: Before outputting, cross-verify all values. If a total item amount is visible in the row, ensure that parsed Qty * Price matches the total. If they differ slightly, use human logic to choose the most correct base values. Do not capture totals, taxes, or headers as individual items.\\n\\nFormat: Return strictly a valid raw JSON array of objects with keys: \\"desc\\", \\"qty\\", \\"unit\\", \\"price\\". Do not wrap the JSON in markdown code blocks or write any other conversational text. Return ONLY the valid JSON array."
                  },
                  {
                    type: "image_url",
                    image_url: { "url": base64Img }
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
        const backticks = ${bt3};
        const cleanJson = textResult.replace(/^\\s*\\`\\`\\`json\\s*/i, '').replace(/\\`\\`\\`$/, '').trim();
        items = JSON.parse(cleanJson);
      } else {
        // Seeding with Demo items
        showToast("Demo Scanner: Appending items...", "fa-solid fa-wand-magic-sparkles");
        items = [
          { desc: "FIBER GLASS 2-1/2\\"", qty: 37.40, unit: "Kgs", price: 163.00 },
          { desc: "NAILS 4\\" X 8 10 PKT/ CASE SPARK", qty: 3.00, unit: "Case", price: 1710.00 },
          { desc: "NAILS 3\\" X 12 10 PKT/ CASE SPARK", qty: 3.00, unit: "Case", price: 1740.00 }
        ];
        await new Promise(r => setTimeout(r, 1200));
      }
      
      if (Array.isArray(items)) {
        const partyInput = document.getElementById('excel-sheet-party');
        if (!partyInput.value.trim()) {
          partyInput.value = "Scanned Bills (" + new Date().toLocaleDateString() + ")";
        }
        
        // Remove blank initial row
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
        showToast("Photo " + (fIdx + 1) + " appended successfully!", "fa-solid fa-file-circle-plus");
      }
    } catch (e) {
      console.error("Photo " + (fIdx + 1) + " failed:", e);
      alert("Photo " + (fIdx + 1) + " scan failed: " + e.message);
    }
  }
  
  saveExcelDraft();
  showToast("All selected photos parsed & appended successfully!", "fa-solid fa-file-excel");
}\n\n`;

    app = app.replace(originalOcrBlock, smartOcrBlock);
    console.log("Successfully replaced handleExcelOcr block in app.js with multi-photo sequential parser!");
  } else {
    console.error("Could not find start or end markers for handleExcelOcr block in app.js.");
  }

  // Restore CRLF line endings
  const crlfApp = app.replace(/\n/g, '\r\n');

  fs.writeFileSync(appPath, crlfApp, 'utf8');
  if (fs.existsSync(wwwAppPath)) {
    fs.writeFileSync(wwwAppPath, crlfApp, 'utf8');
  }
}

console.log("Installation completed!");
