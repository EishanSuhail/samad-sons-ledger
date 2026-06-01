const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'app.js');
const wwwAppPath = path.join(__dirname, '..', 'www', 'app.js');

console.log("Resilient Line Patcher for Cloud Spreadsheets Loader...");

if (fs.existsSync(appPath)) {
  let content = fs.readFileSync(appPath, 'utf8');
  
  // Normalize line endings to LF to perform stable replaces, then restore CRLF
  content = content.replace(/\r\n/g, '\n');

  const target = `    saveLocalData();
    renderApp();
    console.log("Loaded all cloud data successfully (ledger, rents, estimates).");`;

  const replacement = `    // 4. Fetch Spreadsheets (Safe Merge & Cloud Preservation)
    try {
      const { data: spreadData, error: spreadError } = await supabaseClient
        .from('saved_spreadsheets')
        .select('*');
        
      if (!spreadError && spreadData) {
        if (!state.spreadsheets) state.spreadsheets = [];
        spreadData.forEach(cloudSheet => {
          const idx = state.spreadsheets.findIndex(s => s.id === cloudSheet.id);
          if (idx !== -1) {
            state.spreadsheets[idx] = cloudSheet;
          } else {
            state.spreadsheets.push(cloudSheet);
          }
        });
      }
    } catch (e) {
      console.warn("Spreadsheet cloud load failed", e);
    }

    saveLocalData();
    renderApp();
    console.log("Loaded all cloud data successfully (ledger, rents, estimates, spreadsheets).");`;

  if (content.includes("Loaded all cloud data successfully (ledger, rents, estimates, spreadsheets).")) {
    console.log("Cloud Spreadsheets Loader already exists.");
  } else if (content.includes(target)) {
    content = content.replace(target, replacement);
    console.log("Found and replaced LF target block!");
  } else {
    // Let's do string split logic
    const lines = content.split('\n');
    const idx = lines.findIndex(l => l.includes('Loaded all cloud data successfully (ledger, rents, estimates).'));
    if (idx !== -1) {
      // Splicing the spreadsheets loader block right before saveLocalData()
      // The line before is renderApp(), before that is saveLocalData()
      const insertIdx = idx - 2; 
      const blockLines = [
        `    // 4. Fetch Spreadsheets (Safe Merge & Cloud Preservation)`,
        `    try {`,
        `      const { data: spreadData, error: spreadError } = await supabaseClient`,
        `        .from('saved_spreadsheets')`,
        `        .select('*');`,
        `        `,
        `      if (!spreadError && spreadData) {`,
        `        if (!state.spreadsheets) state.spreadsheets = [];`,
        `        spreadData.forEach(cloudSheet => {`,
        `          const idx = state.spreadsheets.findIndex(s => s.id === cloudSheet.id);`,
        `          if (idx !== -1) {`,
        `            state.spreadsheets[idx] = cloudSheet;`,
        `          } else {`,
        `            state.spreadsheets.push(cloudSheet);`,
        `          }`,
        `        });`,
        `      }`,
        `    } catch (e) {`,
        `      console.warn("Spreadsheet cloud load failed", e);`,
        `    }`,
        ``
      ];
      lines.splice(insertIdx, 0, ...blockLines);
      // Update the success log line
      const newLogIdx = lines.findIndex(l => l.includes('Loaded all cloud data successfully (ledger, rents, estimates).'));
      if (newLogIdx !== -1) {
        lines[newLogIdx] = `    console.log("Loaded all cloud data successfully (ledger, rents, estimates, spreadsheets).");`;
      }
      content = lines.join('\n');
      console.log("Spliced using index line matching successfully!");
    } else {
      console.error("Error: Could not locate loadCloudData logger line!");
      process.exit(1);
    }
  }

  // Restore CRLF line endings
  const crlfContent = content.replace(/\n/g, '\r\n');
  
  fs.writeFileSync(appPath, crlfContent, 'utf8');
  if (fs.existsSync(wwwAppPath)) {
    fs.writeFileSync(wwwAppPath, crlfContent, 'utf8');
  }
}

console.log("Resilient line patch finished successfully!");
