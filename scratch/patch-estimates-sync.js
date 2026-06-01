const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'app.js');
let app = fs.readFileSync(appPath, 'utf8');

// Standardize to LF
app = app.replace(/\r\n/g, '\n');

// 1. Patch loadCloudData() to fetch ledger_entries, store_rents, and estimates
const targetLoadCloudData = `async function loadCloudData() {
  if (!isCloudReady || !supabaseClient) return;

  try {
    const { data, error } = await supabaseClient
      .from('ledger_entries')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (data) {
      state.entries = data;
      saveLocalData();
      renderApp();
      console.log(\`Loaded \${data.length} entries from cloud.\`);
    }
  } catch (err) {
    console.error("Failed to load cloud data:", err);
    showToast('Cloud load failed. Using local data.', 'fa-solid fa-triangle-exclamation');
    // Keep using whatever was loaded from localStorage
  }
}`;

const newLoadCloudData = `async function loadCloudData() {
  if (!isCloudReady || !supabaseClient) return;

  try {
    // 1. Fetch Ledger Entries
    const { data: entriesData, error: entriesError } = await supabaseClient
      .from('ledger_entries')
      .select('*')
      .order('created_at', { ascending: true });

    if (entriesError) throw entriesError;

    if (entriesData) {
      state.entries = entriesData;
    }

    // 2. Fetch Store Rents
    const { data: rentsData, error: rentsError } = await supabaseClient
      .from('store_rents')
      .select('*');
      
    if (!rentsError && rentsData) {
      state.rent_payments = rentsData;
    }

    // 3. Fetch Estimates
    const { data: estData, error: estError } = await supabaseClient
      .from('estimates')
      .select('*');
      
    if (!estError && estData) {
      state.estimates = estData;
    }

    saveLocalData();
    renderApp();
    console.log("Loaded all cloud data successfully (ledger, rents, estimates).");

  } catch (err) {
    console.error("Failed to load cloud data:", err);
    showToast('Cloud load failed. Using local data.', 'fa-solid fa-triangle-exclamation');
  }
}`;

if (!app.includes(targetLoadCloudData)) {
  console.error("targetLoadCloudData target not found!");
  process.exit(1);
}
app = app.replace(targetLoadCloudData, newLoadCloudData);
console.log("loadCloudData patched successfully!");


// 2. Patch startRealtimeSync() to listen for estimates postgres changes
const targetRealtimeSyncEnd = `    .subscribe((status) => {
      console.log("Realtime channel status:", status);
      if (status === 'SUBSCRIBED') {
        setConnectionStatus('connected', 'Synced with Cloud (Realtime Active)');
      }
    });`;

const targetRealtimeSyncRents = `        saveLocalData();
        if (state.activeTab === 'rent') {
          renderRentTab();
        }
      }
    )`;

const newRealtimeSyncRents = `        saveLocalData();
        if (state.activeTab === 'rent') {
          renderRentTab();
        }
      }
    )
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'estimates' },
      (payload) => {
        console.log("Realtime event (estimates):", payload.eventType, payload);

        if (payload.eventType === 'INSERT') {
          const newRec = payload.new;
          if (!state.estimates.some(e => e.id === newRec.id)) {
            state.estimates.push(newRec);
          }
        } else if (payload.eventType === 'UPDATE') {
          const idx = state.estimates.findIndex(e => e.id === payload.new.id);
          if (idx !== -1) state.estimates[idx] = payload.new;
        } else if (payload.eventType === 'DELETE') {
          state.estimates = state.estimates.filter(e => e.id !== payload.old.id);
        }

        saveLocalData();
        if (state.activeTab === 'estimates') {
          renderEstimates();
        }
      }
    )`;

if (!app.includes(targetRealtimeSyncRents)) {
  console.error("targetRealtimeSyncRents target not found!");
  process.exit(1);
}
app = app.replace(targetRealtimeSyncRents, newRealtimeSyncRents);
console.log("startRealtimeSync patched successfully!");


// 3. Patch saveEstimate() to insert to Supabase
const targetSaveEstimateEnd = `  state.estimates.push(estimate);
  saveLocalData();
  safeStorage.removeItem(STORAGE_KEY + '_est_draft');
  closeNewEstimateScreen();
  renderEstimates();
  showToast("Estimate saved successfully!", "fa-solid fa-receipt");
}`;

const newSaveEstimateEnd = `  state.estimates.push(estimate);
  saveLocalData();
  safeStorage.removeItem(STORAGE_KEY + '_est_draft');
  closeNewEstimateScreen();
  renderEstimates();
  showToast("Estimate saved successfully!", "fa-solid fa-receipt");

  // Sync to Supabase cloud
  if (isCloudReady && supabaseClient) {
    supabaseClient.from('estimates').insert([estimate]).then(({ error }) => {
      if (error) {
        console.error("Failed to sync estimate to cloud:", error);
        showToast("Offline Mode: Saved on phone, sync pending.", "fa-solid fa-wifi-slash");
      } else {
        console.log("Estimate successfully synced to cloud!");
      }
    });
  }
}`;

if (!app.includes(targetSaveEstimateEnd)) {
  console.error("targetSaveEstimateEnd target not found!");
  process.exit(1);
}
app = app.replace(targetSaveEstimateEnd, newSaveEstimateEnd);
console.log("saveEstimate patched successfully!");


// 4. Patch deleteSavedEstimate() to sync deletion to Supabase
const targetDeleteEstimateEnd = `    state.estimates = state.estimates.filter(e => e.id !== currentViewedEstimateId);
    saveLocalData();
    closeReplicaEstimate();
    renderEstimates();
    showToast("Estimate deleted successfully!", "fa-solid fa-trash");
  }
}`;

const newDeleteEstimateEnd = `    const idToDelete = currentViewedEstimateId;
    state.estimates = state.estimates.filter(e => e.id !== idToDelete);
    saveLocalData();
    closeReplicaEstimate();
    renderEstimates();
    showToast("Estimate deleted successfully!", "fa-solid fa-trash");

    // Sync delete to Supabase cloud
    if (isCloudReady && supabaseClient) {
      supabaseClient.from('estimates').delete().eq('id', idToDelete).then(({ error }) => {
        if (error) console.error("Failed to delete estimate from cloud:", error);
        else console.log("Estimate successfully deleted from cloud!");
      });
    }
  }
}`;

if (!app.includes(targetDeleteEstimateEnd)) {
  console.error("targetDeleteEstimateEnd target not found!");
  process.exit(1);
}
app = app.replace(targetDeleteEstimateEnd, newDeleteEstimateEnd);
console.log("deleteSavedEstimate patched successfully!");

app = app.replace(/\n/g, '\r\n'); // Convert back to CRLF
fs.writeFileSync(appPath, app, 'utf8');
console.log("app.js completely patched for cloud backup of Estimates!");
