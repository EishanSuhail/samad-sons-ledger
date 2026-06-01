const fs = require('fs');
const path = require('path');

const filesToPatch = [
  path.join(__dirname, '..', 'app.js'),
  path.join(__dirname, '..', 'www', 'app.js')
];

filesToPatch.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  console.log(`Patching realtime spreadsheets sync in ${filePath}...`);

  // Normalize line endings to Unix style LF
  content = content.replace(/\r\n/g, '\n');

  const realtimeTarget = `        saveLocalData();
        if (state.activeTab === 'estimates') {
          renderEstimates();
        }
      }
    )
    .subscribe((status) => {`;

  const realtimeReplacement = `        saveLocalData();
        if (state.activeTab === 'estimates') {
          renderEstimates();
        }
      }
    )
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'saved_spreadsheets' },
      (payload) => {
        console.log("Realtime event (spreadsheets):", payload.eventType, payload);

        // Ignore active draft updates to prevent typing conflicts across devices!
        if (payload.new && payload.new.id === '00000000-0000-0000-0000-000000000000') return;
        if (payload.old && payload.old.id === '00000000-0000-0000-0000-000000000000') return;

        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const newRec = payload.new;
          if (!state.spreadsheets) state.spreadsheets = [];
          const idx = state.spreadsheets.findIndex(s => s.id === newRec.id);
          if (idx !== -1) {
            state.spreadsheets[idx] = newRec;
          } else {
            state.spreadsheets.push(newRec);
          }
        } else if (payload.eventType === 'DELETE') {
          if (state.spreadsheets) {
            state.spreadsheets = state.spreadsheets.filter(s => s.id !== payload.old.id);
          }
        }

        saveLocalData();
        if (state.activeTab === 'aiexcel') {
          renderSavedExcelSheets();
        }
      }
    )
    .subscribe((status) => {`;

  if (content.includes(realtimeTarget)) {
    content = content.replace(realtimeTarget, realtimeReplacement);
    console.log('  -> Realtime spreadsheets sync patched successfully.');
  } else {
    console.warn('  -> WARNING: Realtime spreadsheets sync target NOT found.');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Finished patching ${filePath}\n`);
});

console.log("Realtime spreadsheets sync patching complete!");
