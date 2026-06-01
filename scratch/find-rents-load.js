const fs = require('fs');
const app = fs.readFileSync('app.js', 'utf8');
const lines = app.split(/\r?\n/);

const mentions = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('store_rents') && (lines[i].includes('select') || lines[i].includes('fetch') || lines[i].includes('load'))) {
    mentions.push(`${i+1}: ${lines[i]}`);
  }
}

console.log("Mentions of store_rents load/select in app.js:");
mentions.forEach(m => console.log(m));
