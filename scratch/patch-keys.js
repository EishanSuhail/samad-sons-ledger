const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const paths = {
  html: path.join(root, 'index.html'),
  wwwHtml: path.join(root, 'www', 'index.html'),
  app: path.join(root, 'app.js'),
  wwwApp: path.join(root, 'www', 'app.js')
};

console.log('Running API Key Status indicator patching...');

// 1. Patch HTML files
const htmlTargets = [
  {
    target: `<div id="elevenlabs-config" style="display:none;">\n              <label style="display:block; font-size:0.85rem; color:#4a5568; margin-bottom:5px; font-weight:600;">ElevenLabs API Key</label>`,
    replacement: `<div id="elevenlabs-config" style="display:none;">\n              <label style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; color:#4a5568; margin-bottom:5px; font-weight:600;">\n                <span>ElevenLabs API Key</span>\n                <span id="elevenlabs-key-status" style="font-size:0.7rem; font-weight:bold; padding:2px 6px; border-radius:4px; font-family:\'Outfit\',sans-serif;"></span>\n              </label>`
  },
  {
    target: `<!-- Google Gemini API Key Configuration (100% FREE Tier) -->\n            <div style="border-top: 1px dashed #cbd5e0; padding-top: 15px; margin-top: 15px;">\n              <label style="display:block; font-size:0.85rem; color:#4a5568; margin-bottom:5px; font-weight:600; display:flex; align-items:center; gap:5px;">\n                <span style="background:#e0f2fe; color:#0284c7; padding:2px 6px; border-radius:4px; font-size:0.7rem; font-weight:bold;">RECOMMENDED</span>\n                Google Gemini API Key (100% FREE)\n              </label>`,
    replacement: `<!-- Google Gemini API Key Configuration (100% FREE Tier) -->\n            <div style="border-top: 1px dashed #cbd5e0; padding-top: 15px; margin-top: 15px;">\n              <label style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; color:#4a5568; margin-bottom:5px; font-weight:600; font-family:\'Outfit\',sans-serif;">\n                <span style="display:flex; align-items:center; gap:5px;">\n                  <span style="background:#e0f2fe; color:#0284c7; padding:2px 6px; border-radius:4px; font-size:0.7rem; font-weight:bold;">RECOMMENDED</span>\n                  Google Gemini API Key (100% FREE)\n                </span>\n                <span id="gemini-key-status" style="font-size:0.7rem; font-weight:bold; padding:2px 6px; border-radius:4px; transition: all 0.3s ease;"></span>\n              </label>`
  },
  {
    target: `<!-- OpenAI API Key Configuration for Parchi Scanner -->\n            <div style="border-top: 1px dashed #cbd5e0; padding-top: 15px;">\n              <label style="display:block; font-size:0.85rem; color:#4a5568; margin-bottom:5px; font-weight:600;">OpenAI API Key (Paid API)</label>`,
    replacement: `<!-- OpenAI API Key Configuration for Parchi Scanner -->\n            <div style="border-top: 1px dashed #cbd5e0; padding-top: 15px;">\n              <label style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; color:#4a5568; margin-bottom:5px; font-weight:600; font-family:\'Outfit\',sans-serif;">\n                <span>OpenAI API Key (Paid API)</span>\n                <span id="openai-key-status" style="font-size:0.7rem; font-weight:bold; padding:2px 6px; border-radius:4px; transition: all 0.3s ease;"></span>\n              </label>`
  }
];

function patchFile(filePath, targets) {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  // Normalize CRLF to LF for reliable matching, but write back original endings if needed.
  const hasCrlf = content.includes('\r\n');
  content = content.replace(/\r\n/g, '\n');

  let modified = false;
  targets.forEach(t => {
    // Try matching normalized strings
    const normalizedTarget = t.target.replace(/\r\n/g, '\n');
    if (content.includes(normalizedTarget)) {
      content = content.replace(normalizedTarget, t.replacement);
      modified = true;
    } else {
      console.warn(`Could not find target block in ${path.basename(filePath)}`);
    }
  });

  if (modified) {
    if (hasCrlf) {
      content = content.replace(/\n/g, '\r\n');
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Successfully patched: ${path.basename(filePath)}`);
  }
}

// Execute HTML patching
patchFile(paths.html, htmlTargets);
patchFile(paths.wwwHtml, htmlTargets);

// 2. Patch JS files
const statusFunctionDef = `
function updateApiKeyStatusIndicators() {
  const geminiKey = safeStorage.getItem('gemini_api_key');
  const openaiKey = safeStorage.getItem('openai_api_key');
  const elevenlabsKey = safeStorage.getItem('elevenlabs_api_key');
  
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
`;

function patchJsFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  const hasCrlf = content.includes('\r\n');
  content = content.replace(/\r\n/g, '\n');

  let modified = false;

  // A. Inject updateApiKeyStatusIndicators definition above initVoiceStudio
  if (!content.includes('function updateApiKeyStatusIndicators()')) {
    content = content.replace('function initVoiceStudio() {', statusFunctionDef + '\nfunction initVoiceStudio() {');
    modified = true;
  }

  // B. Call inside initVoiceStudio
  if (content.includes('document.getElementById(\'gemini-api-key\').value = savedGeminiKey;\n  }') && !content.includes('document.getElementById(\'gemini-api-key\').value = savedGeminiKey;\n  }\n  updateApiKeyStatusIndicators();')) {
    content = content.replace(
      'document.getElementById(\'gemini-api-key\').value = savedGeminiKey;\n  }',
      'document.getElementById(\'gemini-api-key\').value = savedGeminiKey;\n  }\n  updateApiKeyStatusIndicators();'
    );
    modified = true;
  }

  // C. Call inside saveOpenAiKey
  if (content.includes('showToast("OpenAI API Key saved successfully!", "fa-solid fa-key");') && !content.includes('showToast("OpenAI API Key saved successfully!", "fa-solid fa-key");\n  updateApiKeyStatusIndicators();')) {
    content = content.replace(
      'showToast("OpenAI API Key saved successfully!", "fa-solid fa-key");',
      'showToast("OpenAI API Key saved successfully!", "fa-solid fa-key");\n  updateApiKeyStatusIndicators();'
    );
    modified = true;
  }

  // D. Call inside saveGeminiKey
  if (content.includes('showToast("Gemini FREE API Key saved successfully!", "fa-solid fa-key");') && !content.includes('showToast("Gemini FREE API Key saved successfully!", "fa-solid fa-key");\n  updateApiKeyStatusIndicators();')) {
    content = content.replace(
      'showToast("Gemini FREE API Key saved successfully!", "fa-solid fa-key");',
      'showToast("Gemini FREE API Key saved successfully!", "fa-solid fa-key");\n  updateApiKeyStatusIndicators();'
    );
    modified = true;
  }

  // E. Call inside saveElevenLabsKey
  if (content.includes('fetchElevenLabsVoices(key);') && !content.includes('fetchElevenLabsVoices(key);\n  updateApiKeyStatusIndicators();')) {
    content = content.replace(
      'fetchElevenLabsVoices(key);',
      'fetchElevenLabsVoices(key);\n  updateApiKeyStatusIndicators();'
    );
    modified = true;
  }

  // F. Call inside startupApp
  if (content.includes('initSupabase();') && !content.includes('initSupabase();\n    updateApiKeyStatusIndicators();')) {
    content = content.replace(
      'initSupabase();',
      'initSupabase();\n    updateApiKeyStatusIndicators();'
    );
    modified = true;
  }

  if (modified) {
    if (hasCrlf) {
      content = content.replace(/\n/g, '\r\n');
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Successfully patched JS file: ${path.basename(filePath)}`);
  }
}

// Execute JS patching
patchJsFile(paths.app);
patchJsFile(paths.wwwApp);

console.log('API Key Status patching finished successfully!');
