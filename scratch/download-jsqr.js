const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';

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
    const rootPath = path.join(__dirname, '..', 'jsqr.min.js');
    const wwwPath = path.join(__dirname, '..', 'www', 'jsqr.min.js');
    
    console.log("Downloading jsQR library...");
    await downloadFile(url, rootPath);
    console.log("Saved to root directory.");
    
    fs.copyFileSync(rootPath, wwwPath);
    console.log("Saved to www/ directory.");
    
    console.log("jsQR Library downloaded successfully!");
  } catch (err) {
    console.error("Error downloading library:", err.message);
    process.exit(1);
  }
}

main();
