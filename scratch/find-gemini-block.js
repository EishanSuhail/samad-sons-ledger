const fs = require('fs');
const app = fs.readFileSync('app.js', 'utf8');
const lines = app.split(/\r?\n/);
let start = 0;
let end = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('if (geminiKey) {')) {
    start = i;
  }
  if (start > 0 && lines[i].trim() === '}' && lines[i-1].includes('JSON.parse(cleanJson)')) {
    end = i + 1;
    break;
  }
}

console.log(`Gemini block lines in app.js from line ${start+1} to ${end}:`);
for (let i = start; i < end; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
