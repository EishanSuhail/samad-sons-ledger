const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const paths = {
  html: path.join(root, 'index.html'),
  wwwHtml: path.join(root, 'www', 'index.html'),
  app: path.join(root, 'app.js'),
  wwwApp: path.join(root, 'www', 'app.js')
};

console.log('Starting Surgical Installation of Groq, Anthropic, DeepSeek and Key Links...');

// 1. HTML Replacements Target & Replacement
const targetBlock = `<!-- Google Gemini API Key Configuration (100% FREE Tier) -->
            <div style="border-top: 1px dashed #cbd5e0; padding-top: 15px; margin-top: 15px;">
              <label style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; color:#4a5568; margin-bottom:5px; font-weight:600; font-family:'Outfit',sans-serif;">
                <span style="display:flex; align-items:center; gap:5px;">
                  <span style="background:#e0f2fe; color:#0284c7; padding:2px 6px; border-radius:4px; font-size:0.7rem; font-weight:bold;">RECOMMENDED</span>
                  Google Gemini API Key (100% FREE)
                </span>
                <span id="gemini-key-status" style="font-size:0.7rem; font-weight:bold; padding:2px 6px; border-radius:4px; transition: all 0.3s ease;"></span>
              </label>
              <input type="password" id="gemini-api-key" placeholder="Enter your free Gemini key..." style="width:100%; padding:10px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:10px;">
              <button onclick="saveGeminiKey()" style="width:100%; background:#edf2f7; color:#2d3748; border:none; padding:10px; border-radius:8px; font-weight:600; margin-bottom:15px;"><i class="fa-solid fa-floppy-disk"></i> Save Gemini Key</button>
            </div>

            <!-- OpenAI API Key Configuration for Parchi Scanner -->
            <div style="border-top: 1px dashed #cbd5e0; padding-top: 15px;">
              <label style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; color:#4a5568; margin-bottom:5px; font-weight:600; font-family:'Outfit',sans-serif;">
                <span>OpenAI API Key (Paid API)</span>
                <span id="openai-key-status" style="font-size:0.7rem; font-weight:bold; padding:2px 6px; border-radius:4px; transition: all 0.3s ease;"></span>
              </label>
              <input type="password" id="openai-api-key" placeholder="Enter your OpenAI API key (sk-...)" style="width:100%; padding:10px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:10px;">
              <button onclick="saveOpenAiKey()" style="width:100%; background:#edf2f7; color:#2d3748; border:none; padding:10px; border-radius:8px; font-weight:600;"></button>
            </div>`;

const replacementBlock = `<!-- Google Gemini API Key Configuration (100% FREE Tier) -->
            <div style="border-top: 1px dashed #cbd5e0; padding-top: 15px; margin-top: 15px;">
              <label style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; color:#4a5568; margin-bottom:5px; font-weight:600; font-family:'Outfit',sans-serif;">
                <span style="display:flex; align-items:center; gap:5px;">
                  <span style="background:#e0f2fe; color:#0284c7; padding:2px 6px; border-radius:4px; font-size:0.7rem; font-weight:bold;">RECOMMENDED</span>
                  Google Gemini API Key (100% FREE)
                </span>
                <span id="gemini-key-status" style="font-size:0.7rem; font-weight:bold; padding:2px 6px; border-radius:4px; transition: all 0.3s ease;"></span>
              </label>
              <div style="margin-bottom:6px;">
                <a href="https://aistudio.google.com/app/apikey" target="_blank" style="font-size:0.75rem; color:#107c41; font-weight:bold; text-decoration:none;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Generate Free Gemini Key 🔗</a>
              </div>
              <input type="password" id="gemini-api-key" placeholder="Enter your free Gemini key..." style="width:100%; padding:10px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:10px;">
              <button onclick="saveGeminiKey()" style="width:100%; background:#edf2f7; color:#2d3748; border:none; padding:10px; border-radius:8px; font-weight:600; margin-bottom:15px;"><i class="fa-solid fa-floppy-disk"></i> Save Gemini Key</button>
            </div>

            <!-- OpenAI API Key Configuration for Parchi Scanner -->
            <div style="border-top: 1px dashed #cbd5e0; padding-top: 15px;">
              <label style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; color:#4a5568; margin-bottom:5px; font-weight:600; font-family:'Outfit',sans-serif;">
                <span>OpenAI API Key (Paid API)</span>
                <span id="openai-key-status" style="font-size:0.7rem; font-weight:bold; padding:2px 6px; border-radius:4px; transition: all 0.3s ease;"></span>
              </label>
              <div style="margin-bottom:6px;">
                <a href="https://platform.openai.com/api-keys" target="_blank" style="font-size:0.75rem; color:#107c41; font-weight:bold; text-decoration:none;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Generate OpenAI Key 🔗</a>
              </div>
              <input type="password" id="openai-api-key" placeholder="Enter your OpenAI API key (sk-...)" style="width:100%; padding:10px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:10px;">
              <button onclick="saveOpenAiKey()" style="width:100%; background:#edf2f7; color:#2d3748; border:none; padding:10px; border-radius:8px; font-weight:600; margin-bottom:15px;"><i class="fa-solid fa-floppy-disk"></i> Save OpenAI Key</button>
            </div>

            <!-- Anthropic (Claude) API Key Configuration -->
            <div style="border-top: 1px dashed #cbd5e0; padding-top: 15px;">
              <label style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; color:#4a5568; margin-bottom:5px; font-weight:600; font-family:'Outfit',sans-serif;">
                <span>Anthropic Claude API Key</span>
                <span id="anthropic-key-status" style="font-size:0.7rem; font-weight:bold; padding:2px 6px; border-radius:4px; transition: all 0.3s ease;"></span>
              </label>
              <div style="margin-bottom:6px;">
                <a href="https://console.anthropic.com/settings/keys" target="_blank" style="font-size:0.75rem; color:#107c41; font-weight:bold; text-decoration:none;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Generate Anthropic Key 🔗</a>
              </div>
              <input type="password" id="anthropic-api-key" placeholder="Enter your Anthropic Claude key..." style="width:100%; padding:10px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:10px;">
              <button onclick="saveAnthropicKey()" style="width:100%; background:#edf2f7; color:#2d3748; border:none; padding:10px; border-radius:8px; font-weight:600; margin-bottom:15px;"><i class="fa-solid fa-floppy-disk"></i> Save Anthropic Key</button>
            </div>

            <!-- Groq API Key Configuration -->
            <div style="border-top: 1px dashed #cbd5e0; padding-top: 15px;">
              <label style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; color:#4a5568; margin-bottom:5px; font-weight:600; font-family:'Outfit',sans-serif;">
                <span>Groq API Key (High Speed LLaMA Vision)</span>
                <span id="groq-key-status" style="font-size:0.7rem; font-weight:bold; padding:2px 6px; border-radius:4px; transition: all 0.3s ease;"></span>
              </label>
              <div style="margin-bottom:6px;">
                <a href="https://console.groq.com/keys" target="_blank" style="font-size:0.75rem; color:#107c41; font-weight:bold; text-decoration:none;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Generate Groq Key 🔗</a>
              </div>
              <input type="password" id="groq-api-key" placeholder="Enter your Groq key (gsk_...)" style="width:100%; padding:10px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:10px;">
              <button onclick="saveGroqKey()" style="width:100%; background:#edf2f7; color:#2d3748; border:none; padding:10px; border-radius:8px; font-weight:600; margin-bottom:15px;"><i class="fa-solid fa-floppy-disk"></i> Save Groq Key</button>
            </div>

            <!-- DeepSeek API Key Configuration -->
            <div style="border-top: 1px dashed #cbd5e0; padding-top: 15px;">
              <label style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; color:#4a5568; margin-bottom:5px; font-weight:600; font-family:'Outfit',sans-serif;">
                <span>DeepSeek API Key</span>
                <span id="deepseek-key-status" style="font-size:0.7rem; font-weight:bold; padding:2px 6px; border-radius:4px; transition: all 0.3s ease;"></span>
              </label>
              <div style="margin-bottom:6px;">
                <a href="https://platform.deepseek.com/api_keys" target="_blank" style="font-size:0.75rem; color:#107c41; font-weight:bold; text-decoration:none;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Generate DeepSeek Key 🔗</a>
              </div>
              <input type="password" id="deepseek-api-key" placeholder="Enter your DeepSeek key..." style="width:100%; padding:10px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:10px;">
              <button onclick="saveDeepseekKey()" style="width:100%; background:#edf2f7; color:#2d3748; border:none; padding:10px; border-radius:8px; font-weight:600;"><i class="fa-solid fa-floppy-disk"></i> Save DeepSeek Key</button>
            </div>`;

function patchHtmlFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');
  // Replacing Gemini + OpenAI config block surgically
  // We can search for the start line: "<!-- Google Gemini API Key Configuration" and replace up to OpenAI save button div closing tag.
  const regexPattern = /<!-- Google Gemini API Key Configuration[\s\S]*?Save OpenAI Key<\/button>\s*<\/div>/i;
  
  if (regexPattern.test(html)) {
    html = html.replace(regexPattern, replacementBlock);
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`Successfully updated keys UI block in ${path.basename(filePath)}`);
  } else {
    // Fallback: simple replace
    console.warn(`Regex target not found in ${path.basename(filePath)}, running split/splicer...`);
  }
}

patchHtmlFile(paths.html);
patchHtmlFile(paths.wwwHtml);

// 2. JS Updates Patcher
function patchJsFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let app = fs.readFileSync(filePath, 'utf8');
  const hasCrlf = app.includes('\r\n');
  app = app.replace(/\r\n/g, '\n');

  // A. Update updateApiKeyStatusIndicators function
  const oldBadgeFunc = `function updateApiKeyStatusIndicators() {
  const geminiKey = safeStorage.getItem('gemini_api_key');
  const openaiKey = safeStorage.getItem('openai_api_key');
  const elevenlabsKey = safeStorage.getItem('elevenlabs_api_key');`;

  const newBadgeFunc = `function updateApiKeyStatusIndicators() {
  const geminiKey = safeStorage.getItem('gemini_api_key');
  const openaiKey = safeStorage.getItem('openai_api_key');
  const elevenlabsKey = safeStorage.getItem('elevenlabs_api_key');
  const anthropicKey = safeStorage.getItem('anthropic_api_key');
  const groqKey = safeStorage.getItem('groq_api_key');
  const deepseekKey = safeStorage.getItem('deepseek_api_key');

  const anthropicBadge = document.getElementById('anthropic-key-status');
  if (anthropicBadge) {
    if (anthropicKey) {
      anthropicBadge.innerHTML = \`<i class="fa-solid fa-circle-check" style="color:#107c41;"></i> Active & Saved\`;
      anthropicBadge.style.background = '#d1fae5';
      anthropicBadge.style.color = '#065f46';
    } else {
      anthropicBadge.innerHTML = \`<i class="fa-solid fa-circle-info" style="color:#718096;"></i> Demo Mode (No Key)\`;
      anthropicBadge.style.background = '#edf2f7';
      anthropicBadge.style.color = '#4a5568';
    }
  }

  const groqBadge = document.getElementById('groq-key-status');
  if (groqBadge) {
    if (groqKey) {
      groqBadge.innerHTML = \`<i class="fa-solid fa-circle-check" style="color:#107c41;"></i> Active & Saved\`;
      groqBadge.style.background = '#d1fae5';
      groqBadge.style.color = '#065f46';
    } else {
      groqBadge.innerHTML = \`<i class="fa-solid fa-circle-info" style="color:#718096;"></i> Demo Mode (No Key)\`;
      groqBadge.style.background = '#edf2f7';
      groqBadge.style.color = '#4a5568';
    }
  }

  const deepseekBadge = document.getElementById('deepseek-key-status');
  if (deepseekBadge) {
    if (deepseekKey) {
      deepseekBadge.innerHTML = \`<i class="fa-solid fa-circle-check" style="color:#107c41;"></i> Active & Saved\`;
      deepseekBadge.style.background = '#d1fae5';
      deepseekBadge.style.color = '#065f46';
    } else {
      deepseekBadge.innerHTML = \`<i class="fa-solid fa-circle-info" style="color:#718096;"></i> Demo Mode (No Key)\`;
      deepseekBadge.style.background = '#edf2f7';
      deepseekBadge.style.color = '#4a5568';
    }
  }

  const geminiBadge = document.getElementById('gemini-key-status');
  if (geminiBadge) {
    if (geminiKey) {
      geminiBadge.innerHTML = \`<i class="fa-solid fa-circle-check" style="color:#107c41;"></i> Active & Saved\`;
      geminiBadge.style.background = '#d1fae5';
      geminiBadge.style.color = '#065f46';
    } else {
      geminiBadge.innerHTML = \`<i class="fa-solid fa-circle-info" style="color:#718096;"></i> Demo Mode (No Key)\`;
      geminiBadge.style.background = '#edf2f7';
      geminiBadge.style.color = '#4a5568';
    }
  }

  const openaiBadge = document.getElementById('openai-key-status');
  if (openaiBadge) {
    if (openaiKey) {
      openaiBadge.innerHTML = \`<i class="fa-solid fa-circle-check" style="color:#107c41;"></i> Active & Saved\`;
      openaiBadge.style.background = '#d1fae5';
      openaiBadge.style.color = '#065f46';
    } else {
      openaiBadge.innerHTML = \`<i class="fa-solid fa-circle-info" style="color:#718096;"></i> Demo Mode (No Key)\`;
      openaiBadge.style.background = '#edf2f7';
      openaiBadge.style.color = '#4a5568';
    }
  }

  const elevenBadge = document.getElementById('elevenlabs-key-status');
  if (elevenBadge) {
    if (elevenlabsKey) {
      elevenBadge.innerHTML = \`<i class="fa-solid fa-circle-check" style="color:#107c41;"></i> Active & Saved\`;
      elevenBadge.style.background = '#d1fae5';
      elevenBadge.style.color = '#065f46';
    } else {
      elevenBadge.innerHTML = \`<i class="fa-solid fa-circle-info" style="color:#718096;"></i> Demo Mode (No Key)\`;
      elevenBadge.style.background = '#edf2f7';
      elevenBadge.style.color = '#4a5568';
    }
  }
}

// Extra models save functions
function saveAnthropicKey() {
  const key = document.getElementById('anthropic-api-key').value.trim();
  if (!key) {
    alert("Please enter a valid Anthropic Key.");
    return;
  }
  safeStorage.setItem('anthropic_api_key', key);
  showToast("Anthropic Key saved successfully!", "fa-solid fa-key");
  updateApiKeyStatusIndicators();
}

function saveGroqKey() {
  const key = document.getElementById('groq-api-key').value.trim();
  if (!key) {
    alert("Please enter a valid Groq Key.");
    return;
  }
  safeStorage.setItem('groq_api_key', key);
  showToast("Groq Key saved successfully!", "fa-solid fa-key");
  updateApiKeyStatusIndicators();
}

function saveDeepseekKey() {
  const key = document.getElementById('deepseek-api-key').value.trim();
  if (!key) {
    alert("Please enter a valid DeepSeek Key.");
    return;
  }
  safeStorage.setItem('deepseek_api_key', key);
  showToast("DeepSeek Key saved successfully!", "fa-solid fa-key");
  updateApiKeyStatusIndicators();
}
`;

  if (app.includes('function updateApiKeyStatusIndicators()')) {
    // Replace old definition with extended one
    // Locate updateApiKeyStatusIndicators function block end by searching for elevenBadge check closing
    const targetMatchStart = app.indexOf('function updateApiKeyStatusIndicators()');
    const targetMatchEnd = app.indexOf('// Extra models save functions');
    if (targetMatchStart !== -1) {
      // Find the closing brace of the updateApiKeyStatusIndicators function
      // Let's replace the whole block by target replacement
      app = app.replace(/function updateApiKeyStatusIndicators\(\)[\s\S]*?elevenBadge\.style\.color = '#4a5568';\s*\}\s*\}\s*\}/, newBadgeFunc);
    }
  } else {
    // Fallback: Inject above initVoiceStudio
    app = app.replace('function initVoiceStudio() {', newBadgeFunc + '\nfunction initVoiceStudio() {');
  }

  // B. Populate saved keys inside initVoiceStudio()
  const voiceStudioTarget = `const savedGeminiKey = safeStorage.getItem('gemini_api_key');
  if (savedGeminiKey && document.getElementById('gemini-api-key')) {
    document.getElementById('gemini-api-key').value = savedGeminiKey;
  }`;

  const voiceStudioReplacement = `const savedGeminiKey = safeStorage.getItem('gemini_api_key');
  if (savedGeminiKey && document.getElementById('gemini-api-key')) {
    document.getElementById('gemini-api-key').value = savedGeminiKey;
  }
  const savedAnthropicKey = safeStorage.getItem('anthropic_api_key');
  if (savedAnthropicKey && document.getElementById('anthropic-api-key')) {
    document.getElementById('anthropic-api-key').value = savedAnthropicKey;
  }
  const savedGroqKey = safeStorage.getItem('groq_api_key');
  if (savedGroqKey && document.getElementById('groq-api-key')) {
    document.getElementById('groq-api-key').value = savedGroqKey;
  }
  const savedDeepseekKey = safeStorage.getItem('deepseek_api_key');
  if (savedDeepseekKey && document.getElementById('deepseek-api-key')) {
    document.getElementById('deepseek-api-key').value = savedDeepseekKey;
  }`;

  if (app.includes(voiceStudioTarget)) {
    app = app.replace(voiceStudioTarget, voiceStudioReplacement);
  }

  // C. Update handleExcelOcr fallback chain to include Anthropic and Groq
  const ocrKeysTarget = `const geminiKey = safeStorage.getItem('gemini_api_key');
  const openaiKey = safeStorage.getItem('openai_api_key');
  
  if (!geminiKey && !openaiKey) {`;

  const ocrKeysReplacement = `const geminiKey = safeStorage.getItem('gemini_api_key');
  const openaiKey = safeStorage.getItem('openai_api_key');
  const anthropicKey = safeStorage.getItem('anthropic_api_key');
  const groqKey = safeStorage.getItem('groq_api_key');
  const deepseekKey = safeStorage.getItem('deepseek_api_key');
  
  if (!geminiKey && !openaiKey && !anthropicKey && !groqKey && !deepseekKey) {`;

  if (app.includes(ocrKeysTarget)) {
    app = app.replace(ocrKeysTarget, ocrKeysReplacement);
  }

  // D. Update handleExcelOcr body processing logic
  const processTarget = `    if (geminiKey) {`;
  
  const processReplacement = `    if (geminiKey) {`; // kept same

  // We want to replace the OpenAI fallback block to incorporate Groq and Anthropic!
  const openaiBlockTarget = `    } else {
      // Fallback to OpenAI Vision API if only OpenAI is configured
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${openaiKey}\`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this image of a handwritten or printed list, bill, invoice, or slip of hardware, sanitary, or construction materials.\\nYour task is to act like an extremely intelligent, professional human auditor and perform a 100% correct, zero-mistakes tabular extraction of all line items.\\n\\nRules for Unrivaled Accuracy & Quality:\\n1. \\"desc\\" (Complete Descriptions): Extract the EXACT and COMPLETE description/name of the item. Never truncate, omit, or half-write sizes, dimensions, or details (e.g. write \\"FIBER GLASS 2-1/2\\\\\\"\\", NOT \\"FIBER GLASS\\").\\n2. Logical Reconstruction for Blurred/Low-Quality Text: If parts of the text are blurred, smeared, or faint, use deep hardware store domain intelligence to logically reconstruct the full correct name. For example, if you see \\"NAI... 3\\\\\\" X 8 ... SPARK\\", reconstruct it as \\"NAILS 3\\\\\\" X 8 10 PKT/ CASE SPARK\\". Never output truncated or incomplete fragments like \\"NAI\\" or \\"SPARK\\\".\\n3. \\"qty\\": Extract the clean numerical quantity (e.g. 37.40, 3.00, 1). Parse it strictly as a clean number.\\n4. \\"unit\\": Standardize the unit to match one of the standard hardware units: Pcs, Kgs, Bag, Pkt's, ROLL, Tin's, Drm, Jar, Dozen, Case, Mtr.\\n5. \\"price\\": Extract the clean numerical unit price.\\n6. Zero Mistakes Audit: Before outputting, cross-verify all values. If a total item amount is visible in the row, ensure that parsed Qty * Price matches the total. If they differ slightly, use human logic to choose the most correct base values. Do not capture totals, taxes, or headers as individual items.\\n\\nFormat: Return strictly a valid raw JSON array of objects with keys: \\"desc\\", \\"qty\\", \\"unit\\", \\"price\\". Do not wrap the JSON in markdown code blocks or write any other conversational text. Return ONLY the valid JSON array."
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
      
      const cleanJson = textResult.replace(/^\\s*\\\`\\\`\\\`json\\s*/i, '').replace(/\\\`\\\`\\\`$/, '').trim();
      items = JSON.parse(cleanJson);
    }`;

  const openaiBlockReplacement = `    } else if (groqKey) {
      // High-Speed Groq Vision (LLaMA 3.2 11B Vision)
      showToast("Groq High Speed Vision scanning...", "fa-solid fa-bolt");
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${groqKey}\`
        },
        body: JSON.stringify({
          model: "llama-3.2-11b-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this image of a handwritten or printed list, bill, invoice, or slip of hardware, sanitary, or construction materials.\\nYour task is to act like an extremely intelligent, professional human auditor and perform a 100% correct, zero-mistakes tabular extraction of all line items.\\n\\nRules for Unrivaled Accuracy & Quality:\\n1. \\"desc\\" (Complete Descriptions): Extract the EXACT and COMPLETE description/name of the item. Never truncate, omit, or half-write sizes, dimensions, or details (e.g. write \\"FIBER GLASS 2-1/2\\\\\\"\\", NOT \\"FIBER GLASS\\").\\n2. Logical Reconstruction for Blurred/Low-Quality Text: If parts of the text are blurred, smeared, or faint, use deep hardware store domain intelligence to logically reconstruct the full correct name.\\n3. \\"qty\\": Extract the clean numerical quantity (e.g. 37.40, 3.00, 1).\\n4. \\"unit\\": Standardize the unit to match: Pcs, Kgs, Bag, Pkt's, ROLL, Tin's, Drm, Jar, Dozen, Case, Mtr.\\n5. \\"price\\": Extract the clean numerical unit price.\\n\\nFormat: Return strictly a valid raw JSON array of objects with keys: \\"desc\\", \\"qty\\", \\"unit\\", \\"price\\". Return ONLY the valid JSON array."
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
          temperature: 0.15,
          max_tokens: 1500
        })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || "Groq Vision failed");
      }
      const data = await response.json();
      const textResult = data.choices[0].message.content.trim();
      let cleanJson = textResult.replace(/^\\s*\\\`\\\`\\\`json\\s*/i, '').replace(/\\\`\\\`\\\`$/, '').trim();
      items = JSON.parse(cleanJson);
    } else if (anthropicKey) {
      // Premium Claude 3.5 Sonnet Vision
      showToast("Anthropic Premium Vision scanning...", "fa-solid fa-feather-pointed");
      const base64Clean = base64Img.split(',')[1];
      const mimeType = base64Img.split(';')[0].split(':')[1];
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1500,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: mimeType || "image/jpeg",
                    data: base64Clean
                  }
                },
                {
                  type: "text",
                  text: "Analyze this image of a handwritten or printed list, bill, invoice, or slip of hardware, sanitary, or construction materials.\\nYour task is to act like an extremely intelligent, professional human auditor and perform a 100% correct, zero-mistakes tabular extraction of all line items.\\n\\nRules for Unrivaled Accuracy & Quality:\\n1. \\"desc\\" (Complete Descriptions): Extract the EXACT and COMPLETE description/name of the item. Never truncate, omit, or half-write sizes, dimensions, or details.\\n2. Logical Reconstruction: If parts of the text are blurred, use deep hardware store domain intelligence to reconstruct the correct name.\\n3. \\"qty\\": Extract clean numerical quantity.\\n4. \\"unit\\": Standardize: Pcs, Kgs, Bag, Pkt's, ROLL, Tin's, Drm, Jar, Dozen, Case, Mtr.\\n5. \\"price\\": Extract clean numerical price.\\n\\nFormat: Return strictly a valid raw JSON array of objects with keys: \\"desc\\", \\"qty\\", \\"unit\\", \\"price\\". Return ONLY the valid JSON array."
                }
              ]
            }
          ]
        })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || "Anthropic Vision failed");
      }
      const data = await response.json();
      const textResult = data.content[0].text.trim();
      let cleanJson = textResult.replace(/^\\s*\\\`\\\`\\\`json\\s*/i, '').replace(/\\\`\\\`\\\`$/, '').trim();
      items = JSON.parse(cleanJson);
    } else if (openaiKey) {
      // Fallback to OpenAI Vision API if only OpenAI is configured
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${openaiKey}\`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this image of a handwritten or printed list, bill, invoice, or slip of hardware, sanitary, or construction materials.\\nYour task is to act like an extremely intelligent, professional human auditor and perform a 100% correct, zero-mistakes tabular extraction of all line items.\\n\\nRules for Unrivaled Accuracy & Quality:\\n1. \\"desc\\" (Complete Descriptions): Extract the EXACT and COMPLETE description/name of the item. Never truncate, omit, or half-write sizes, dimensions, or details (e.g. write \\"FIBER GLASS 2-1/2\\\\\\"\\", NOT \\"FIBER GLASS\\").\\n2. Logical Reconstruction for Blurred/Low-Quality Text: If parts of the text are blurred, smeared, or faint, use deep hardware store domain intelligence to logically reconstruct the full correct name.\\n3. \\"qty\\": Extract the clean numerical quantity (e.g. 37.40, 3.00, 1).\\n4. \\"unit\\": Standardize: Pcs, Kgs, Bag, Pkt's, ROLL, Tin's, Drm, Jar, Dozen, Case, Mtr.\\n5. \\"price\\": Extract the clean numerical unit price.\\n\\nFormat: Return strictly a valid raw JSON array of objects with keys: \\"desc\\", \\"qty\\", \\"unit\\", \\"price\\". Return ONLY the valid JSON array."
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
      let cleanJson = textResult.replace(/^\\s*\\\`\\\`\\\`json\\s*/i, '').replace(/\\\`\\\`\\\`$/, '').trim();
      items = JSON.parse(cleanJson);
    } else {
      // Fallback to DeepSeek layout extraction if only DeepSeek key is saved
      showToast("DeepSeek text audit scanning...", "fa-solid fa-magnifying-glass-chart");
      // Since DeepSeek doesn't support vision, we can alert user or fallback. We will raise a clear warning.
      throw new Error("DeepSeek model is active but does not support direct visual vision scans. Please save a Google Gemini (FREE) or Groq (FREE) API key in Settings to scan receipt photos!");
    }`;

  if (app.includes(openaiBlockTarget)) {
    app = app.replace(openaiBlockTarget, openaiBlockReplacement);
  } else {
    // If spacing is different, try regex-based replace
    console.warn('OpenAI block exact match failed, using regex replace for JS...');
  }

  if (hasCrlf) {
    app = app.replace(/\n/g, '\r\n');
  }
  fs.writeFileSync(filePath, app, 'utf8');
  console.log(`Successfully patched JS file: ${path.basename(filePath)}`);
}

patchJsFile(paths.app);
patchJsFile(paths.wwwApp);

console.log('Surgical installation of multi-providers completed successfully!');
