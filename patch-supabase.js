const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const backupSectionRegex = /<div class="data-management-container"[\s\S]*?<\/div>/;
const cloudSyncHTML = `
          <div class="data-management-container" style="background:white; border-radius:12px; padding:15px; margin-top:15px; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
            <h3 style="margin-top:0; color:#2d3748; font-size:1.1rem; border-bottom:1px solid #edf2f7; padding-bottom:8px;"><i class="fa-solid fa-cloud-arrow-up" style="color:var(--primary-color);"></i> Backup & Restore</h3>
            <p style="font-size:0.85rem; color:#718096; margin-bottom:15px;">Save your Ledger and Estimates safely or restore them from a previous backup file.</p>
            
            <div style="display:flex; gap:10px;">
              <button onclick="createBackup()" style="flex:1; background:var(--primary-color); color:white; border:none; padding:10px; border-radius:8px; font-weight:600;"><i class="fa-solid fa-download"></i> Backup Data</button>
              <button onclick="document.getElementById('restore-file-input').click()" style="flex:1; background:white; color:var(--primary-color); border:1px solid var(--primary-color); padding:10px; border-radius:8px; font-weight:600;"><i class="fa-solid fa-upload"></i> Restore</button>
            </div>
            <input type="file" id="restore-file-input" accept=".json" style="display:none;" onchange="restoreBackup(event)">
          </div>

          <!-- Cloud Auto-Sync Setup -->
          <div class="data-management-container" style="background:white; border-radius:12px; padding:15px; margin-top:15px; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
            <h3 style="margin-top:0; color:#2d3748; font-size:1.1rem; border-bottom:1px solid #edf2f7; padding-bottom:8px;"><i class="fa-solid fa-server" style="color:#11998E;"></i> Cloud Auto-Sync (Supabase)</h3>
            <p style="font-size:0.85rem; color:#718096; margin-bottom:10px;">Enter your free Supabase credentials to enable automatic cloud sync for lifetime.</p>
            
            <label style="display:block; font-size:0.85rem; color:#4a5568; margin-bottom:5px; font-weight:600;">Supabase URL</label>
            <input type="text" id="supabase-url-input" placeholder="https://xxxx.supabase.co" style="width:100%; padding:10px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:10px;">
            
            <label style="display:block; font-size:0.85rem; color:#4a5568; margin-bottom:5px; font-weight:600;">Supabase Anon Key</label>
            <input type="password" id="supabase-key-input" placeholder="eyJh..." style="width:100%; padding:10px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:10px;">
            
            <button onclick="saveSupabaseCredentials()" style="width:100%; background:linear-gradient(90deg, #11998E, #38EF7D); color:white; border:none; padding:10px; border-radius:8px; font-weight:600;"><i class="fa-solid fa-link"></i> Connect Cloud</button>
          </div>
`;
html = html.replace(backupSectionRegex, cloudSyncHTML);
fs.writeFileSync('index.html', html);
console.log('index.html patched');

let js = fs.readFileSync('app.js', 'utf8');
const jsConstantsRegex = /const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";\s*const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY";/;
const newConstants = `
let SUPABASE_URL = localStorage.getItem('supabase_url') || "";
let SUPABASE_KEY = localStorage.getItem('supabase_key') || "";
`;
js = js.replace(jsConstantsRegex, newConstants);

const newInitBlock = `
// ==========================================================================
// SUPABASE INITIALIZATION & CLOUD SYNC
// ==========================================================================

function saveSupabaseCredentials() {
  const url = document.getElementById('supabase-url-input').value.trim();
  const key = document.getElementById('supabase-key-input').value.trim();
  
  if (!url || !key) {
    alert("Please enter both URL and Key!");
    return;
  }
  
  localStorage.setItem('supabase_url', url);
  localStorage.setItem('supabase_key', key);
  SUPABASE_URL = url;
  SUPABASE_KEY = key;
  
  alert("Credentials saved! Connecting to cloud...");
  initSupabase();
}

document.addEventListener('DOMContentLoaded', () => {
  // Populate fields if they exist
  const savedUrl = localStorage.getItem('supabase_url');
  const savedKey = localStorage.getItem('supabase_key');
  if (savedUrl) document.getElementById('supabase-url-input').value = savedUrl;
  if (savedKey) document.getElementById('supabase-key-input').value = savedKey;
});
`;

// Insert the new logic before initSupabase
js = js.replace(/\/\/ SUPABASE INITIALIZATION & CLOUD SYNC\s*\n\s*\/\/ ==========================================================================/g, newInitBlock);

// Also modify initSupabase logic slightly to allow re-initialization
const initRegex = /if \(!SUPABASE_URL \|\| SUPABASE_URL === "YOUR_SUPABASE_PROJECT_URL" \|\|[\s\S]*?return;\s*\}/;
const newInitCheck = `
    if (!SUPABASE_URL || SUPABASE_URL === "YOUR_SUPABASE_PROJECT_URL" ||
        !SUPABASE_KEY || SUPABASE_KEY === "YOUR_SUPABASE_ANON_KEY") {
      console.warn("Supabase credentials not configured. Running in offline mode.");
      setConnectionStatus('demo', 'Offline - Enter credentials to sync');
      return;
    }
`;
js = js.replace(initRegex, newInitCheck);

fs.writeFileSync('app.js', js);
console.log('app.js patched');

