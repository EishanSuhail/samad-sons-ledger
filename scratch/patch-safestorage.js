const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'app.js');
let app = fs.readFileSync(appPath, 'utf8');

// Standardize to LF
app = app.replace(/\r\n/g, '\n');

// 1. Upgrade safeStorage to support removeItem()
const targetSafeStorage = `const safeStorage = {
  _mem: {},
  getItem(key) {
    try { return localStorage.getItem(key); }
    catch (e) { return this._mem[key] || null; }
  },
  setItem(key, value) {
    try { localStorage.setItem(key, value); }
    catch (e) { this._mem[key] = value; }
  }
};`;

const newSafeStorage = `const safeStorage = {
  _mem: {},
  getItem(key) {
    try { return localStorage.getItem(key); }
    catch (e) { return this._mem[key] || null; }
  },
  setItem(key, value) {
    try { localStorage.setItem(key, value); }
    catch (e) { this._mem[key] = value; }
  },
  removeItem(key) {
    try { localStorage.removeItem(key); }
    catch (e) {}
    delete this._mem[key];
  }
};`;

if (!app.includes(targetSafeStorage)) {
  console.error("targetSafeStorage not found!");
  process.exit(1);
}
app = app.replace(targetSafeStorage, newSafeStorage);
console.log("safeStorage successfully upgraded with removeItem()!");

// Split app into lines to modify direct localStorage calls safely
const lines = app.split('\n');

let changesCount = 0;
// We start from line 45 to skip safeStorage's own internal localStorage calls
for (let i = 45; i < lines.length; i++) {
  if (lines[i].includes('localStorage.getItem(')) {
    lines[i] = lines[i].replace(/localStorage\.getItem\(/g, 'safeStorage.getItem(');
    changesCount++;
  }
  if (lines[i].includes('localStorage.setItem(')) {
    lines[i] = lines[i].replace(/localStorage\.setItem\(/g, 'safeStorage.setItem(');
    changesCount++;
  }
  if (lines[i].includes('localStorage.removeItem(')) {
    lines[i] = lines[i].replace(/localStorage\.removeItem\(/g, 'safeStorage.removeItem(');
    changesCount++;
  }
}

app = lines.join('\n');
console.log(`Replaced ${changesCount} direct localStorage calls with safeStorage calls!`);

app = app.replace(/\n/g, '\r\n'); // Convert back to CRLF
fs.writeFileSync(appPath, app, 'utf8');
console.log("app.js completely patched for secure storage compatibility!");
