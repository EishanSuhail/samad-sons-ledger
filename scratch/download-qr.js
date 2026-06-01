const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';

function downloadFile(targetUrl, targetPath) {
  return new Promise((resolve, reject) => {
    https.get(targetUrl, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download: ${res.statusCode}`));
        return;
      }
      const fileStream = fs.createWriteStream(targetPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  try {
    const rootPath = path.join(__dirname, '..', 'qrious.min.js');
    const wwwPath = path.join(__dirname, '..', 'www', 'qrious.min.js');
    
    console.log("Downloading Qrious QR library...");
    await downloadFile(url, rootPath);
    console.log("Saved to root directory.");
    
    fs.copyFileSync(rootPath, wwwPath);
    console.log("Saved to www/ directory.");
    
    console.log("QR Library downloaded successfully!");
  } catch (err) {
    console.error("Error downloading library:", err.message);
    process.exit(1);
  }
}

main();
