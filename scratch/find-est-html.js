const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split(/\r?\n/);
let found = false;
let start = 0;
let end = 0;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<!-- TAB 4: ESTIMATES -->') || lines[i].includes('id="view-estimates"')) {
    start = i + 1;
    found = true;
  }
  if (found && lines[i].includes('<!-- TAB 5:') && i > start) {
    end = i;
    break;
  }
}

if (!end) {
  end = start + 200;
}

console.log(`FOUND Estimates View from line ${start} to ${end}:`);
for (let i = start - 1; i < end; i++) {
  if (lines[i] !== undefined) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}
