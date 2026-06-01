const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

const newLoadSystemVoices = `function loadSystemVoices() {
  const voiceSelect = document.getElementById('voice-select');
  const synth = window.speechSynthesis;
  
  if (!synth) {
     voiceSelect.innerHTML = '<option value="">TTS not supported on this device</option>';
     return;
  }

  // FORCE INITIALIZATION ON ANDROID WEBVIEW
  // Playing an empty utterance forces the OS to bind the TTS service
  // which will then populate the voices list and fire onvoiceschanged
  try {
     const dummy = new SpeechSynthesisUtterance('');
     dummy.volume = 0;
     synth.speak(dummy);
  } catch(e) {}
  
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

    voices.forEach((voice) => {
      const opt = document.createElement('option');
      opt.value = voice.name;
      opt.textContent = \`\${voice.name} (\${voice.lang})\`;
      voiceSelect.appendChild(opt);
    });
    
    systemVoices = voices;
    return true;
  };
  
  if (!renderVoices()) {
    voiceSelect.innerHTML = '<option value="">Loading system voices...</option>';
    
    // Bind event
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = renderVoices;
    }
    
    // Polling fallback (10 seconds total)
    let retries = 0;
    const interval = setInterval(() => {
      if (renderVoices() || retries > 50) {
         clearInterval(interval);
         if(retries > 50 && (!systemVoices || systemVoices.length === 0)) {
            voiceSelect.innerHTML = '<option value="">No voices found. Please check phone TTS settings.</option>';
         }
      }
      retries++;
    }, 200);
  }
}`;

appjs = appjs.replace(/function loadSystemVoices\(\) \{[\s\S]*?clearInterval\(interval\);\s*if\(retries > 20[^}]*\}\s*\}\s*retries\+\+;\s*\}, 200\);\s*\}\s*\}/, newLoadSystemVoices);

// Need to update generateAudio to find by voice.name instead of systemVoices[voiceValue]
appjs = appjs.replace(/const selectedVoice = systemVoices\[voiceValue\];/, 'const selectedVoice = systemVoices.find(v => v.name === voiceValue);');

fs.writeFileSync('app.js', appjs, 'utf8');
console.log("Patched loadSystemVoices successfully");
