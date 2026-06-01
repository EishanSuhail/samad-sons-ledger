const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

const newBackupCode = `async function createBackup() {
  try {
    const data = {
      entries: state.entries,
      estimates: state.estimates,
      backup_date: new Date().toISOString(),
      version: 'v2'
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const fileName = \`SamadSons_Backup_\${new Date().toISOString().split('T')[0]}.json\`;
    
    const file = new File([blob], fileName, { type: 'application/json' });
    
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
       await navigator.share({
         title: 'Samad Sons Ledger Backup',
         text: 'Here is your secure Backup File for Samad Sons App. Save this to Google Drive or send it via WhatsApp to keep it safe.',
         files: [file]
       });
       showToast("Backup shared successfully!", "fa-solid fa-cloud-arrow-up");
    } else {
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = fileName;
       document.body.appendChild(a);
       a.click();
       document.body.removeChild(a);
       URL.revokeObjectURL(url);
       showToast("Backup downloaded!", "fa-solid fa-download");
    }
  } catch (err) {
    console.error("Backup failed", err);
    alert("Backup failed. Please try again.");
  }
}

function restoreBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      
      if (!data.entries && !data.ledger_entries) {
        throw new Error("Invalid backup file format.");
      }
      
      if (confirm("WARNING: Restoring this backup will REPLACE all your current data on this phone. Are you sure you want to proceed?")) {
        
        // Handle old v1 backups
        if (data.ledger_entries && !data.entries) {
           state.entries = data.ledger_entries.map(old => ({
              id: old.id || 'id_' + Math.random(),
              date: old.date || new Date().toISOString(),
              customer: old.partyName || 'Unknown Customer',
              item: old.itemDesc || 'Old Entry',
              rate: old.rate || 0,
              type: old.type || 'Cash',
              profit: old.profit || 0,
              salesman_name: old.salesman || 'System',
              is_quick_txn: false
           }));
        } else if (data.entries) {
           state.entries = data.entries;
        }

        if (data.estimates) {
           state.estimates = data.estimates;
        } else {
           state.estimates = [];
        }
        
        saveLocalData();
        showToast("Data restored perfectly!", "fa-solid fa-check-double");
        
        renderApp();
        event.target.value = ""; 
      } else {
        event.target.value = "";
      }
    } catch (err) {
      alert("Restore failed: " + err.message);
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}`;

appjs = appjs.replace(/async function createBackup\(\) \{[\s\S]*?reader\.readAsText\(file\);\s*\}/, newBackupCode);

fs.writeFileSync('app.js', appjs, 'utf8');
console.log("Patched successfully");
