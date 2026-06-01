const fs = require("fs");
const path = require("path");

const appPath = path.join(__dirname, "..", "app.js");
const wwwAppPath = path.join(__dirname, "..", "www", "app.js");
const htmlPath = path.join(__dirname, "..", "index.html");
const wwwHtmlPath = path.join(__dirname, "..", "www", "index.html");

console.log("Starting Surgical Installation of Secure PIN Deletions and Multi-Photo sequential loader...");

// 1. Update index.html to add 'multiple' to gallery input
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, "utf8");
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

  // A. Replace deleteExcelSheet with secure callback wrapper
  const oldDelete = "async function deleteExcelSheet(sheetId) {\n  if (!confirm(\"Are you sure you want to delete this sheet completely?\")) return;\n  \n  state.spreadsheets = state.spreadsheets.filter(s => s.id !== sheetId);\n  safeStorage.setItem(EXCEL_STORAGE_KEY, JSON.stringify(state.spreadsheets));\n  renderSavedExcelSheets();\n  showToast(\"Excel Sheet deleted locally.\", \"fa-solid fa-trash-can\");\n  \n  if (isCloudReady && supabaseClient) {\n    try {\n      const { error } = await supabaseClient\n        .from('saved_spreadsheets')\n        .delete()\n        .eq('id', sheetId);\n      if (error) throw error;\n      showToast(\"Sheet deleted from cloud backup.\", \"fa-solid fa-trash-can\");\n    } catch (err) {\n      console.error(\"Cloud Excel deletion failed:\", err);\n    }\n  }\n}";

  const secureDelete = "async function deleteExcelSheet(sheetId) {\n  if (!confirm(\"Are you sure you want to delete this sheet completely?\")) return;\n  \n  verifyPinForAction(async () => {\n    state.spreadsheets = state.spreadsheets.filter(s => s.id !== sheetId);\n    safeStorage.setItem(EXCEL_STORAGE_KEY, JSON.stringify(state.spreadsheets));\n    renderSavedExcelSheets();\n    showToast(\"Excel Sheet deleted locally.\", \"fa-solid fa-trash-can\");\n    \n    if (isCloudReady && supabaseClient) {\n      try {\n        const { error } = await supabaseClient\n          .from('saved_spreadsheets')\n          .delete()\n          .eq('id', sheetId);\n        if (error) throw error;\n        showToast(\"Sheet deleted from cloud backup.\", \"fa-solid fa-trash-can\");\n      } catch (err) {\n        console.error(\"Cloud Excel deletion failed:\", err);\n      }\n    }\n  });\n}";

  if (app.includes("verifyPinForAction(async () => {")) {
    console.log("deleteExcelSheet is already secured behind PIN.");
  } else if (app.includes(oldDelete)) {
    app = app.replace(oldDelete, secureDelete);
    console.log("deleteExcelSheet secured successfully.");
  } else {
    // Fallback replace
    app = app.replace("state.spreadsheets = state.spreadsheets.filter(s => s.id !== sheetId);", "verifyPinForAction(async () => {\n    state.spreadsheets = state.spreadsheets.filter(s => s.id !== sheetId);");
    app = app.replace("console.error(\"Cloud Excel deletion failed:\", err);\n    }\n  }\n}", "console.error(\"Cloud Excel deletion failed:\", err);\n    }\n  }\n  });\n}");
    console.log("deleteExcelSheet secured successfully (Fallback).");
  }

  // B. Surgically transform handleExcelOcr into sequential loop
  const ocrStartOld = "async function handleExcelOcr(event) {\n  const file = event.target.files[0];\n  if (!file) return;";
  
  const ocrStartNew = "async function handleExcelOcr(event) {\n  const files = event.target.files;\n  if (!files || files.length === 0) return;\n  \n  showToast(\"Starting scan of \" + files.length + \" photos...\", \"fa-solid fa-wand-magic-sparkles\");\n  \n  for (let fIdx = 0; fIdx < files.length; fIdx++) {\n    const file = files[fIdx];";

  if (app.includes("const files = event.target.files;")) {
    console.log("handleExcelOcr already loop-enabled.");
  } else if (app.includes(ocrStartOld)) {
    // Apply loop start
    app = app.replace(ocrStartOld, ocrStartNew);
    
    // Apply loop end. We need to wrap the try/catch inside fIdx loop, and add the closing brace '}' at the end of the fIdx loop.
    // Let's locate the end of handleExcelOcr:
    const ocrEndTarget = `      showToast("Scanned items appended successfully!", "fa-solid fa-file-excel");
      saveExcelDraft();
    } else {
      throw new Error("Invalid output format from AI.");
    }
    
  } catch (err) {
    console.error("Excel OCR Error:", err);
    alert("AI Excel Scanner failed: " + err.message + "\\nEnsure you have internet and a valid API key.");
  }
}`;

    const ocrEndReplacement = `      showToast("Photo " + (fIdx + 1) + " appended successfully!", "fa-solid fa-file-circle-plus");
      saveExcelDraft();
    } else {
      throw new Error("Invalid output format from AI.");
    }
    
    } catch (err) {
      console.error("Excel OCR Error:", err);
      alert("AI Excel Scanner failed: " + err.message + "\\nEnsure you have internet and a valid API key.");
    }
  }
  showToast("All selected photos parsed & appended successfully!", "fa-solid fa-file-excel");
}`;

    if (app.includes(ocrEndTarget)) {
      app = app.replace(ocrEndTarget, ocrEndReplacement);
      console.log("Injected fIdx loop end at handleExcelOcr.");
    } else {
      console.error("Error: Could not locate handleExcelOcr closing block!");
      process.exit(1);
    }
  }

  // Restore CRLF line endings
  const crlfApp = app.replace(/\n/g, "\r\n");

  fs.writeFileSync(appPath, crlfApp, "utf8");
  if (fs.existsSync(wwwAppPath)) {
    fs.writeFileSync(wwwAppPath, crlfApp, "utf8");
  }
  console.log("app.js modified successfully.");
}

console.log("Surgical installation finished successfully!");
