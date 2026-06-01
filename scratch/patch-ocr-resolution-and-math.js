const fs = require('fs');
const path = require('path');

const filesToPatch = [
  path.join(__dirname, '..', 'app.js'),
  path.join(__dirname, '..', 'www', 'app.js')
];

const improvedPromptWithMath = `Analyze this image of a handwritten or printed list, bill, invoice, or slip of hardware, sanitary, or construction materials.
Your task is to act like an extremely intelligent, professional human auditor and perform a 100% correct, zero-mistakes tabular extraction of all line items.

Rules for Unrivaled Accuracy & Quality:
1. "desc" (Complete Descriptions): Extract the EXACT, FULL and COMPLETE description/name of the item. Never truncate, omit, or half-write brand names, sizes, dimensions, or details. For example, if you see "4 inch b-type pvc pipe lotus", you must write EXACTLY "4 inch b-type pvc pipe lotus" (capturing the size "4 inch", the specification "b-type pvc pipe", and the brand "lotus"). Never shorten it to "4 inch b-type pvc" or "pvc pipe".
2. Brand and Specification Preservation: Brand names (e.g. "Lotus", "Finolex", "Supreme", "Spark", "P.Gold", etc.), type classes (e.g. "B-type", "A-class", "EX HY"), and descriptive specifications (e.g. "pipe", "bend", "elbow", "socket") must ALWAYS be captured completely. Never drop any word from the original description.
3. Strict Horizontal Row Alignment & S.N. Anchoring: You must perform a precise, strict horizontal visual sweep. Use the Serial Number (S.N.) in the first column (e.g., 1, 2, 3, etc.) as a strict visual anchor. Verify that the 'desc', 'qty', 'unit', and 'price' all align perfectly on the exact same physical horizontal line of the bill for that serial number. Never mismatch columns (e.g., never associate the Price or Qty of one item with the Description of the row above or below it).
4. Mathematical Row Verification (Anti-Mismatch Rule): The bill contains an "Amount" column on the far right. For every single extracted row, you must cross-verify that the extracted Qty * extracted Price matches the Amount printed on that exact same horizontal line. If they do not match, it means you have associated the Price or Qty from a different line above or below. In this case, immediately re-align your visual sweep and correct the values so that Qty * Price = Amount holds true for all rows.
5. Logical Reconstruction for Blurred/Low-Quality Text: If parts of the text are blurred, smeared, or faint, use deep hardware store domain intelligence to logically reconstruct the full correct name. For example, if you see "NAI... 3\\" X 8 ... SPARK", reconstruct it as "NAILS 3\\" X 8 10 PKT/ CASE SPARK". Never output truncated or incomplete fragments.
6. "qty": Extract the clean numerical quantity (e.g. 37.40, 3.00, 1). Parse it strictly as a clean number.
7. "unit": Standardize the unit to match one of the standard hardware units: Pcs, Kgs, Bag, Pkt's, ROLL, Tin's, Drm, Jar, Dozen, Case, Mtr.
8. "price": Extract the clean numerical unit price.
9. Zero Mistakes Audit: Before outputting, cross-verify all values. If a total item amount is visible in the row, ensure that parsed Qty * Price matches the total. If they differ slightly, use human logic to choose the most correct base values. Do not capture totals, taxes, or headers as individual items.

Format: Return strictly a valid raw JSON array of objects with keys: "desc", "qty", "unit", "price". Do not wrap the JSON in markdown code blocks or write any other conversational text. Return ONLY the valid JSON array.`;

filesToPatch.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  console.log(`Repairing and patching prompts/resolution in ${filePath}...`);

  // Normalize line endings to Unix style LF
  content = content.replace(/\r\n/g, '\n');

  // 1. Patch compressAndResizeImage function (if not already patched, let's keep it safe)
  const compressTarget = `function compressAndResizeImage(file, maxWidth = 1200, maxHeight = 1200) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress as JPEG at 70% quality (ideal balance of size and OCR precision)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(new Error("Image loading failed: " + err.message));
    };
    reader.onerror = (err) => reject(new Error("File reading failed: " + err.message));
  });
}`;

  const compressReplacement = `function compressAndResizeImage(file, maxWidth = 2000, maxHeight = 2000) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress as JPEG at 85% quality for ultra-sharp OCR precision and clear row alignment
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(new Error("Image loading failed: " + err.message));
    };
    reader.onerror = (err) => reject(new Error("File reading failed: " + err.message));
  });
}`;

  if (content.includes(compressTarget)) {
    content = content.replace(compressTarget, compressReplacement);
    console.log('  -> compressAndResizeImage patched successfully.');
  } else {
    console.log('  -> compressAndResizeImage already patched or target not found.');
  }

  // 2. Patch Vision AI Prompts (foolproof JSON.stringify approach)
  // Match `text: "Analyze ... JSON array."` (which may be broken right now)
  const promptAssignmentRegex = /text:\s*"Analyze[\s\S]*?Return ONLY the valid JSON array\."/g;

  if (promptAssignmentRegex.test(content)) {
    content = content.replace(promptAssignmentRegex, `text: ${JSON.stringify(improvedPromptWithMath)}`);
    console.log('  -> Prompts successfully repaired and patched with horizontal sweep & mathematical verification rules.');
  } else {
    console.error('  -> ERROR: Failed to match prompt pattern.');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Finished patching ${filePath}\n`);
});

console.log("Resolution and Math patching complete!");
