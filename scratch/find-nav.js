const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split(/\r?\n/);
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('class="nav-tab"') || lines[i].includes('nav-tab')) {
    console.log(`${i+1}: ${lines[i]}`);
  }
}
