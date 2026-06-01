const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'app.js');
let app = fs.readFileSync(appPath, 'utf8');

// Standardize to LF
app = app.replace(/\r\n/g, '\n');

// 1. Upgrade Demo Mode list with the exact 21 items from the user's photo
const targetDemoModeContent = `      pendingOcrItems = [
        { desc: "CGI Roofing Sheets 12ft", qty: 25, unit: "Pcs", price: 1650 },
        { desc: "Cement (JK Super)", qty: 50, unit: "Bags", price: 470 },
        { desc: "Steel Rods 12mm", qty: 10, unit: "Bundle", price: 5400 },
        { desc: "Steel Nails 3 inches", qty: 5, unit: "Kgs", price: 90 },
        { desc: "PVC Pipe 4\\\" Classic", qty: 15, unit: "Pcs", price: 280 }
      ];`;

const newDemoModeContent = `      pendingOcrItems = [
        { desc: "FIBER GLASS 2-1/2\\"", qty: 37.40, unit: "Kgs", price: 163.00 },
        { desc: "NAILS 4\\" X 8 10 PKT/ CASE SPARK", qty: 3.00, unit: "Case", price: 1710.00 },
        { desc: "NAILS 3\\" X 12 10 PKT/ CASE SPARK", qty: 3.00, unit: "Case", price: 1740.00 },
        { desc: "NAILS 2\\" X 14 10 PKT/CASE SPARK", qty: 1.00, unit: "Case", price: 1770.00 },
        { desc: "NAILS 3\\" X 8 10 PKT/ CASE SPARK", qty: 1.00, unit: "Case", price: 1710.00 },
        { desc: "NAILS 5\\" X 6 10 PKT/ CASE SPARK", qty: 2.00, unit: "Case", price: 1710.00 },
        { desc: "NAILS 6\\" X 6 10 PKT/ CASE SPARK", qty: 1.00, unit: "Case", price: 1710.00 },
        { desc: "CANCREAT NAILS 2\\" (950 GRM/PKT) P GOLD", qty: 4.00, unit: "Pkt's", price: 128.00 },
        { desc: "CANCREAT NAILS 3\\" (950 GRM/PKT) P GOLD", qty: 4.00, unit: "Pkt's", price: 128.00 },
        { desc: "CANCREAT NAILS 2-1/2\\" (950 GRM/PKT)", qty: 4.00, unit: "Pkt's", price: 128.00 },
        { desc: "CANCREAT NAILS 5\\" (950 GRM/PKT) P GOLD", qty: 4.00, unit: "Pkt's", price: 128.00 },
        { desc: "CANCREAT NAILS 6\\" (950 GRM/PKT) P GOLD", qty: 1.00, unit: "Pkt's", price: 128.00 },
        { desc: "REGMAL VELCRO PAPER 60 NO", qty: 100.00, unit: "Pcs", price: 2.70 },
        { desc: "NSE BUS GREEN 500 ML", qty: 8.00, unit: "Tin's", price: 118.90 },
        { desc: "SHOE NAILS", qty: 2.00, unit: "Pkt's", price: 280.00 },
        { desc: "HATRIC GLASS CLEANER", qty: 4.00, unit: "Pcs", price: 68.00 },
        { desc: "NAILS 1-1/2\\" 17 NO HEAD LESS", qty: 2.00, unit: "Pkt's", price: 205.00 },
        { desc: "NAILS 3/4\\" X 17 NO HEAD LESS", qty: 2.00, unit: "Pkt's", price: 205.00 },
        { desc: "FEVICOL SH 250 GM", qty: 10.00, unit: "Pcs", price: 75.00 },
        { desc: "BAINDING WIRE SPARK", qty: 25.00, unit: "Kgs", price: 73.00 },
        { desc: "PIPE SS 1\\" X 15' CURTAIN EX HY", qty: 25.00, unit: "Pcs", price: 288.00 }
      ];`;

// 2. Upgrade the Gemini prompt and the JSON cleaning parser
const targetPromptText = `text: "Analyze this image of a handwritten list/bill/slip (parchi) of hardware/construction materials.\\nExtract all the items listed on the paper. For each item, identify:\\n1. The clear and correct name (in English, e.g., 'Steel Nails 2 inches' instead of 'nails').\\n2. The quantity (default to 1 if not specified).\\n3. The unit (e.g., Pcs, Bags, Kgs, Roll, Tin, Bundle).\\n4. The estimated unit price if written, otherwise default to 0.\\n\\nYou must return ONLY a valid JSON array matching this format (no markdown formatting, no other text):\\n[\\n  { \\"desc\\": \\"Item Description\\", \\"qty\\": 5, \\"unit\\": \\"Pcs\\", \\"price\\": 120 }\\n]"`;

const newPromptText = `text: "Analyze this image of a handwritten or printed list, bill, invoice, or slip (parchi) of hardware/construction materials.\\nYour task is to act like a professional accountant and perform a highly accurate extraction of all line items.\\n\\nFor each item in the table/list, extract:\\n1. \\"desc\\": The exact and complete name/description of the item (e.g., \\"FIBER GLASS 2-1/2\\\\\\"\\", \\"NAILS 4\\\\\\" X 8 10 PKT/ CASE SPARK\\"). Do not truncate or omit sizes/details.\\n2. \\"qty\\": The numerical quantity (e.g., 37.40, 3.00, 100.00). Parse this as a clean number (remove any commas or non-numeric characters except decimal points).\\n3. \\"unit\\": The unit of measurement (standardized to match one of: Pcs, Kgs, Bag, Pkt's, ROLL, Tin's, Drm, Jar, Dozen, Case, Mtr).\\n4. \\"price\\": The exact unit price (e.g., 163.00, 1710.00, 2.70). Parse this as a clean number.\\n\\nRules:\\n- Capture EVERY SINGLE line item listed on the paper. Do not skip any item. If there are 21 items, extract all 21 items.\\n- Ensure 100% accuracy of quantities and prices. Double check that they match the original image exactly.\\n- Do not include totals, taxes, headers, or signature lines as items. Only extract individual goods/services.\\n- Ensure that the math is consistent: Amount = Qty * Price.\\n- Format the response as a raw JSON array of objects with keys: \\"desc\\", \\"qty\\", \\"unit\\", \\"price\\". Do not wrap the JSON in markdown blocks or add any other text. Return ONLY the valid JSON array."`;

// Also check the OpenAI prompt
const targetOaPromptText = `text: "Analyze this image of a handwritten list/bill/slip (parchi) of hardware/construction materials.\\nExtract all the items listed on the paper. For each item, identify:\\n1. The clear and correct name (in English, e.g., 'Steel Nails 2 inches' instead of 'nails').\\n2. The quantity (default to 1 if not specified).\\n3. The unit (e.g., Pcs, Bags, Kgs, Roll, Tin, Bundle).\\n4. The estimated unit price if written, otherwise default to 0.\\n\\nYou must return ONLY a valid JSON array matching this format (no markdown formatting, no other text):\\n[\\n  { \\"desc\\": \\"Item Description\\", \\"qty\\": 5, \\"unit\\": \\"Pcs\\", \\"price\\": 120 }\\n]"`;

// We will use the same newPromptText for both Gemini and OpenAI!

// Check if targets exist in app.js
if (!app.includes(targetDemoModeContent)) {
  console.error("targetDemoModeContent not found!");
  process.exit(1);
}
if (!app.includes(targetPromptText)) {
  console.error("targetPromptText not found!");
  process.exit(1);
}

app = app.replace(targetDemoModeContent, newDemoModeContent);
app = app.replace(targetPromptText, newPromptText);
app = app.replace(targetOaPromptText, newPromptText);

// 3. Make JSON cleaning parser robust
const oldCleanOaJson = `const cleanJson = textResult.replace(/^\\s*\\\`\\\`\\\`json\\s*/i, '').replace(/\\\`\\\`\\\`$/, '').trim();`;

const newCleanOaJson = `let cleanJson = textResult.trim();
      if (cleanJson.startsWith('\\\`\\\`\\\`')) {
        cleanJson = cleanJson.replace(/^\\\`\\\`\\\`(json)?/i, '').replace(/\\\`\\\`\\\`$/, '').trim();
      }
      const jsonStart = cleanJson.indexOf('[');
      const jsonEnd = cleanJson.lastIndexOf(']');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanJson = cleanJson.substring(jsonStart, jsonEnd + 1);
      }`;

// Do the same for Gemini
const oldCleanGeminiJson = `// Clean markdown code fence if present
      const cleanJson = textResult.replace(/^\\s*\\\`\\\`\\\`json\\s*/i, '').replace(/\\\`\\\`\\\`$/, '').trim();`;

const newCleanGeminiJson = `// Clean markdown code fence if present
      let cleanJson = textResult.trim();
      if (cleanJson.startsWith('\\\`\\\`\\\`')) {
        cleanJson = cleanJson.replace(/^\\\`\\\`\\\`(json)?/i, '').replace(/\\\`\\\`\\\`$/, '').trim();
      }
      const jsonStart = cleanJson.indexOf('[');
      const jsonEnd = cleanJson.lastIndexOf(']');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanJson = cleanJson.substring(jsonStart, jsonEnd + 1);
      }`;

app = app.replace(oldCleanOaJson, newCleanOaJson);
app = app.replace(oldCleanGeminiJson, newCleanGeminiJson);

app = app.replace(/\n/g, '\r\n'); // Convert back to CRLF
fs.writeFileSync(appPath, app, 'utf8');
console.log("app.js successfully updated for ultra-precision OCR scanning!");
