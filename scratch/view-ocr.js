const fs = require('fs');
const app = fs.readFileSync('app.js', 'utf8');
const lines = app.split(/\r?\n/);
for (let i = 2190; i < 2390; i++) {
  if (lines[i] !== undefined) {
    console.log(`${i+1}: ${lines[i]}`);
  }
}
