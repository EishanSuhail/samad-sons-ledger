const fs = require('fs');
const path = require('path');

// 1. Patch index.html
const htmlPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Standardize HTML line endings to LF
html = html.replace(/\r\n/g, '\n');

const targetHtml = `            <!-- OpenAI API Key Configuration for Parchi Scanner -->
            <div style="border-top: 1px dashed #cbd5e0; padding-top: 15px; margin-top: 15px;">
              <label style="display:block; font-size:0.85rem; color:#4a5568; margin-bottom:5px; font-weight:600;">OpenAI API Key (For Parchi Scanner)</label>
              <input type="password" id="openai-api-key" placeholder="Enter your OpenAI API key (sk-...)" style="width:100%; padding:10px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:10px;">
              <button onclick="saveOpenAiKey()" style="width:100%; background:#edf2f7; color:#2d3748; border:none; padding:10px; border-radius:8px; font-weight:600;"><i class="fa-solid fa-floppy-disk"></i> Save OpenAI Key</button>
            </div>`;

const newHtml = `            <!-- Google Gemini API Key Configuration (100% FREE Tier) -->
            <div style="border-top: 1px dashed #cbd5e0; padding-top: 15px; margin-top: 15px;">
              <label style="display:block; font-size:0.85rem; color:#4a5568; margin-bottom:5px; font-weight:600; display:flex; align-items:center; gap:5px;">
                <span style="background:#e0f2fe; color:#0284c7; padding:2px 6px; border-radius:4px; font-size:0.7rem; font-weight:bold;">RECOMMENDED</span>
                Google Gemini API Key (100% FREE)
              </label>
              <input type="password" id="gemini-api-key" placeholder="Enter your free Gemini key..." style="width:100%; padding:10px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:10px;">
              <button onclick="saveGeminiKey()" style="width:100%; background:#edf2f7; color:#2d3748; border:none; padding:10px; border-radius:8px; font-weight:600; margin-bottom:15px;"><i class="fa-solid fa-floppy-disk"></i> Save Gemini Key</button>
            </div>

            <!-- OpenAI API Key Configuration for Parchi Scanner -->
            <div style="border-top: 1px dashed #cbd5e0; padding-top: 15px;">
              <label style="display:block; font-size:0.85rem; color:#4a5568; margin-bottom:5px; font-weight:600;">OpenAI API Key (Paid API)</label>
              <input type="password" id="openai-api-key" placeholder="Enter your OpenAI API key (sk-...)" style="width:100%; padding:10px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:10px;">
              <button onclick="saveOpenAiKey()" style="width:100%; background:#edf2f7; color:#2d3748; border:none; padding:10px; border-radius:8px; font-weight:600;"><i class="fa-solid fa-floppy-disk"></i> Save OpenAI Key</button>
            </div>`;

if (!html.includes(targetHtml)) {
  console.error("targetHtml not found in index.html!");
  process.exit(1);
}
html = html.replace(targetHtml, newHtml);
html = html.replace(/\n/g, '\r\n'); // Convert back to CRLF
fs.writeFileSync(htmlPath, html, 'utf8');
console.log("index.html patched successfully with Gemini input!");


// 2. Patch app.js
const appPath = path.join(__dirname, '..', 'app.js');
let app = fs.readFileSync(appPath, 'utf8');

// Standardize app.js line endings to LF
app = app.replace(/\r\n/g, '\n');

// Update initVoiceStudio()
const targetInitVoice = `function initVoiceStudio() {
  const engine = document.getElementById('tts-engine-select').value;
  if (engine === 'system') {
    loadSystemVoices();
  } else {
    const savedKey = localStorage.getItem('elevenlabs_api_key');
    if (savedKey) fetchElevenLabsVoices(savedKey);
  }
  const savedOpenAiKey = localStorage.getItem('openai_api_key');
  if (savedOpenAiKey && document.getElementById('openai-api-key')) {
    document.getElementById('openai-api-key').value = savedOpenAiKey;
  }
}`;

const newInitVoice = `function initVoiceStudio() {
  const engine = document.getElementById('tts-engine-select').value;
  if (engine === 'system') {
    loadSystemVoices();
  } else {
    const savedKey = localStorage.getItem('elevenlabs_api_key');
    if (savedKey) fetchElevenLabsVoices(savedKey);
  }
  const savedOpenAiKey = localStorage.getItem('openai_api_key');
  if (savedOpenAiKey && document.getElementById('openai-api-key')) {
    document.getElementById('openai-api-key').value = savedOpenAiKey;
  }
  const savedGeminiKey = localStorage.getItem('gemini_api_key');
  if (savedGeminiKey && document.getElementById('gemini-api-key')) {
    document.getElementById('gemini-api-key').value = savedGeminiKey;
  }
}`;

if (!app.includes(targetInitVoice)) {
  console.error("targetInitVoice not found in app.js!");
  process.exit(1);
}
app = app.replace(targetInitVoice, newInitVoice);
console.log("initVoiceStudio patched successfully with Gemini key loading!");


// Update handleOcrImageCapture()
const targetOcrCapture = `async function handleOcrImageCapture(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const apiKey = localStorage.getItem('openai_api_key');
  
  if (!apiKey) {
    // Demo Mode Simulation
    showToast("Opening Demo Scan Simulation...", "fa-solid fa-wand-magic-sparkles");
    setTimeout(() => {
      alert("💡 DEMO MODE SIMULATION:\\nWe are simulating a scan of a handwritten builder slip.\\nTo scan real handwritten parchis, please save your OpenAI API Key in the AI Voice Studio Settings!");
      pendingOcrItems = [
        { desc: "CGI Roofing Sheets 12ft", qty: 25, unit: "Pcs", price: 1650 },
        { desc: "Cement (JK Super)", qty: 50, unit: "Bags", price: 470 },
        { desc: "Steel Rods 12mm", qty: 10, unit: "Bundle", price: 5400 },
        { desc: "Steel Nails 3 inches", qty: 5, unit: "Kgs", price: 90 },
        { desc: "PVC Pipe 4\\\" Classic", qty: 15, unit: "Pcs", price: 280 }
      ];
      renderOcrReviewDialog();
    }, 1500);
    return;
  }
  
  showToast("Scanning Handwriting with Vision AI...", "fa-solid fa-spinner fa-spin");
  
  try {
    const base64Img = await fileToBase64(file);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${apiKey}\`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this image of a handwritten list/bill/slip (parchi) of hardware/construction materials.\\nExtract all the items listed on the paper. For each item, identify:\\n1. The clear and correct name (in English, e.g., 'Steel Nails 2 inches' instead of 'nails').\\n2. The quantity (default to 1 if not specified).\\n3. The unit (e.g., Pcs, Bags, Kgs, Roll, Tin, Bundle).\\n4. The estimated unit price if written, otherwise default to 0.\\n\\nYou must return ONLY a valid JSON array matching this format (no markdown formatting, no other text):\\n[\\n  { \\"desc\\": \\"Item Description\\", \\"qty\\": 5, \\"unit\\": \\"Pcs\\", \\"price\\": 120 }\\n]"
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
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || "Failed to call OpenAI API");
    }
    
    const data = await response.json();
    const textResult = data.choices[0].message.content.trim();
    console.log("OpenAI Vision Raw Result:", textResult);
    
    const cleanJson = textResult.replace(/^\\s*\\`\\`\\`json\\s*/i, '').replace(/\\`\\`\\`$/, '').trim();
    const items = JSON.parse(cleanJson);
    
    if (Array.isArray(items)) {
      pendingOcrItems = items.map(item => ({
        desc: item.desc || "Unidentified Item",
        qty: parseFloat(item.qty) || 1,
        unit: item.unit || "Pcs",
        price: parseFloat(item.price) || 0
      }));
      
      if (pendingOcrItems.length > 0) {
        renderOcrReviewDialog();
        showToast("Handwriting scanned perfectly!", "fa-solid fa-brain");
      } else {
        throw new Error("No items detected in photo.");
      }
    } else {
      throw new Error("Invalid output format from AI.");
    }
    
  } catch (err) {
    console.error("OpenAI OCR Error:", err);
    alert("AI Handwriting Scan failed: " + err.message + "\\nEnsure you have internet and a valid OpenAI API key.");
  }
}`;

const newOcrCapture = `async function handleOcrImageCapture(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const geminiKey = localStorage.getItem('gemini_api_key');
  const openaiKey = localStorage.getItem('openai_api_key');
  
  if (!geminiKey && !openaiKey) {
    // Demo Mode Simulation
    showToast("Opening Demo Scan Simulation...", "fa-solid fa-wand-magic-sparkles");
    setTimeout(() => {
      alert("💡 DEMO MODE SIMULATION:\\nWe are simulating a scan of a handwritten builder slip.\\nTo scan real handwritten parchis 100% FREE, please save your Gemini API Key in the AI Voice Studio Settings!");
      pendingOcrItems = [
        { desc: "CGI Roofing Sheets 12ft", qty: 25, unit: "Pcs", price: 1650 },
        { desc: "Cement (JK Super)", qty: 50, unit: "Bags", price: 470 },
        { desc: "Steel Rods 12mm", qty: 10, unit: "Bundle", price: 5400 },
        { desc: "Steel Nails 3 inches", qty: 5, unit: "Kgs", price: 90 },
        { desc: "PVC Pipe 4\\\" Classic", qty: 15, unit: "Pcs", price: 280 }
      ];
      renderOcrReviewDialog();
    }, 1500);
    return;
  }
  
  showToast("Scanning Handwriting with Vision AI...", "fa-solid fa-spinner fa-spin");
  
  try {
    const base64Img = await fileToBase64(file);
    let items = [];
    
    if (geminiKey) {
      // Clean base64 prefix for Gemini API
      const base64Clean = base64Img.split(',')[1];
      const mimeType = base64Img.split(';')[0].split(':')[1];
      
      const response = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=\${geminiKey}\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: "Analyze this image of a handwritten list/bill/slip (parchi) of hardware/construction materials.\\nExtract all the items listed on the paper. For each item, identify:\\n1. The clear and correct name (in English, e.g., 'Steel Nails 2 inches' instead of 'nails').\\n2. The quantity (default to 1 if not specified).\\n3. The unit (e.g., Pcs, Bags, Kgs, Roll, Tin, Bundle).\\n4. The estimated unit price if written, otherwise default to 0.\\n\\nYou must return ONLY a valid JSON array matching this format (no markdown formatting, no other text):\\n[\\n  { \\"desc\\": \\"Item Description\\", \\"qty\\": 5, \\"unit\\": \\"Pcs\\", \\"price\\": 120 }\\n]"
              },
              {
                inlineData: {
                  mimeType: mimeType || "image/jpeg",
                  data: base64Clean
                }
              }
            ]
          }]
        })
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || "Failed to call Gemini API");
      }
      
      const data = await response.json();
      const textResult = data.candidates[0].content.parts[0].text.trim();
      console.log("Gemini Vision Raw Result:", textResult);
      
      const cleanJson = textResult.replace(/^\\s*\\\`\\\`\\\`json\\s*/i, '').replace(/\\\`\\\`\\\`$/, '').trim();
      items = JSON.parse(cleanJson);
      
    } else {
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
                  text: "Analyze this image of a handwritten list/bill/slip (parchi) of hardware/construction materials.\\nExtract all the items listed on the paper. For each item, identify:\\n1. The clear and correct name (in English, e.g., 'Steel Nails 2 inches' instead of 'nails').\\n2. The quantity (default to 1 if not specified).\\n3. The unit (e.g., Pcs, Bags, Kgs, Roll, Tin, Bundle).\\n4. The estimated unit price if written, otherwise default to 0.\\n\\nYou must return ONLY a valid JSON array matching this format (no markdown formatting, no other text):\\n[\\n  { \\"desc\\": \\"Item Description\\", \\"qty\\": 5, \\"unit\\": \\"Pcs\\", \\"price\\": 120 }\\n]"
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
          max_tokens: 1000
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
    }
    
    if (Array.isArray(items)) {
      pendingOcrItems = items.map(item => ({
        desc: item.desc || "Unidentified Item",
        qty: parseFloat(item.qty) || 1,
        unit: item.unit || "Pcs",
        price: parseFloat(item.price) || 0
      }));
      
      if (pendingOcrItems.length > 0) {
        renderOcrReviewDialog();
        showToast("Handwriting scanned perfectly!", "fa-solid fa-brain");
      } else {
        throw new Error("No items detected in photo.");
      }
    } else {
      throw new Error("Invalid output format from AI.");
    }
    
  } catch (err) {
    console.error("AI OCR Error:", err);
    alert("AI Handwriting Scan failed: " + err.message + "\\nEnsure you have internet and a valid API key.");
  }
}`;

if (!app.includes(targetOcrCapture)) {
  console.error("targetOcrCapture not found in app.js!");
  process.exit(1);
}
app = app.replace(targetOcrCapture, newOcrCapture);
console.log("handleOcrImageCapture patched successfully with Gemini support!");


// Append saveGeminiKey function to end
const saveGeminiKeyFunc = `
function saveGeminiKey() {
  const key = document.getElementById('gemini-api-key').value.trim();
  if (!key) {
    alert("Please enter a valid Google Gemini API Key.");
    return;
  }
  localStorage.setItem('gemini_api_key', key);
  showToast("Gemini FREE API Key saved successfully!", "fa-solid fa-key");
}
`;

app = app + "\n" + saveGeminiKeyFunc;
app = app.replace(/\n/g, '\r\n'); // Convert back to CRLF
fs.writeFileSync(appPath, app, 'utf8');
console.log("app.js fully patched for Gemini 1.5 Flash free handwriting scanner!");
