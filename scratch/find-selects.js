const fs = require('fs');
const app = fs.readFileSync('app.js', 'utf8');
const lines = app.split(/\r?\n/);

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('.from(')) {
    console.log(`${i+1}: ${lines[i]}`);
    // Print 3 lines before and after
    for (let j = Math.max(0, i-2); j <= Math.min(lines.length-1, i+2); j++) {
      console.log(`  [${j+1}]: ${lines[j]}`);
    }
  }
}
