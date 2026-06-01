const fs = require('fs');
const app = fs.readFileSync('app.js', 'utf8');

// Check if there is any mention of supabase or cloud sync for estimates
const mentions = [];
const lines = app.split(/\r?\n/);
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('estimates') && (lines[i].includes('supabase') || lines[i].includes('Client') || lines[i].includes('from('))) {
    mentions.push(`${i+1}: ${lines[i]}`);
  }
}

if (mentions.length > 0) {
  console.log("Found estimates cloud sync mentions:");
  mentions.forEach(m => console.log(m));
} else {
  console.log("No explicit estimates cloud sync found! Only local storage is used for estimates.");
}

// Print saveEstimate function lines
let start = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('function saveEstimate')) {
    start = i;
    break;
  }
}
if (start) {
  console.log("\nsaveEstimate function:");
  for (let i = start; i < start + 45; i++) {
    console.log(`${i+1}: ${lines[i]}`);
  }
}
