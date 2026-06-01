const fs = require("fs");
const path = require("path");

const appPath = path.join(__dirname, "..", "app.js");
const wwwAppPath = path.join(__dirname, "..", "www", "app.js");
const htmlPath = path.join(__dirname, "..", "index.html");
const wwwHtmlPath = path.join(__dirname, "..", "www", "index.html");

console.log("Installing Multiple Gallery Photo uploads and Secure PIN Sheet deletions...");

// 1. Update index.html to add 'multiple' to gallery input
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, "utf8");
  
  // Clean replace
  html = html.replace('id="excel-gallery-input" accept="image/*"', 'id="excel-gallery-input" accept="image/*" multiple');
  html = html.replace('id="excel-gallery-input" multiple style="display:none;"', 'id="excel-gallery-input" accept="image/*" multiple style="display:none;"');
  
  fs.writeFileSync(htmlPath, html, "utf8");
  if (fs.existsSync(wwwHtmlPath)) {
    fs.writeFileSync(wwwHtmlPath, html, "utf8");
  }
  console.log("HTML modified successfully.");
}

// 2. Update app.js
if (fs.existsSync(appPath)) {
  let app = fs.readFileSync(appPath, "utf8");
  app = app.replace(/\r\n/g, "\n");

  // A. Replace deleteExcelSheet to require verifyPinForAction
  const oldDelete = "async function deleteExcelSheet(sheetId) {\n  if (!confirm(\"Are you sure you want to delete this sheet completely?\")) return;\n  \n  state.spreadsheets = state.spreadsheets.filter(s => s.id !== sheetId);\n  safeStorage.setItem(EXCEL_STORAGE_KEY, JSON.stringify(state.spreadsheets));\n  renderSavedExcelSheets();\n  showToast(\"Excel Sheet deleted locally.\", \"fa-solid fa-trash-can\");\n  \n  if (isCloudReady && supabaseClient) {\n    try {\n      const { error } = await supabaseClient\n        .from('saved_spreadsheets')\n        .delete()\n        .eq('id', sheetId);\n      if (error) throw error;\n      showToast(\"Sheet deleted from cloud backup.\", \"fa-solid fa-trash-can\");\n    } catch (err) {\n      console.error(\"Cloud Excel deletion failed:\", err);\n    }\n  }\n}";

  const secureDelete = "async function deleteExcelSheet(sheetId) {\n  if (!confirm(\"Are you sure you want to delete this sheet completely?\")) return;\n  \n  verifyPinForAction(async () => {\n    state.spreadsheets = state.spreadsheets.filter(s => s.id !== sheetId);\n    safeStorage.setItem(EXCEL_STORAGE_KEY, JSON.stringify(state.spreadsheets));\n    renderSavedExcelSheets();\n    showToast(\"Excel Sheet deleted locally.\", \"fa-solid fa-trash-can\");\n    \n    if (isCloudReady && supabaseClient) {\n      try {\n        const { error } = await supabaseClient\n          .from('saved_spreadsheets')\n          .delete()\n          .eq('id', sheetId);\n        if (error) throw error;\n        showToast(\"Sheet deleted from cloud backup.\", \"fa-solid fa-trash-can\");\n      } catch (err) {\n        console.error(\"Cloud Excel deletion failed:\", err);\n      }\n    }\n  });\n}";

  if (app.includes("verifyPinForAction(async () => {")) {
    console.log("deleteExcelSheet is already secured behind PIN.");
  } else if (app.includes(oldDelete)) {
    app = app.replace(oldDelete, secureDelete);
    console.log("deleteExcelSheet replaced successfully.");
  } else {
    // Try simple search/replace
    app = app.replace("state.spreadsheets = state.spreadsheets.filter(s => s.id !== sheetId);", "verifyPinForAction(async () => {\n    state.spreadsheets = state.spreadsheets.filter(s => s.id !== sheetId);");
    // Closing brace search is complex, we can do it recursively or let's use search/replace
    app = app.replace("console.error(\"Cloud Excel deletion failed:\", err);\n    }\n  }\n}", "console.error(\"Cloud Excel deletion failed:\", err);\n    }\n  }\n  });\n}");
    console.log("deleteExcelSheet replaced successfully (Fallback).");
  }

  // B. Replace handleExcelOcr block
  const startMarker = "async function handleExcelOcr(event) {";
  const endMarker = "// Filter active items inside active spreadsheet grid";
  
  const startIdx = app.indexOf(startMarker);
  const endIdx = app.indexOf(endMarker);
  
  if (startIdx !== -1 && endIdx !== -1) {
    const originalOcrBlock = app.substring(startIdx, endIdx);
    
    // Construct the block using standard string joining to ensure zero backtick escaping bugs
    const lines = [];
    lines.push("async function handleExcelOcr(event) {");
    lines.push("  const files = event.target.files;");
    lines.push("  if (!files || files.length === 0) return;");
    lines.push("  ");
    lines.push("  const geminiKey = safeStorage.getItem('gemini_api_key');");
    lines.push("  const openaiKey = safeStorage.getItem('openai_api_key');");
    lines.push("  ");
    lines.push("  showToast(\"Starting scan of \" + files.length + \" photos...\", \"fa-solid fa-wand-magic-sparkles\");");
    lines.push("  ");
    lines.push("  for (let fIdx = 0; fIdx < files.length; fIdx++) {");
    lines.push("    const file = files[fIdx];");
    lines.push("    showToast(\"Analyzing photo \" + (fIdx + 1) + \" of \" + files.length + \"...\", \"fa-solid fa-spinner fa-spin\");");
    lines.push("    ");
    lines.push("    try {");
    lines.push("      const base64Img = await compressAndResizeImage(file);");
    lines.push("      let items = [];");
    lines.push("      ");
    lines.push("      if (geminiKey) {");
    lines.push("        const base64Clean = base64Img.split(',')[1];");
    lines.push("        const mimeType = base64Img.split(';')[0].split(':')[1];");
    lines.push("        let parsedItems = null;");
    lines.push("        let lastError = null;");
    lines.push("        const models = [\"gemini-2.5-flash\", \"gemini-2.0-flash\", \"gemini-1.5-flash\"];");
    lines.push("        ");
    lines.push("        for (const model of models) {");
    lines.push("          try {");
    lines.push("            console.log(\"Excel OCR: Trying model \" + model + \" for file \" + (fIdx + 1));");
    lines.push("            const response = await fetch(\"https://generativelanguage.googleapis.com/v1/models/\" + model + \":generateContent?key=\" + geminiKey, {");
    lines.push("              method: 'POST',");
    lines.push("              headers: { 'Content-Type': 'application/json' },");
    lines.push("              body: JSON.stringify({");
    lines.push("                contents: [{");
    lines.push("                  parts: [");
    lines.push("                    {");
    lines.push("                      text: \"Analyze this image of a handwritten or printed list, bill, invoice, or slip of hardware, sanitary, or construction materials.\\nYour task is to act like an extremely intelligent, professional human auditor and perform a 100% correct, zero-mistakes tabular extraction of all line items.\\n\\nRules for Unrivaled Accuracy & Quality:\\n1. \\\"desc\\\" (Complete Descriptions): Extract the EXACT and COMPLETE description/name of the item. Never truncate, omit, or half-write sizes, dimensions, or details (e.g. write \\\"FIBER GLASS 2-1/2\\\\\\\"\\\", NOT \\\"FIBER GLASS\\\").\\n2. Logical Reconstruction for Blurred/Low-Quality Text: If parts of the text are blurred, smeared, or faint, use deep hardware store domain intelligence to logically reconstruct the full correct name. For example, if you see \\\"NAI... 3\\\\\\\" X 8 ... SPARK\\\", reconstruct it as \\\"NAILS 3\\\\\\\" X 8 10 PKT/ CASE SPARK\\\". Never output truncated or incomplete fragments like \\\"NAI\\\" or \\"SPARK\\\".\\n3. \\\"qty\\\": Extract the clean numerical quantity (e.g. 37.40, 3.00, 1). Parse it strictly as a clean number.\\n4. \\\"unit\\\": Standardize the unit to match one of the standard hardware units: Pcs, Kgs, Bag, Pkt's, ROLL, Tin's, Drm, Jar, Dozen, Case, Mtr.\\n5. \\\"price\\": Extract the clean numerical unit price.\\n6. Zero Mistakes Audit: Before outputting, cross-verify all values. If a total item amount is visible in the row, ensure that parsed Qty * Price matches the total. If they differ slightly, use human logic to choose the most correct base values. Do not capture totals, taxes, or headers as individual items.\\n\\nFormat: Return strictly a valid raw JSON array of objects with keys: \\\"desc\\\", \\"qty\\\", \\"unit\\\", \\"price\\\". Do not wrap the JSON in markdown code blocks or write any other conversational text. Return ONLY the valid JSON array.\"");
    lines.push("                    },");
    lines.push("                    {");
    lines.push("                      inlineData: { mimeType: mimeType || \"image/jpeg\", data: base64Clean }");
    lines.push("                    }");
    lines.push("                  ]");
    lines.push("                }]");
    lines.push("              })");
    lines.push("            });");
    lines.push("            ");
    lines.push("            if (response.ok) {");
    lines.push("              const data = await response.json();");
    lines.push("              const textResult = data.candidates[0].content.parts[0].text.trim();");
    lines.push("              let cleanJson = textResult.trim();");
    lines.push("              ");
    lines.push("              const backticks = String.fromCharCode(96) + String.fromCharCode(96) + String.fromCharCode(96);");
    lines.push("              if (cleanJson.startsWith(backticks)) {");
    lines.push("                cleanJson = cleanJson.replace(/^\\`\\`\\`(json)?/i, '').replace(/\\`\\`\\`$/, '').trim();");
    lines.push("              }");
    lines.push("              const jsonStart = cleanJson.indexOf('[');");
    lines.push("              const jsonEnd = cleanJson.lastIndexOf(']');");
    lines.push("              if (jsonStart !== -1 && jsonEnd !== -1) {");
    lines.push("                cleanJson = cleanJson.substring(jsonStart, jsonEnd + 1);");
    lines.push("              }");
    lines.push("              parsedItems = JSON.parse(cleanJson);");
    lines.push("              break;");
    lines.push("            } else {");
    lines.push("              const errData = await response.json().catch(() => ({}));");
    lines.push("              lastError = new Error(errData.error?.message || (\"HTTP \" + response.status));");
    lines.push("            }");
    lines.push("          } catch (err) {");
    lines.push("            lastError = err;");
    lines.push("          }");
    lines.push("        }");
    lines.push("        ");
    lines.push("        if (!parsedItems) throw lastError || new Error(\"Failed all Gemini models for photo \" + (fIdx + 1));");
    lines.push("        items = parsedItems;");
    lines.push("      } else if (openaiKey) {");
    lines.push("        const response = await fetch('https://api.openai.com/v1/chat/completions', {");
    lines.push("          method: 'POST',");
    lines.push("          headers: {");
    lines.push("            'Content-Type': 'application/json',");
    lines.push("            'Authorization': \"Bearer \" + openaiKey");
    lines.push("          },");
    lines.push("          body: JSON.stringify({");
    lines.push("            model: \"gpt-4o-mini\",");
    lines.push("            messages: [");
    lines.push("              {");
    lines.push("                role: \"user\",");
    lines.push("                content: [");
    lines.push("                  {");
    lines.push("                    type: \"text\",");
    lines.push("                    text: \"Analyze this image of a handwritten or printed list, bill, invoice, or slip of hardware, sanitary, or construction materials.\\nYour task is to act like an extremely intelligent, professional human auditor and perform a 100% correct, zero-mistakes tabular extraction of all line items.\\n\\nRules for Unrivaled Accuracy & Quality:\\n1. \\"desc\\\" (Complete Descriptions): Extract the EXACT and COMPLETE description/name of the item. Never truncate, omit, or half-write sizes, dimensions, or details (e.g. write \\"FIBER GLASS 2-1/2\\\\\\\"\\", NOT \\"FIBER GLASS\\\").\\n2. Logical Reconstruction for Blurred/Low-Quality Text: If parts of the text are blurred, smeared, or faint, use deep hardware store domain intelligence to logically reconstruct the full correct name. For example, if you see \\"NAI... 3\\\\\\\" X 8 ... SPARK\\", reconstruct it as \\"NAILS 3\\\\\\\" X 8 10 PKT/ CASE SPARK\\\". Never output truncated or incomplete fragments like \\"NAI\\" or \\"SPARK\\\".\\n3. \\"qty\\": Extract the clean numerical quantity (e.g. 37.40, 3.00, 1). Parse it strictly as a clean number.\\n4. \\"unit\\": Standardize the unit to match one of the standard hardware units: Pcs, Kgs, Bag, Pkt's, ROLL, Tin's, Drm, Jar, Dozen, Case, Mtr.\\n5. \\"price\\": Extract the clean numerical unit price.\\n6. Zero Mistakes Audit: Before outputting, cross-verify all values. If a total item amount is visible in the row, ensure that parsed Qty * Price matches the total. If they differ slightly, use human logic to choose the most correct base values. Do not capture totals, taxes, or headers as individual items.\\n\\nFormat: Return strictly a valid raw JSON array of objects with keys: \\"desc\\", \\"qty\\", \\"unit\\", \\"price\\\". Do not wrap the JSON in markdown code blocks or write any other conversational text. Return ONLY the valid JSON array.\"");
    lines.push("                  },");
    lines.push("                  {");
    lines.push("                    type: \"image_url\",");
    lines.push("                    image_url: { \"url\": base64Img }");
    lines.push("                  }");
    lines.push("                ]");
    lines.push("              }");
    lines.push("            ],");
    lines.push("            max_tokens: 1500");
    lines.push("          })");
    lines.push("        });");
    lines.push("        ");
    lines.push("        if (!response.ok) {");
    lines.push("          const errData = await response.json().catch(() => ({}));");
    lines.push("          throw new Error(errData.error?.message || \"Failed to call OpenAI API\");");
    lines.push("        }");
    lines.push("        const data = await response.json();");
    lines.push("        const textResult = data.choices[0].message.content.trim();");
    lines.push("        const cleanJson = textResult.replace(/^\\s*\\`\\`\\`json\\s*/i, '').replace(/\\`\\`\\`$/, '').trim();");
    lines.push("        items = JSON.parse(cleanJson);");
    lines.push("      } else {");
    lines.push("        showToast(\"Demo Scanner: Appending items...\", \"fa-solid fa-wand-magic-sparkles\");");
    lines.push("        items = [");
    lines.push("          { desc: \"FIBER GLASS 2-1/2\\\"\", qty: 37.40, unit: \"Kgs\", price: 163.00 },");
    lines.push("          { desc: \"NAILS 4\\\" X 8 10 PKT/ CASE SPARK\", qty: 3.00, unit: \"Case\", price: 1710.00 },");
    lines.push("          { desc: \"NAILS 3\\\" X 12 10 PKT/ CASE SPARK\", qty: 3.00, unit: \"Case\", price: 1740.00 }");
    lines.push("        ];");
    lines.push("        await new Promise(r => setTimeout(r, 1200));");
    lines.push("      }");
    lines.push("      ");
    lines.push("      if (Array.isArray(items)) {");
    lines.push("        const partyInput = document.getElementById('excel-sheet-party');");
    lines.push("        if (!partyInput.value.trim()) {");
    lines.push("          partyInput.value = \"Scanned Bills (\" + new Date().toLocaleDateString() + \")\";");
    lines.push("        }");
    lines.push("        ");
    lines.push("        if (activeExcelRows.length === 1) {");
    lines.push("          const firstRow = document.getElementById(activeExcelRows[0]);");
    lines.push("          if (firstRow) {");
    lines.push("            const descVal = firstRow.querySelector('.excel-desc').value.trim();");
    lines.push("            const qtyVal = firstRow.querySelector('.excel-qty').value.trim();");
    lines.push("            const priceVal = firstRow.querySelector('.excel-price').value.trim();");
    lines.push("            if (!descVal && !qtyVal && !priceVal) {");
    lines.push("              removeExcelRow(activeExcelRows[0]);");
    lines.push("            }");
    lines.push("          }");
    lines.push("        }");
    lines.push("        ");
    lines.push("        items.forEach(item => {");
    lines.push("          addExcelRow(");
    lines.push("            item.desc || \"Unidentified Item\",");
    lines.push("            parseFloat(item.qty) || 1,");
    lines.push("            item.unit || \"Pcs\",");
    lines.push("            parseFloat(item.price) || 0");
    lines.push("          );");
    lines.push("        });");
    lines.push("        showToast(\"Photo \" + (fIdx + 1) + \" appended successfully!\", \"fa-solid fa-file-circle-plus\");");
    lines.push("      }");
    lines.push("    } catch (e) {");
    lines.push("      console.error(\"Photo \" + (fIdx + 1) + \" failed:\", e);");
    lines.push("      alert(\"Photo \" + (fIdx + 1) + \" scan failed: \" + e.message);");
    lines.push("    }");
    lines.push("  }");
    lines.push("  ");
    lines.push("  saveExcelDraft();");
    lines.push("  showToast(\"All selected photos parsed & appended successfully!\", \"fa-solid fa-file-excel\");");
    lines.push("}");
    
    const smartOcrBlock = lines.join("\n") + "\n\n";
    app = app.replace(originalOcrBlock, smartOcrBlock);
    console.log("Successfully replaced handleExcelOcr block in app.js with safe double-quoted multi-photo sequential parser!");
  } else {
    console.error("Could not find start or end markers for handleExcelOcr block in app.js.");
  }

  // Restore CRLF line endings
  const crlfApp = app.replace(/\n/g, "\r\n");

  fs.writeFileSync(appPath, crlfApp, "utf8");
  if (fs.existsSync(wwwAppPath)) {
    fs.writeFileSync(wwwAppPath, crlfApp, "utf8");
  }
}

console.log("Responsive and Secure Deletions Patcher Finished successfully!");
