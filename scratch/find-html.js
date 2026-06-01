const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split(/\r?\n/);
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('openai-api-key')) {
    console.log(`${i+1}: ${lines[i]}`);
    // Print 5 lines before and after
    for (let j = Math.max(0, i-5); j <= Math.min(lines.length-1, i+5); j++) {
      console.log(`  [${j+1}]: ${lines[j]}`);
    }
  }
}
