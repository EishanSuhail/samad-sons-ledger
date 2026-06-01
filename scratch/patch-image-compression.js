const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'app.js');
let app = fs.readFileSync(appPath, 'utf8');

// Standardize to LF
app = app.replace(/\r\n/g, '\n');

// 1. Add compressAndResizeImage helper function
const helperFunction = `
function compressAndResizeImage(file, maxWidth = 1200, maxHeight = 1200) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress as JPEG at 70% quality (ideal balance of size and OCR precision)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(new Error("Image loading failed: " + err.message));
    };
    reader.onerror = (err) => reject(new Error("File reading failed: " + err.message));
  });
}
`;

if (!app.includes('function compressAndResizeImage(')) {
  app = app + "\n" + helperFunction;
  console.log("compressAndResizeImage helper appended to app.js!");
} else {
  console.log("compressAndResizeImage already present.");
}


// 2. Modify handleOcrImageCapture to use compressAndResizeImage instead of fileToBase64
const targetOcrCaptureLine = `    const base64Img = await fileToBase64(file);`;
const newOcrCaptureLine = `    const base64Img = await compressAndResizeImage(file);`;

if (!app.includes(targetOcrCaptureLine)) {
  console.error("targetOcrCaptureLine not found!");
  process.exit(1);
}
app = app.replace(targetOcrCaptureLine, newOcrCaptureLine);
console.log("handleOcrImageCapture updated to use compression!");

app = app.replace(/\n/g, '\r\n'); // Convert back to CRLF
fs.writeFileSync(appPath, app, 'utf8');
console.log("app.js successfully patched for fast local compression!");
