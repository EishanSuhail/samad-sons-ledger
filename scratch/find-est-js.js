const fs = require('fs');
const appContent = fs.readFileSync('app.js', 'utf8');
const lines = appContent.split(/\r?\n/);

const functions = [
  'function openNewEstimateScreen',
  'function saveEstimate',
  'function renderEstimates',
  'function filterEstimates',
  'function addEstimateRow',
  'function deleteSavedEstimate',
  'function renderOcrReviewDialog'
];

for (let func of functions) {
  let found = false;
  let start = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(func)) {
      start = i + 1;
      found = true;
      break;
    }
  }
  if (found) {
    console.log(`FUNCTION ${func} starts at line ${start}`);
    // Print 10 lines from start
    for (let j = start - 1; j < start + 15; j++) {
      if (lines[j] !== undefined) {
        console.log(`  ${j+1}: ${lines[j]}`);
      }
    }
  } else {
    console.log(`FUNCTION ${func} NOT found.`);
  }
}
