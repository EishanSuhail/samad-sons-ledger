const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

// Replace loadSystemVoices with polling version
const newLoadSystemVoices = `function loadSystemVoices() {
  const voiceSelect = document.getElementById('voice-select');
  const synth = window.speechSynthesis;
  
  const renderVoices = () => {
    let voices = synth.getVoices();
    if (voices.length === 0) return false;
    
    voiceSelect.innerHTML = '';
    
    // Sort so English-India or Hindi comes first
    voices.sort((a, b) => {
       const aLang = a.lang.toLowerCase();
       const bLang = b.lang.toLowerCase();
       if (aLang.includes('in')) return -1;
       if (bLang.includes('in')) return 1;
       return 0;
    });

    voices.forEach((voice, index) => {
      const opt = document.createElement('option');
      opt.value = index;
      opt.textContent = \`\${voice.name} (\${voice.lang})\`;
      voiceSelect.appendChild(opt);
    });
    
    systemVoices = voices;
    return true;
  };
  
  if (!renderVoices()) {
    voiceSelect.innerHTML = '<option value="">Loading system voices...</option>';
    // Fallback polling for Android WebView bug
    let retries = 0;
    const interval = setInterval(() => {
      if (renderVoices() || retries > 20) {
         clearInterval(interval);
         if(retries > 20 && systemVoices.length === 0) {
            voiceSelect.innerHTML = '<option value="">No voices found on this device</option>';
         }
      }
      retries++;
    }, 200);
  }
}`;

appjs = appjs.replace(/function loadSystemVoices\(\) \{[\s\S]*?else \{\s*renderVoices\(\);\s*\}\s*\}/, newLoadSystemVoices);

// Replace save audio logic in generateAudio
const generateAudioRegex = /const blob = await response\.blob\(\);[\s\S]*?showToast\("Audio generated successfully!", "fa-solid fa-music"\);/m;
const newGenerateAudioLogic = `const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      
      const audioPlayer = document.getElementById('audio-player');
      audioPlayer.src = audioUrl;
      document.getElementById('audio-output-container').style.display = 'block';
      audioPlayer.play();
      
      // Save to memory using Capacitor Filesystem
      try {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async function() {
           const base64data = reader.result.split(',')[1];
           const fileName = 'SamadSons_Voice_' + new Date().getTime() + '.mp3';
           
           if (window.Capacitor && window.Capacitor.Plugins.Filesystem) {
             const { Filesystem, Directory } = window.Capacitor.Plugins;
             await Filesystem.writeFile({
               path: fileName,
               data: base64data,
               directory: Directory.Documents
             });
             showToast("Audio saved to Documents folder!", "fa-solid fa-floppy-disk");
           } else {
             // Fallback for web
             const a = document.createElement('a');
             a.href = audioUrl;
             a.download = fileName;
             a.click();
             showToast("Audio downloaded!", "fa-solid fa-download");
           }
        };
      } catch(e) {
        console.error("Save error:", e);
      }
      
      showToast("Audio generated successfully!", "fa-solid fa-music");`;

appjs = appjs.replace(generateAudioRegex, newGenerateAudioLogic);

fs.writeFileSync('app.js', appjs, 'utf8');

// Now update index.html to rename the button
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<i class="fa-solid fa-play"><\/i> Generate & Play/, '<i class="fa-solid fa-volume-high"></i> Speak Now');
html = html.replace(/<a id="audio-download" [^>]*>.*?<\/a>/, ''); // Remove the manual download link as it's auto-saved now

fs.writeFileSync('index.html', html, 'utf8');
console.log("Patched completely");
