const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'app.js');
let content = fs.readFileSync(appPath, 'utf8');

// Standardize line endings to LF
content = content.replace(/\r\n/g, '\n');

// 1. State property replacement
const targetState = `const state = {
  currentDate: '',               // Format: YYYY-MM-DD
  entries: [],                   // All ledger entries
  activeTab: 'ledger'            // Current visible tab
};`;

const newState = `const state = {
  currentDate: '',               // Format: YYYY-MM-DD
  entries: [],                   // All ledger entries
  rent_payments: [],             // Store rent payments
  activeTab: 'ledger'            // Current visible tab
};`;

if (!content.includes(targetState)) {
  console.error("State target not found!");
  process.exit(1);
}
content = content.replace(targetState, newState);
console.log("State property replaced successfully!");

// 2. loadLocalData and saveLocalData replacement
const targetLocalData = `function loadLocalData() {
  const raw = safeStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      state.entries = JSON.parse(raw);
    } catch (err) {
      console.error("Corrupt localStorage, seeding defaults:", err);
      seedSampleData();
    }
  } else {
    seedSampleData();
  }
  
  const rawEst = safeStorage.getItem(STORAGE_KEY + '_estimates');
  if (rawEst) {
    try {
      state.estimates = JSON.parse(rawEst);
    } catch (err) {
      state.estimates = [];
    }
  } else {
    state.estimates = [];
  }
}

function saveLocalData() {
  safeStorage.setItem(STORAGE_KEY, JSON.stringify(state.entries));
  safeStorage.setItem(STORAGE_KEY + '_estimates', JSON.stringify(state.estimates));
}`;

const newLocalData = `function loadLocalData() {
  const raw = safeStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      state.entries = JSON.parse(raw);
    } catch (err) {
      console.error("Corrupt localStorage, seeding defaults:", err);
      seedSampleData();
    }
  } else {
    seedSampleData();
  }
  
  const rawEst = safeStorage.getItem(STORAGE_KEY + '_estimates');
  if (rawEst) {
    try {
      state.estimates = JSON.parse(rawEst);
    } catch (err) {
      state.estimates = [];
    }
  } else {
    state.estimates = [];
  }

  const rawRent = safeStorage.getItem(STORAGE_KEY + '_rent');
  if (rawRent) {
    try {
      state.rent_payments = JSON.parse(rawRent);
    } catch (err) {
      state.rent_payments = [];
    }
  } else {
    state.rent_payments = [];
  }
}

function saveLocalData() {
  safeStorage.setItem(STORAGE_KEY, JSON.stringify(state.entries));
  safeStorage.setItem(STORAGE_KEY + '_estimates', JSON.stringify(state.estimates));
  safeStorage.setItem(STORAGE_KEY + '_rent', JSON.stringify(state.rent_payments));
}`;

if (!content.includes(targetLocalData)) {
  console.error("LocalData target not found!");
  process.exit(1);
}
content = content.replace(targetLocalData, newLocalData);
console.log("LocalData functions replaced successfully!");

// 3. startRealtimeSync replacement
const targetSync = `function startRealtimeSync() {
  if (!isCloudReady || !supabaseClient) return;

  // Clean up any existing subscription
  if (realtimeChannel) {
    supabaseClient.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }

  realtimeChannel = supabaseClient
    .channel('ledger-realtime')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'ledger_entries' },
      (payload) => {
        console.log("Realtime event:", payload.eventType, payload);

        if (payload.eventType === 'INSERT') {
          const newRec = payload.new;
          if (!state.entries.some(e => e.id === newRec.id)) {
            state.entries.push(newRec);
          }
        } else if (payload.eventType === 'UPDATE') {
          const idx = state.entries.findIndex(e => e.id === payload.new.id);
          if (idx !== -1) state.entries[idx] = payload.new;
        } else if (payload.eventType === 'DELETE') {
          state.entries = state.entries.filter(e => e.id !== payload.old.id);
        }

        saveLocalData();
        renderApp();
      }
    )
    .subscribe((status) => {
      console.log("Realtime channel status:", status);
      if (status === 'SUBSCRIBED') {
        setConnectionStatus('connected', 'Synced with Cloud (Realtime Active)');
      }
    });
}`;

const newSync = `function startRealtimeSync() {
  if (!isCloudReady || !supabaseClient) return;

  // Clean up any existing subscription
  if (realtimeChannel) {
    supabaseClient.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }

  realtimeChannel = supabaseClient
    .channel('ledger-realtime')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'ledger_entries' },
      (payload) => {
        console.log("Realtime event (entries):", payload.eventType, payload);

        if (payload.eventType === 'INSERT') {
          const newRec = payload.new;
          if (!state.entries.some(e => e.id === newRec.id)) {
            state.entries.push(newRec);
          }
        } else if (payload.eventType === 'UPDATE') {
          const idx = state.entries.findIndex(e => e.id === payload.new.id);
          if (idx !== -1) state.entries[idx] = payload.new;
        } else if (payload.eventType === 'DELETE') {
          state.entries = state.entries.filter(e => e.id !== payload.old.id);
        }

        saveLocalData();
        renderApp();
      }
    )
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'store_rents' },
      (payload) => {
        console.log("Realtime event (rents):", payload.eventType, payload);

        if (payload.eventType === 'INSERT') {
          const newRec = payload.new;
          if (!state.rent_payments.some(r => r.id === newRec.id)) {
            state.rent_payments.push(newRec);
          }
        } else if (payload.eventType === 'UPDATE') {
          const idx = state.rent_payments.findIndex(r => r.id === payload.new.id);
          if (idx !== -1) state.rent_payments[idx] = payload.new;
        } else if (payload.eventType === 'DELETE') {
          state.rent_payments = state.rent_payments.filter(r => r.id !== payload.old.id);
        }

        saveLocalData();
        if (state.activeTab === 'rent') {
          renderRentTab();
        }
      }
    )
    .subscribe((status) => {
      console.log("Realtime channel status:", status);
      if (status === 'SUBSCRIBED') {
        setConnectionStatus('connected', 'Synced with Cloud (Realtime Active)');
      }
    });
}`;

if (!content.includes(targetSync)) {
  console.error("Sync target not found!");
  process.exit(1);
}
content = content.replace(targetSync, newSync);
console.log("Sync function replaced successfully!");

// 4. renderApp replacement
const targetRenderApp = `function renderApp() {
  if (state.activeTab === 'ledger') {
    renderLedger();
  } else if (state.activeTab === 'dashboard') {
    renderDashboard();
  } else if (state.activeTab === 'customers') {
    renderCustomerAccounts();
  } else if (state.activeTab === 'estimates') {
      renderEstimates();
    } else if (state.activeTab === 'aivoice') {
      initVoiceStudio();
    }
}`;

const newRenderApp = `function renderApp() {
  if (state.activeTab === 'ledger') {
    renderLedger();
  } else if (state.activeTab === 'dashboard') {
    renderDashboard();
  } else if (state.activeTab === 'customers') {
    renderCustomerAccounts();
  } else if (state.activeTab === 'estimates') {
      renderEstimates();
    } else if (state.activeTab === 'aivoice') {
      initVoiceStudio();
    } else if (state.activeTab === 'rent') {
      renderRentTab();
    }
}`;

if (!content.includes(targetRenderApp)) {
  console.error("RenderApp target not found!");
  process.exit(1);
}
content = content.replace(targetRenderApp, newRenderApp);
console.log("RenderApp function replaced successfully!");

// 5. Append Rent Manager functions to end
const rentFunctions = `

// ==========================================================================
// STORE RENT MANAGER
// ==========================================================================

const STORES = [
  "Samad & Sons Hardware store",
  "Fayaz Maam's Store",
  "Aijaz kachan's ka store"
];

function renderRentTab() {
  const container = document.getElementById('rent-stores-container');
  if (!container) return;
  
  let html = '';
  STORES.forEach(storeName => {
    // Find all payments for this store
    const storePayments = state.rent_payments.filter(r => r.store === storeName)
      .sort((a,b) => new Date(b.date) - new Date(a.date));
      
    const lastPayment = storePayments.length > 0 ? storePayments[0] : null;
    const statusText = lastPayment 
      ? \`Last Paid: ₹\${Number(lastPayment.amount).toLocaleString('en-IN')} for \${lastPayment.period}\` 
      : 'No payments recorded yet';
    const statusColor = lastPayment ? '#38a169' : '#e53e3e';
    const statusBg = lastPayment ? 'rgba(56, 161, 105, 0.1)' : 'rgba(229, 62, 62, 0.1)';
    
    html += \`
      <div class="stat-card" style="display:flex; flex-direction:column; gap:12px; background:white; padding:20px; border-radius:16px; border:1px solid #edf2f7; box-shadow:0 4px 6px rgba(0,0,0,0.02);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3 style="margin:0; font-size:1.15rem; font-weight:700; color:#2d3748;">\${storeName}</h3>
          <span style="width:40px; height:40px; border-radius:50%; display:flex; justify-content:center; align-items:center; background:#edf2f7; color:var(--primary-color);">
            <i class="fa-solid fa-shop"></i>
          </span>
        </div>
        <div style="background:\${statusBg}; color:\${statusColor}; padding:10px 15px; border-radius:8px; font-size:0.9rem; font-weight:600; display:flex; align-items:center; gap:8px;">
          <i class="fa-solid \${lastPayment ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i>
          <span>\${statusText}</span>
        </div>
      </div>
    \`;
  });
  
  container.innerHTML = html;
  
  // Render History
  const historyContainer = document.getElementById('rent-history-list');
  if (!historyContainer) return;

  if (state.rent_payments.length === 0) {
    historyContainer.innerHTML = '<div style="text-align:center; color:#a0aec0; padding:30px 10px; font-size:0.95rem;"><i class="fa-regular fa-folder-open" style="font-size:2rem; display:block; margin-bottom:10px; color:#cbd5e0;"></i>No payment history recorded yet</div>';
  } else {
    let histHtml = '';
    const sortedPayments = [...state.rent_payments].sort((a,b) => new Date(b.date) - new Date(a.date));
    
    sortedPayments.forEach(pay => {
      const formattedDate = new Date(pay.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      histHtml += \`
        <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:15px; border-radius:12px; border:1px solid #edf2f7; gap:10px;">
          <div style="display:flex; flex-direction:column; gap:4px; flex:1;">
            <strong style="color:#2d3748; font-size:0.95rem;">\${pay.store}</strong>
            <span style="font-size:0.8rem; color:#718096;">
              <i class="fa-regular fa-calendar-days" style="margin-right:4px;"></i>\${formattedDate} &bull; <i class="fa-regular fa-clock" style="margin-left:4px; margin-right:4px;"></i>\${pay.period}
            </span>
          </div>
          <div style="display:flex; align-items:center; gap:12px;">
            <strong style="color:var(--primary-color); font-size:1.1rem;">₹\${Number(pay.amount).toLocaleString('en-IN')}</strong>
            <button onclick="deleteRentPayment('\${pay.id}')" style="background:none; border:none; color:#e53e3e; font-size:1.1rem; padding:8px; cursor:pointer;" aria-label="Delete Payment">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      \`;
    });
    historyContainer.innerHTML = histHtml;
  }
}

function openRentModal() {
  const modal = document.getElementById('rent-modal');
  if (!modal) return;
  
  modal.style.display = 'flex';
  
  // Set date input to today
  const dateInput = document.getElementById('rent-date-input');
  if (dateInput) {
    dateInput.value = state.currentDate || new Date().toISOString().split('T')[0];
  }
  
  // Populate stores in select
  const select = document.getElementById('rent-store-select');
  if (select) {
    select.innerHTML = STORES.map(store => \`<option value="\${store}">\${store}</option>\`).join('');
  }
  
  // Reset other fields
  const amountInput = document.getElementById('rent-amount-input');
  if (amountInput) amountInput.value = '';
  
  const periodInput = document.getElementById('rent-period-input');
  if (periodInput) periodInput.value = '';
}

async function saveRentPayment() {
  const storeSelect = document.getElementById('rent-store-select');
  const dateInput = document.getElementById('rent-date-input');
  const amountInput = document.getElementById('rent-amount-input');
  const periodInput = document.getElementById('rent-period-input');
  
  if (!storeSelect || !dateInput || !amountInput || !periodInput) return;
  
  const store = storeSelect.value;
  const date = dateInput.value;
  const amount = parseFloat(amountInput.value);
  const period = periodInput.value.trim();
  
  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid amount greater than 0.");
    return;
  }
  
  if (!period) {
    alert("Please enter the period (Month/Year paid for).");
    return;
  }
  
  const payment = {
    id: 'rent_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    store: store,
    date: date,
    amount: amount,
    period: period,
    created_at: new Date().toISOString()
  };
  
  state.rent_payments.push(payment);
  saveLocalData();
  renderRentTab();
  
  document.getElementById('rent-modal').style.display = 'none';
  showToast("Rent Payment saved successfully!", "fa-solid fa-circle-check");
  
  // Sync to Supabase
  if (isCloudReady && supabaseClient) {
    try {
      const { error } = await supabaseClient
        .from('store_rents')
        .insert([payment]);
        
      if (error) throw error;
      console.log("Rent payment synced to cloud.");
    } catch (err) {
      console.error("Failed to sync rent payment to cloud:", err);
      showToast("Offline mode: Saved on phone, cloud sync pending.", "fa-solid fa-wifi-slash");
    }
  }
}

async function deleteRentPayment(paymentId) {
  if (!confirm("Are you sure you want to delete this rent payment?")) return;
  
  state.rent_payments = state.rent_payments.filter(r => r.id !== paymentId);
  saveLocalData();
  renderRentTab();
  
  showToast("Rent Payment deleted.", "fa-solid fa-trash-can");
  
  // Sync delete to Supabase
  if (isCloudReady && supabaseClient) {
    try {
      const { error } = await supabaseClient
        .from('store_rents')
        .delete()
        .eq('id', paymentId);
        
      if (error) throw error;
      console.log("Rent payment deleted from cloud.");
    } catch (err) {
      console.error("Failed to delete rent payment from cloud:", err);
    }
  }
}
`;

content = content + rentFunctions;

// Convert back to CRLF before writing
content = content.replace(/\n/g, '\r\n');

fs.writeFileSync(appPath, content, 'utf8');
console.log("Successfully wrote all rent patches to app.js with CRLF!");
