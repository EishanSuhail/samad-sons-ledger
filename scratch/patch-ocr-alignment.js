const fs = require('fs');
const path = require('path');

const filesToPatch = [
  path.join(__dirname, '..', 'app.js'),
  path.join(__dirname, '..', 'www', 'app.js')
];

const improvedPromptWithAlignment = `Analyze this image of a handwritten or printed list, bill, invoice, or slip of hardware, sanitary, or construction materials.
Your task is to act like an extremely intelligent, professional human auditor and perform a 100% correct, zero-mistakes tabular extraction of all line items.

Rules for Unrivaled Accuracy & Quality:
1. "desc" (Complete Descriptions): Extract the EXACT, FULL and COMPLETE description/name of the item. Never truncate, omit, or half-write brand names, sizes, dimensions, or details. For example, if you see "4 inch b-type pvc pipe lotus", you must write EXACTLY "4 inch b-type pvc pipe lotus" (capturing the size "4 inch", the specification "b-type pvc pipe", and the brand "lotus"). Never shorten it to "4 inch b-type pvc" or "pvc pipe".
2. Brand and Specification Preservation: Brand names (e.g. "Lotus", "Finolex", "Supreme", "Spark", "P.Gold", etc.), type classes (e.g. "B-type", "A-class", "EX HY"), and descriptive specifications (e.g. "pipe", "bend", "elbow", "socket") must ALWAYS be captured completely. Never drop any word from the original description.
3. Strict Horizontal Row Alignment & S.N. Anchoring: You must perform a precise, strict horizontal visual sweep. Use the Serial Number (S.N.) in the first column (e.g., 1, 2, 3, etc.) as a strict visual anchor. Verify that the 'desc', 'qty', 'unit', and 'price' all align perfectly on the exact same physical horizontal line of the bill for that serial number. Never mismatch columns (e.g., never associate the Price or Qty of one item with the Description of the row above or below it).
4. Logical Reconstruction for Blurred/Low-Quality Text: If parts of the text are blurred, smeared, or faint, use deep hardware store domain intelligence to logically reconstruct the full correct name. For example, if you see "NAI... 3\\" X 8 ... SPARK", reconstruct it as "NAILS 3\\" X 8 10 PKT/ CASE SPARK". Never output truncated or incomplete fragments.
5. "qty": Extract the clean numerical quantity (e.g. 37.40, 3.00, 1). Parse it strictly as a clean number.
6. "unit": Standardize the unit to match one of the standard hardware units: Pcs, Kgs, Bag, Pkt's, ROLL, Tin's, Drm, Jar, Dozen, Case, Mtr.
7. "price": Extract the clean numerical unit price.
8. Zero Mistakes Audit: Before outputting, cross-verify all values. If a total item amount is visible in the row, ensure that parsed Qty * Price matches the total. If they differ slightly, use human logic to choose the most correct base values. Do not capture totals, taxes, or headers as individual items.

Format: Return strictly a valid raw JSON array of objects with keys: "desc", "qty", "unit", "price". Do not wrap the JSON in markdown code blocks or write any other conversational text. Return ONLY the valid JSON array.`;

filesToPatch.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  console.log(`Repairing and patching prompts in ${filePath}...`);

  // Normalize line endings to Unix style LF
  content = content.replace(/\r\n/g, '\n');

  // Match the entire double-quoted text: "Analyze this image ... valid JSON array." 
  // We handle potential syntax-broken files by matching from the text: keyword to the closing statement.
  const promptAssignmentRegex = /text:\s*"Analyze this image[\s\S]*?Return ONLY the valid JSON array\."/g;

  if (promptAssignmentRegex.test(content)) {
    content = content.replace(promptAssignmentRegex, `text: ${JSON.stringify(improvedPromptWithAlignment)}`);
    console.log('  -> Visual alignment prompts repaired & successfully patched.');
  } else {
    // Fallback: If the syntax error broke the matching, let's restore the clean backup file from git or try a looser regex
    console.warn('  -> WARNING: Visual alignment prompts assignment NOT matched. Attempting loose matching...');
    const looseRegex = /text:\s*"Analyze[\s\S]*?Return ONLY the valid JSON array\."/g;
    if (looseRegex.test(content)) {
      content = content.replace(looseRegex, `text: ${JSON.stringify(improvedPromptWithAlignment)}`);
      console.log('  -> Loose matched prompt successfully repaired.');
    } else {
      console.error('  -> ERROR: All prompt matches failed.');
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Finished patching ${filePath}\n`);
});

console.log("OCR Prompt Alignment repair and patching complete!");
