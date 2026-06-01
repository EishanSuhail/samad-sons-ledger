const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

// Fix ? to &#8377; in HTML parts
content = content.replace(/\?\$\{rateVal/g, '&#8377;${rateVal');
content = content.replace(/\?\$\{profitVal/g, '&#8377;${profitVal');

// Fix ? to Rs. in text parts
content = content.replace(/\?\$\{totalDue\}/g, 'Rs. ${totalDue}');
content = content.replace(/\?\$\{amountStr\}/g, 'Rs. ${amountStr}');

// Change language to en-IN
content = content.replace(/recognition\.lang = 'hi-IN';/, "recognition.lang = 'en-IN'; // Hinglish");

// Update parseVoiceToForm
const newParseVoice = `function parseVoiceToForm(text) {
  // 1. Extract Rate (first number)
  const rateMatch = text.match(/\\d+/);
  if (rateMatch) {
    document.getElementById('input-rate').value = rateMatch[0];
  }

  // 2. Extract Type
  let type = '';
  if (text.match(/(udhar|udhaar|credit|baki|due|balance)/i)) {
    type = 'Credit';
  } else if (text.match(/(cash|nagad|jama|paid)/i)) {
    type = 'Cash';
  }
  if (type) {
    document.getElementById('input-type').value = type;
  }

  // 3. Extract Profit
  const profitMatch = text.match(/(munafa|profit|fayda|margin)\\s+(\\d+)/i) || text.match(/(\\d+)\\s+(munafa|profit|fayda|margin)/i);
  if (profitMatch) {
    document.getElementById('input-profit').value = profitMatch[1].match(/\\d+/) ? profitMatch[1] : profitMatch[2];
  }

  // 4. Extract Customer Name (Stop at ko, k, ki, or take first 2 words)
  let custName = '';
  const koMatch = text.match(/^(.*?)\\s+(ko|k|ki|ne|se)\\b/i);
  if (koMatch) {
    custName = koMatch[1].trim();
  } else {
    // Take first 1 or 2 words if no preposition
    const words = text.split(' ');
    custName = words.length > 1 ? words[0] + ' ' + words[1] : words[0];
  }
  
  if (custName) {
    custName = custName.replace(/\\b\\w/g, l => l.toUpperCase());
    // Try to remove numeric parts from name
    custName = custName.replace(/\\d+/g, '').trim();
    document.getElementById('input-customer').value = custName;
  }

  // 5. Extract Item Name (Everything else except the numbers and stop words)
  let itemDesc = text;
  // Remove the extracted name, rate, profit, and stop words
  itemDesc = itemDesc.replace(new RegExp(custName, 'i'), '');
  itemDesc = itemDesc.replace(/\\b(ko|k|ki|ne|se|ka|diya|liya|hain|hai|cash|credit|udhar|nagad|jama|baki|munafa|profit|fayda)\\b/gi, '');
  if (rateMatch) itemDesc = itemDesc.replace(rateMatch[0], '');
  if (profitMatch) {
     itemDesc = itemDesc.replace(profitMatch[1], '').replace(profitMatch[2], '');
  }
  itemDesc = itemDesc.replace(/\\s+/g, ' ').trim();
  itemDesc = itemDesc.charAt(0).toUpperCase() + itemDesc.slice(1);
  
  if (!itemDesc || itemDesc.length < 2) {
     itemDesc = text.charAt(0).toUpperCase() + text.slice(1); // fallback to full transcript
  }

  document.getElementById('input-item').value = itemDesc;

  showToast('Form auto-filled. Please review and Save.', 'fa-solid fa-wand-magic-sparkles');
}`;

content = content.replace(/function parseVoiceToForm\(text\) \{[\s\S]*?showToast\('Form auto-filled\. Please review and Save\.', 'fa-solid fa-wand-magic-sparkles'\);\s*\}/, newParseVoice);

fs.writeFileSync('app.js', content, 'utf8');
console.log("Patched successfully");
