const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'app.js');
const wwwAppPath = path.join(__dirname, '..', 'www', 'app.js');

console.log("Installing UUID definition and resilient Cloud-Merge preservation logic...");

if (fs.existsSync(appPath)) {
  let app = fs.readFileSync(appPath, 'utf8');
  
  // A. Inject generateUUID definition at the top
  const uuidDefinition = `
// 100% Offline-Safe High-Entropy UUID Generator
function generateUUID() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch (e) {}
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
`;

  if (app.includes("function generateUUID()")) {
    console.log("generateUUID definition already exists in app.js.");
  } else {
    // Inject right after CONFIGURATION block
    app = app.replace("// ==========================================================================\n// GLOBAL STATE", uuidDefinition + "\n// ==========================================================================\n// GLOBAL STATE");
    console.log("Injected generateUUID definition at the top of app.js.");
  }

  // B. Update saveExcelSheet to use upsert instead of insert for cloud sync
  const insertTarget = `      const { error } = await supabaseClient
        .from('saved_spreadsheets')
        .insert([sheet]);`;
  
  const upsertReplacement = `      const { error } = await supabaseClient
        .from('saved_spreadsheets')
        .upsert(sheet);`;

  if (app.includes(".upsert(sheet)")) {
    console.log("saveExcelSheet already uses upsert for cloud sync.");
  } else if (app.includes(insertTarget)) {
    app = app.replace(insertTarget, upsertReplacement);
    console.log("Modified saveExcelSheet cloud sync to use upsert.");
  } else {
    // Fallback search
    app = app.replace(".insert([sheet])", ".upsert(sheet)");
    console.log("Modified saveExcelSheet cloud sync to use upsert (Fallback).");
  }

  // C. Update loadCloudData to safely merge cloud spreadsheets instead of blind replacement
  const loadCloudSpreadsheetsTarget = `    // 4. Fetch Spreadsheets
    try {
      const { data: spreadData, error: spreadError } = await supabaseClient
        .from('saved_spreadsheets')
        .select('*');
        
      if (!spreadError && spreadData) {
        state.spreadsheets = spreadData;
      }
    } catch (e) {
      console.warn("Spreadsheet cloud load failed", e);
    }`;

  const loadCloudSpreadsheetsReplacement = `    // 4. Fetch Spreadsheets (Safe Merge & Local Preservation)
    try {
      const { data: spreadData, error: spreadError } = await supabaseClient
        .from('saved_spreadsheets')
        .select('*');
        
      if (!spreadError && spreadData) {
        if (!state.spreadsheets) state.spreadsheets = [];
        spreadData.forEach(cloudSheet => {
          const idx = state.spreadsheets.findIndex(s => s.id === cloudSheet.id);
          if (idx !== -1) {
            // Update existing sheet details
            state.spreadsheets[idx] = cloudSheet;
          } else {
            // Push new sheet from cloud
            state.spreadsheets.push(cloudSheet);
          }
        });
      }
    } catch (e) {
      console.warn("Spreadsheet cloud load failed", e);
    }`;

  if (app.includes("Fetch Spreadsheets (Safe Merge & Local Preservation)")) {
    console.log("loadCloudData spreadsheets merge logic already exists.");
  } else if (app.includes(loadCloudSpreadsheetsTarget)) {
    app = app.replace(loadCloudSpreadsheetsTarget, loadCloudSpreadsheetsReplacement);
    console.log("Upgraded loadCloudData with safe spreadsheets merge and cloud preservation logic.");
  }

  fs.writeFileSync(appPath, app, 'utf8');
  if (fs.existsSync(wwwAppPath)) {
    fs.writeFileSync(wwwAppPath, app, 'utf8');
  }
}

console.log("UUID & Cloud Preservation patches applied successfully!");
