// ==========================================================================
// OFFLINE P2P DIRECT SYNC ENGINE (QR-BASED WORKFLOW)
// ==========================================================================

let p2pQrPages = [];
let p2pCurrentPage = 0;
let p2pMergedBatches = {};
let p2pTotalPagesExpected = 0;

function openP2pSendModal() {
  const dialog = document.getElementById('p2p-send-dialog');
  if (dialog) {
    dialog.showModal();
    generateSyncQR();
  }
}

function closeP2pSendDialog() {
  const dialog = document.getElementById('p2p-send-dialog');
  if (dialog) dialog.close();
}

function openP2pReceiveModal() {
  const dialog = document.getElementById('p2p-receive-dialog');
  if (dialog) {
    p2pMergedBatches = {};
    p2pTotalPagesExpected = 0;
    const statusEl = document.getElementById('p2p-scanned-status');
    if (statusEl) {
      statusEl.style.display = 'none';
      statusEl.textContent = '';
      statusEl.className = '';
    }
    dialog.showModal();
  }
}

function closeP2pReceiveDialog() {
  const dialog = document.getElementById('p2p-receive-dialog');
  if (dialog) dialog.close();
}

function generateSyncQR() {
  const range = document.getElementById('p2p-sync-range').value;
  const todayStr = state.currentDate;
  
  let filtered = [];
  if (range === 'today') {
    filtered = state.entries.filter(e => e.date === todayStr);
  } else if (range === '3days') {
    const today = new Date(todayStr + 'T00:00:00');
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);
    
    filtered = state.entries.filter(e => {
      const entryDate = new Date(e.date + 'T00:00:00');
      return entryDate >= threeDaysAgo && entryDate <= today;
    });
  } else {
    filtered = state.entries;
  }
  
  // Exclude placeholder opening balance if empty
  filtered = filtered.filter(e => e.customer && e.item && e.item !== 'Manual Opening Balance');

  // Map to compressed format to fit limits
  const mapped = filtered.map(e => ({
    k: e.id,
    d: e.date,
    c: e.customer,
    i: e.item,
    r: e.rate,
    t: e.type,
    p: e.profit,
    s: e.salesman_name || 'System'
  }));

  // Split into batches of 12 entries to avoid QR capacity limits
  const batchSize = 12;
  p2pQrPages = [];
  for (let i = 0; i < mapped.length; i += batchSize) {
    p2pQrPages.push(mapped.slice(i, i + batchSize));
  }

  p2pCurrentPage = 0;
  
  const summaryEl = document.getElementById('p2p-send-summary');
  if (summaryEl) {
    summaryEl.textContent = `Found ${filtered.length} entries. Split into ${p2pQrPages.length || 1} QR codes.`;
  }

  renderCurrentQrPage();
}

function renderCurrentQrPage() {
  const total = p2pQrPages.length || 1;
  const pageIndicator = document.getElementById('p2p-page-indicator');
  const paginationControls = document.getElementById('p2p-pagination');
  
  if (paginationControls) {
    paginationControls.style.display = total > 1 ? 'flex' : 'none';
  }
  
  if (pageIndicator) {
    pageIndicator.textContent = `QR Code ${p2pCurrentPage + 1} of ${total}`;
  }

  const batch = p2pQrPages[p2pCurrentPage] || [];
  const payload = "SS_P2P:" + (p2pCurrentPage + 1) + "/" + total + ":" + JSON.stringify(batch);

  // Generate QR using Qrious library
  try {
    new QRious({
      element: document.getElementById('p2p-qr-canvas'),
      value: payload,
      size: 250,
      level: 'M'
    });
  } catch (err) {
    console.error("QR generation error:", err);
  }
}

function prevQrPage() {
  if (p2pCurrentPage > 0) {
    p2pCurrentPage--;
    renderCurrentQrPage();
  }
}

function nextQrPage() {
  if (p2pCurrentPage < p2pQrPages.length - 1) {
    p2pCurrentPage++;
    renderCurrentQrPage();
  }
}

async function handleP2pQrScan(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  showToast("Scanning Direct Sync QR...", "fa-solid fa-spinner fa-spin");
  
  try {
    const base64Img = await fileToBase64(file);
    const img = new Image();
    img.src = base64Img;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
      
      if (code) {
        console.log("Successfully decoded sync QR!");
        processP2pPayload(code.data);
      } else {
        alert("Direct Sync Failed: QR Code bilkul saaf nahi dikh raha hai. Please achhi roshni (good light) me clear photo kheenchiye.");
      }
    };
  } catch (err) {
    console.error("QR Decoder error:", err);
    alert("Scan failed: " + err.message);
  }
}

function processP2pPayload(payload) {
  if (!payload.startsWith("SS_P2P:")) {
    alert("Error: Yeh QR code is app ka sync payload nahi hai.");
    return;
  }
  
  try {
    const match = payload.match(/^SS_P2P:(\d+)\/(\d+):(.*)$/);
    if (!match) {
      throw new Error("Invalid payload format.");
    }
    
    const pageNum = parseInt(match[1]);
    const totalPages = parseInt(match[2]);
    const batchData = JSON.parse(match[3]);
    
    p2pTotalPagesExpected = totalPages;
    p2pMergedBatches[pageNum] = batchData;
    
    const statusEl = document.getElementById('p2p-scanned-status');
    if (statusEl) {
      statusEl.style.display = 'block';
      
      const scannedCount = Object.keys(p2pMergedBatches).length;
      if (scannedCount < totalPages) {
        statusEl.style.background = "#fff3cd";
        statusEl.style.color = "#856404";
        statusEl.style.border = "1px solid #ffeeba";
        statusEl.innerHTML = `<i class="fa-solid fa-hourglass-half"></i> Scanned ${scannedCount} of ${totalPages} parts.<br>Please select next QR slide on Sender's phone and scan again!`;
        showToast(`Part ${pageNum}/${totalPages} loaded!`, "fa-solid fa-circle-check");
      } else {
        // All parts scanned! Let's merge
        statusEl.style.background = "#d4edda";
        statusEl.style.color = "#155724";
        statusEl.style.border = "1px solid #c3e6cb";
        statusEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> All ${totalPages} parts scanned! Merging ledger entries...`;
        
        let newEntriesCount = 0;
        let skippedCount = 0;
        
        for (let p = 1; p <= totalPages; p++) {
          const list = p2pMergedBatches[p] || [];
          list.forEach(item => {
            const entryId = item.k;
            // Check if entry already exists
            const exists = state.entries.some(e => e.id === entryId);
            if (!exists) {
              const newEntry = {
                id: item.k,
                date: item.d,
                customer: item.c,
                item: item.i,
                rate: parseFloat(item.r) || 0,
                type: item.t,
                profit: parseFloat(item.p) || 0,
                salesman_name: item.s || 'P2P Sync'
              };
              state.entries.push(newEntry);
              newEntriesCount++;
              
              // Asynchronously sync with Supabase in background
              if (isCloudReady && supabaseClient) {
                supabaseClient.from('ledger_entries').upsert(newEntry).then(({error}) => {
                  if (error) console.error("Cloud backup of synced item failed:", error);
                });
              }
            } else {
              skippedCount++;
            }
          });
        }
        
        saveLocalData();
        renderApp();
        
        setTimeout(() => {
          closeP2pReceiveDialog();
          alert(`🎉 Sync Complete!\n${newEntriesCount} new entries merged perfectly.\n(${skippedCount} duplicate entries skipped automatically)`);
        }, 800);
      }
    }
  } catch (err) {
    console.error("Payload process error:", err);
    alert("Data import failed: payload structure is corrupt.");
  }
}
