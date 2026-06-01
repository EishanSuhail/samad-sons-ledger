const fs = require('fs');
const path = require('path');

const filesToPatch = [
  path.join(__dirname, '..', 'app.js'),
  path.join(__dirname, '..', 'www', 'app.js')
];

const improvedPrompt = `Analyze this image of a handwritten or printed list, bill, invoice, or slip of hardware, sanitary, or construction materials.
Your task is to act like an extremely intelligent, professional human auditor and perform a 100% correct, zero-mistakes tabular extraction of all line items.

Rules for Unrivaled Accuracy & Quality:
1. "desc" (Complete Descriptions): Extract the EXACT, FULL and COMPLETE description/name of the item. Never truncate, omit, or half-write brand names, sizes, dimensions, or details. For example, if you see "4 inch b-type pvc pipe lotus", you must write EXACTLY "4 inch b-type pvc pipe lotus" (capturing the size "4 inch", the specification "b-type pvc pipe", and the brand "lotus"). Never shorten it to "4 inch b-type pvc" or "pvc pipe".
2. Brand and Specification Preservation: Brand names (e.g. "Lotus", "Finolex", "Supreme", "Spark", "P.Gold", etc.), type classes (e.g. "B-type", "A-class", "EX HY"), and descriptive specifications (e.g. "pipe", "bend", "elbow", "socket") must ALWAYS be captured completely. Never drop any word from the original description.
3. Logical Reconstruction for Blurred/Low-Quality Text: If parts of the text are blurred, smeared, or faint, use deep hardware store domain intelligence to logically reconstruct the full correct name. For example, if you see "NAI... 3\\" X 8 ... SPARK", reconstruct it as "NAILS 3\\" X 8 10 PKT/ CASE SPARK". Never output truncated or incomplete fragments.
4. "qty": Extract the clean numerical quantity (e.g. 37.40, 3.00, 1). Parse it strictly as a clean number.
5. "unit": Standardize the unit to match one of the standard hardware units: Pcs, Kgs, Bag, Pkt's, ROLL, Tin's, Drm, Jar, Dozen, Case, Mtr.
6. "price": Extract the clean numerical unit price.
7. Zero Mistakes Audit: Before outputting, cross-verify all values. If a total item amount is visible in the row, ensure that parsed Qty * Price matches the total. If they differ slightly, use human logic to choose the most correct base values. Do not capture totals, taxes, or headers as individual items.

Format: Return strictly a valid raw JSON array of objects with keys: "desc", "qty", "unit", "price". Do not wrap the JSON in markdown code blocks or write any other conversational text. Return ONLY the valid JSON array.`;

filesToPatch.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  console.log(`Patching ${filePath}...`);

  // Normalize line endings to Unix style LF
  content = content.replace(/\r\n/g, '\n');

  // 1. Patch HARDWARE_VOCABULARY
  const vocabTarget = `const HARDWARE_VOCABULARY = {
  "cament": "Cement",
  "cement": "Cement",
  "nail": "Nails",
  "nil": "Nails",
  "nails": "Nails",
  "fibe": "Fiber Glass",
  "fiber": "Fiber Glass",
  "fevicol": "Fevicol SH",
  "pvc": "PVC Pipe",
  "pipe": "SS Pipe",
  "wire": "Binding Wire",
  "regmal": "Regmal Velcro Paper",
  "glass": "Fiber Glass"
};`;

  const vocabReplacement = `const HARDWARE_VOCABULARY = {
  "cament": "Cement",
  "nil": "Nails",
  "fibe": "Fiber Glass",
  "fevicol": "Fevicol",
  "regmal": "Regmal"
};`;

  if (content.includes(vocabTarget)) {
    content = content.replace(vocabTarget, vocabReplacement);
    console.log('  -> HARDWARE_VOCABULARY patched successfully.');
  } else {
    console.warn('  -> WARNING: HARDWARE_VOCABULARY target NOT found.');
  }

  // 2. Patch Gemini Vision Prompt
  const geminiPromptTarget = `text: "Analyze this image of a handwritten or printed list, bill, invoice, or slip of hardware, sanitary, or construction materials.\\nYour task is to act like an extremely intelligent, professional human auditor and perform a 100% correct, zero-mistakes tabular extraction of all line items.\\n\\nRules for Unrivaled Accuracy & Quality:\\n1. \\"desc\\" (Complete Descriptions): Extract the EXACT and COMPLETE description/name of the item. Never truncate, omit, or half-write sizes, dimensions, or details (e.g. write \\"FIBER GLASS 2-1/2\\\\\\"\\", NOT \\"FIBER GLASS\\").\\n2. Logical Reconstruction for Blurred/Low-Quality Text: If parts of the text are blurred, smeared, or faint, use deep hardware store domain intelligence to logically reconstruct the full correct name. For example, if you see \\"NAI... 3\\\\\\" X 8 ... SPARK\\", reconstruct it as \\"NAILS 3\\\\\\" X 8 10 PKT/ CASE SPARK\\". Never output truncated or incomplete fragments like \\"NAI\\" or \\"SPARK\\\".\\n3. \\"qty\\": Extract the clean numerical quantity (e.g. 37.40, 3.00, 1). Parse it strictly as a clean number.\\n4. \\"unit\\": Standardize the unit to match one of the standard hardware units: Pcs, Kgs, Bag, Pkt's, ROLL, Tin's, Drm, Jar, Dozen, Case, Mtr.\\n5. \\"price\\": Extract the clean numerical unit price.\\n6. Zero Mistakes Audit: Before outputting, cross-verify all values. If a total item amount is visible in the row, ensure that parsed Qty * Price matches the total. If they differ slightly, use human logic to choose the most correct base values. Do not capture totals, taxes, or headers as individual items.\\n\\nFormat: Return strictly a valid raw JSON array of objects with keys: \\"desc\\", \\"qty\\", \\"unit\\", \\"price\\". Do not wrap the JSON in markdown code blocks or write any other conversational text. Return ONLY the valid JSON array."`;

  const geminiPromptReplacement = `text: ${JSON.stringify(improvedPrompt)}`;

  if (content.includes(geminiPromptTarget)) {
    content = content.replace(geminiPromptTarget, geminiPromptReplacement);
    console.log('  -> Gemini Vision Prompt patched successfully.');
  } else {
    console.warn('  -> WARNING: Gemini Vision Prompt target NOT found.');
  }

  // 3. Patch Groq Vision Prompt
  const groqPromptTarget = `text: "Analyze this image of a handwritten or printed list, bill, invoice, or slip of hardware, sanitary, or construction materials.\\nYour task is to act like an extremely intelligent, professional human auditor and perform a 100% correct, zero-mistakes tabular extraction of all line items.\\n\\nRules for Unrivaled Accuracy & Quality:\\n1. \\"desc\\" (Complete Descriptions): Extract the EXACT and COMPLETE description/name of the item. Never truncate, omit, or half-write sizes, dimensions, or details (e.g. write \\"FIBER GLASS 2-1/2\\\\\\"\\", NOT \\"FIBER GLASS\\").\\n2. Logical Reconstruction for Blurred/Low-Quality Text: If parts of the text are blurred, smeared, or faint, use deep hardware store domain intelligence to logically reconstruct the full correct name.\\n3. \\"qty\\": Extract the clean numerical quantity (e.g. 37.40, 3.00, 1).\\n4. \\"unit\\": Standardize the unit to match: Pcs, Kgs, Bag, Pkt's, ROLL, Tin's, Drm, Jar, Dozen, Case, Mtr.\\n5. \\"price\\": Extract the clean numerical unit price.\\n\\nFormat: Return strictly a valid raw JSON array of objects with keys: \\"desc\\", \\"qty\\", \\"unit\\", \\"price\\". Return ONLY the valid JSON array."`;

  const groqPromptReplacement = `text: ${JSON.stringify(improvedPrompt)}`;

  if (content.includes(groqPromptTarget)) {
    content = content.replace(groqPromptTarget, groqPromptReplacement);
    console.log('  -> Groq Vision Prompt patched successfully.');
  } else {
    console.warn('  -> WARNING: Groq Vision Prompt target NOT found.');
  }

  // 4. Patch Anthropic Vision Prompt
  const anthropicPromptTarget = `text: "Analyze this image of a handwritten or printed list, bill, invoice, or slip of hardware, sanitary, or construction materials.\\nYour task is to act like an extremely intelligent, professional human auditor and perform a 100% correct, zero-mistakes tabular extraction of all line items.\\n\\nRules for Unrivaled Accuracy & Quality:\\n1. \\"desc\\" (Complete Descriptions): Extract the EXACT and COMPLETE description/name of the item. Never truncate, omit, or half-write sizes, dimensions, or details.\\n2. Logical Reconstruction: If parts of the text are blurred, use deep hardware store domain intelligence to reconstruct the correct name.\\n3. \\"qty\\": Extract clean numerical quantity.\\n4. \\"unit\\": Standardize: Pcs, Kgs, Bag, Pkt's, ROLL, Tin's, Drm, Jar, Dozen, Case, Mtr.\\n5. \\"price\\": Extract clean numerical price.\\n\\nFormat: Return strictly a valid raw JSON array of objects with keys: \\"desc\\", \\"qty\\", \\"unit\\", \\"price\\". Return ONLY the valid JSON array."`;

  const anthropicPromptReplacement = `text: ${JSON.stringify(improvedPrompt)}`;

  if (content.includes(anthropicPromptTarget)) {
    content = content.replace(anthropicPromptTarget, anthropicPromptReplacement);
    console.log('  -> Anthropic Vision Prompt patched successfully.');
  } else {
    console.warn('  -> WARNING: Anthropic Vision Prompt target NOT found.');
  }

  // 5. Patch OpenAI Vision Prompt
  const openaiPromptTarget = `text: "Analyze this image of a handwritten or printed list, bill, invoice, or slip of hardware, sanitary, or construction materials.\\nYour task is to act like an extremely intelligent, professional human auditor and perform a 100% correct, zero-mistakes tabular extraction of all line items.\\n\\nRules for Unrivaled Accuracy & Quality:\\n1. \\"desc\\" (Complete Descriptions): Extract the EXACT and COMPLETE description/name of the item. Never truncate, omit, or half-write sizes, dimensions, or details (e.g. write \\"FIBER GLASS 2-1/2\\\\\\"\\", NOT \\"FIBER GLASS\\").\\n2. Logical Reconstruction for Blurred/Low-Quality Text: If parts of the text are blurred, smeared, or faint, use deep hardware store domain intelligence to logically reconstruct the full correct name.\\n3. \\"qty\\": Extract the clean numerical quantity (e.g. 37.40, 3.00, 1).\\n4. \\"unit\\": Standardize: Pcs, Kgs, Bag, Pkt's, ROLL, Tin's, Drm, Jar, Dozen, Case, Mtr.\\n5. \\"price\\": Extract the clean numerical unit price.\\n\\nFormat: Return strictly a valid raw JSON array of objects with keys: \\"desc\\", \\"qty\\", \\"unit\\", \\"price\\". Return ONLY the valid JSON array."`;

  const openaiPromptReplacement = `text: ${JSON.stringify(improvedPrompt)}`;

  if (content.includes(openaiPromptTarget)) {
    content = content.replace(openaiPromptTarget, openaiPromptReplacement);
    console.log('  -> OpenAI Vision Prompt patched successfully.');
  } else {
    console.warn('  -> WARNING: OpenAI Vision Prompt target NOT found.');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Finished patching ${filePath}\n`);
});

console.log("OCR Descriptions patching complete!");
