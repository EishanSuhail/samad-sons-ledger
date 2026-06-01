const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

let newAppJs = appjs.replace(
  /\/\/ Filter entries for selected day.*?dailyEntries = dailyEntries\.filter\(e => e\.customer && e\.customer\.toLowerCase\(\)\.includes\(query\)\);\n\s*}/s,
  `let dailyEntries = [];
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
  }`
);

newAppJs = newAppJs.replace(
  /<td onclick="openEditDialog\('\$\{entry\.id\}'\)">\s*<span class="table-item-name">\$\{escapeHTML\(entry\.item\)\}<\/span>\s*<\/td>/,
  `<td onclick="openEditDialog('\${entry.id}')">\n            <span class="table-item-name">\${escapeHTML(entry.item)}</span>\${query && entry.date !== state.currentDate ? '<br><span style="font-size:0.75rem; color:#718096; background:#edf2f7; padding:2px 4px; border-radius:4px; display:inline-block; margin-top:4px;"><i class="fa-regular fa-calendar" style="margin-right:3px;"></i>' + new Date(entry.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + '</span>' : ''}\n          </td>`
);

if (newAppJs !== appjs) {
  fs.writeFileSync('app.js', newAppJs);
  console.log("Success");
} else {
  console.log("Regex not matched!");
}
