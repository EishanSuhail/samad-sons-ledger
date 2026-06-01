const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

const newLoadSystemVoices = `async function loadSystemVoices() {
  const voiceSelect = document.getElementById('voice-select');
  
  if (!window.Capacitor || !window.Capacitor.Plugins || !window.Capacitor.Plugins.TextToSpeech) {
     voiceSelect.innerHTML = '<option value="">TTS Plugin not loaded</option>';
     return;
  }
  
  const TTS = window.Capacitor.Plugins.TextToSpeech;
  
  try {
     const result = await TTS.getSupportedVoices();
     let voices = result.voices || [];
     if (voices.length === 0) {
        voiceSelect.innerHTML = '<option value="">No voices available</option>';
        return;
     }
     
     voiceSelect.innerHTML = '';
     
     // Sort so English-India or Hindi comes first
     voices.sort((a, b) => {
        const aLang = (a.lang || '').toLowerCase();
        const bLang = (b.lang || '').toLowerCase();
        if (aLang.includes('in')) return -1;
        if (bLang.includes('in')) return 1;
        return 0;
     });

     voices.forEach((voice) => {
       const opt = document.createElement('option');
       // Android TTS plugin voices usually have a voiceURI or just use lang as fallback if name isn't present
       opt.value = voice.voiceURI || voice.lang || voice.name;
       opt.textContent = \`\${voice.name || voice.lang || 'Voice'} (\${voice.lang || 'Unknown'})\`;
       voiceSelect.appendChild(opt);
     });
     
     systemVoices = voices;
  } catch(e) {
     console.error(e);
     voiceSelect.innerHTML = '<option value="">Failed to load TTS voices</option>';
  }
}`;

appjs = appjs.replace(/function loadSystemVoices\(\) \{[\s\S]*?\}\s*\}, 200\);\s*\}\s*\}/, newLoadSystemVoices);

const newGenerateAudioSys = `if (engine === 'system') {
    if (!voiceValue) return alert("Please select a voice first.");
    
    if (!window.Capacitor || !window.Capacitor.Plugins || !window.Capacitor.Plugins.TextToSpeech) {
        return alert("TTS Plugin not available.");
    }
    
    const TTS = window.Capacitor.Plugins.TextToSpeech;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Speaking...';
    
    try {
      await TTS.speak({
        text: text,
        lang: voiceValue, // passing lang or voiceURI
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0
      });
    } catch(e) {
      alert("Error playing System TTS: " + e.message);
    } finally {
      btn.innerHTML = originalBtnHtml;
    }
    
    document.getElementById('audio-output-container').style.display = 'none';
    
  }`;

appjs = appjs.replace(/if \(engine === 'system'\) \{[\s\S]*?document\.getElementById\('audio-output-container'\)\.style\.display = 'none';\s*\}/, newGenerateAudioSys);

fs.writeFileSync('app.js', appjs, 'utf8');
console.log("Patched to use Capacitor TTS Plugin successfully");
