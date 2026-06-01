const fs = require('fs');
const app = fs.readFileSync('app.js', 'utf8');
const lines = app.split(/\r?\n/);

const syncFunctions = [
  'async function loadCloudData',
  'function startRealtimeSync'
];

for (let func of syncFunctions) {
  let start = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(func)) {
      start = i;
      break;
    }
  }
  if (start) {
    console.log(`\nFUNCTION ${func}:`);
    for (let j = start; j < start + 60; j++) {
      if (lines[j] !== undefined) {
        console.log(`  ${j+1}: ${lines[j]}`);
      }
    }
  }
}
