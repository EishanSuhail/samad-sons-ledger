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
  console.log(`Patching HTML attributes in ${filePath}...`);

  // Normalize line endings to Unix style LF
  content = content.replace(/\r\n/g, '\n');

  // 1. Patch estimate row input (around line 2043)
  const estRowTarget = `<input type="text" class="est-desc" placeholder="Desc" value="\${desc}" oninput="calcEstimateRow('\${rowId}')">`;
  const estRowReplacement = `<input type="text" class="est-desc" placeholder="Desc" value="\${escapeHTML(desc)}" oninput="calcEstimateRow('\${rowId}')">`;

  if (content.includes(estRowTarget)) {
    content = content.replace(estRowTarget, estRowReplacement);
    console.log('  -> Estimate row template patched successfully.');
  } else {
    console.warn('  -> WARNING: Estimate row template target NOT found.');
  }

  // 2. Patch OCR review input (around line 2554)
  const ocrTarget = `<input type="text" id="ocr-desc-\${idx}" value="\${item.desc}" style="width:100%; margin-bottom:8px; padding:10px; border:1px solid #cbd5e0; border-radius:6px; font-weight:500;" placeholder="Item Name">`;
  const ocrReplacement = `<input type="text" id="ocr-desc-\${idx}" value="\${escapeHTML(item.desc)}" style="width:100%; margin-bottom:8px; padding:10px; border:1px solid #cbd5e0; border-radius:6px; font-weight:500;" placeholder="Item Name">`;

  if (content.includes(ocrTarget)) {
    content = content.replace(ocrTarget, ocrReplacement);
    console.log('  -> OCR review template patched successfully.');
  } else {
    console.warn('  -> WARNING: OCR review template target NOT found.');
  }

  // 3. Patch Excel row input (around line 3692)
  const excelTarget = `<input type="text" class="excel-desc" list="excel-desc-suggestions" value="\${desc}" placeholder="Enter item name..." style="width: 100%; border: none; padding: 6px; outline: none; font-size: 0.9rem; font-weight: 500;" oninput="handleExcelDescChange(this, '\${rowId}')" autocomplete="off">`;
  const excelReplacement = `<input type="text" class="excel-desc" list="excel-desc-suggestions" value="\${escapeHTML(desc)}" placeholder="Enter item name..." style="width: 100%; border: none; padding: 6px; outline: none; font-size: 0.9rem; font-weight: 500;" oninput="handleExcelDescChange(this, '\${rowId}')" autocomplete="off">`;

  if (content.includes(excelTarget)) {
    content = content.replace(excelTarget, excelReplacement);
    console.log('  -> Excel row template patched successfully.');
  } else {
    console.warn('  -> WARNING: Excel row template target NOT found.');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Finished patching ${filePath}\n`);
});

console.log("HTML Escape patching complete!");
