const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'app.js');
let app = fs.readFileSync(appPath, 'utf8');

// Split app into lines
const lines = app.split(/\r?\n/);

let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('if (geminiKey) {')) {
    startIdx = i;
  }
  if (startIdx !== -1 && lines[i].trim() === '}' && lines[i-1].includes('JSON.parse(cleanJson)')) {
    endIdx = i;
    break;
  }
}

if (startIdx === -1 || endIdx === -1) {
  console.error("Could not locate Gemini block boundary in app.js!");
  process.exit(1);
}

console.log(`Located Gemini block from line ${startIdx + 1} to ${endIdx + 1}.`);

// Read new block lines from gemini-block.js
const newBlockContent = fs.readFileSync(path.join(__dirname, 'gemini-block.js'), 'utf8');
const newGeminiBlockLines = newBlockContent.split(/\r?\n/);

// Splice the new lines in
lines.splice(startIdx, (endIdx - startIdx + 1), ...newGeminiBlockLines);

const updatedApp = lines.join('\r\n');
fs.writeFileSync(appPath, updatedApp, 'utf8');

console.log("Successfully spliced robust dynamic model fallback loop into app.js!");
