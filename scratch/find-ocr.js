const fs = require('fs');
const appContent = fs.readFileSync('app.js', 'utf8');
const lines = appContent.split(/\r?\n/);
let found = false;
let start = 0;
let end = 0;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('async function handleOcrImageCapture')) {
    start = i + 1;
    found = true;
  }
  if (found && lines[i].includes('// =============') && i > start) {
    end = i + 1;
    break;
  }
}

if (!end) {
  end = start + 120; // fallback range
}

console.log(`FOUND handleOcrImageCapture from line ${start} to ${end}:`);
for (let i = start - 1; i < end; i++) {
  if (lines[i] !== undefined) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}
