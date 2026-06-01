const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

const regex = /function renderLedger\(\) \{[\s\S]*?document\.getElementById\('day-entries-count'\)\.textContent = countLabel;\s*\}/;

const fullReplacement = `function renderLedger() {
  // Update date display
  const friendlyDate = formatDateFriendly(state.currentDate);
  document.getElementById('display-date').textContent = friendlyDate;
  document.getElementById('diary-top-date').textContent = friendlyDate;
  document.getElementById('ledger-date-input').value = state.currentDate;

  let dailyEntries = [];
  const searchInput = document.getElementById('ledger-search-input');
  const query = searchInput && searchInput.value ? searchInput.value.toLowerCase().trim() : '';

  if (query) {
    // Search mode: show all history matching the query
    dailyEntries = state.entries.filter(e => 
      e.item !== 'Manual Opening Balance' && 
      !e.item.endsWith('\\u200B') &&
      ((e.customer && e.customer.toLowerCase().includes(query)) || (e.item && e.item.toLowerCase().includes(query)))
    );
    dailyEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else {
    // Normal mode: show only today's entries
    dailyEntries = state.entries.filter(e => 
      e.date === state.currentDate && 
      e.item !== 'Manual Opening Balance' && 
      !e.item.endsWith('\\u200B')
    );
  }

  const tbody = document.getElementById('ledger-tbody');
  const emptyState = document.getElementById('empty-state');
  tbody.innerHTML = '';

  if (dailyEntries.length === 0) {
    emptyState.style.display = 'flex';
  } else {
    emptyState.style.display = 'none';

    dailyEntries.forEach(entry => {
      const tr = document.createElement('tr');
      tr.className = 'entry-row-anim';

      const typeStr = (entry.type || '').toString().toLowerCase().trim();
      let badgeClass = 'other';
      if (typeStr === 'cash') badgeClass = 'cash';
      else if (typeStr === 'credit') badgeClass = 'credit';

      const rateVal = Number(entry.rate) || 0;
      const profitVal = Number(entry.profit) || 0;

      let displayItem = escapeHTML(entry.item);
      if (query && entry.date !== state.currentDate) {
         const fDate = new Date(entry.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
         displayItem += \`<br><span style="font-size:0.75rem; color:#718096; background:#edf2f7; padding:2px 4px; border-radius:4px; display:inline-block; margin-top:4px;"><i class="fa-regular fa-calendar" style="margin-right:3px;"></i>\${fDate}</span>\`;
      }

      tr.innerHTML = \`
        <td onclick="openEditDialog('\${entry.id}')">
          <div class="customer-cell-wrap">
            <span class="table-customer-name">\${escapeHTML(entry.customer)}</span>
            <span class="salesman-row-badge"><i class="fa-solid fa-user-pen"></i> \${escapeHTML(entry.salesman_name || 'System')}</span>
          </div>
        </td>
        <td onclick="openEditDialog('\${entry.id}')">
          <span class="table-item-name">\${displayItem}</span>
        </td>
        <td onclick="openEditDialog('\${entry.id}')" style="text-align: right;">
          ?\${rateVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
        <td onclick="openEditDialog('\${entry.id}')" style="text-align: center;">
          <span class="badge-cash-credit \${badgeClass}">\${escapeHTML(entry.type)}</span>
        </td>
        <td onclick="openEditDialog('\${entry.id}')" class="table-profit-value" style="text-align: right;">
          ?\${profitVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
      \`;
      tbody.appendChild(tr);
    });
  }

  // Calculate daily totals
  let totalDailyProfit = 0;
  dailyEntries.forEach(e => { totalDailyProfit += Number(e.profit) || 0; });

  document.getElementById('daily-total-profit').textContent = totalDailyProfit.toLocaleString('en-IN', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  });

  const countLabel = dailyEntries.length === 1 ? '1 sale logged' : \`\${dailyEntries.length} sales logged\`;
  document.getElementById('day-entries-count').textContent = countLabel;
}`;

if (regex.test(appjs)) {
  const newAppJs = appjs.replace(regex, fullReplacement);
  fs.writeFileSync('app.js', newAppJs);
  console.log("Successfully replaced full renderLedger function");
} else {
  console.log("Regex not found in app.js");
}
