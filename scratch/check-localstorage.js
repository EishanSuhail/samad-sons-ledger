const fs = require('fs');
const app = fs.readFileSync('app.js', 'utf8');
const lines = app.split(/\r?\n/);

console.log("Direct localStorage references:");
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('localStorage') && !lines[i].includes('safeStorage')) {
    console.log(`${i+1}: ${lines[i]}`);
  }
}
