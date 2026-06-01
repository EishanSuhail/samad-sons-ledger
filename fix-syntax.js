const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

const anchor = '// ==========================================================================\n// AI VOICE STUDIO INTEGRATION (ELEVENLABS + SYSTEM TTS)\n// ==========================================================================';

const parts = appjs.split(anchor);
if (parts.length > 1) {
  let correctAILogic = `
let systemVoices = [];

function toggleTtsEngine() {
  const engine = document.getElementById('tts-engine-select').value;
  const elConfig = document.getElementById('elevenlabs-config');
  
  if (engine === 'elevenlabs') {
    elConfig.style.display = 'block';
    
    // Load saved API key if exists
    const savedKey = localStorage.getItem('elevenlabs_api_key');
    if (savedKey) {
      document.getElementById('elevenlabs-api-key').value = savedKey;
      fetchElevenLabsVoices(savedKey);
    }
  } else {
    elConfig.style.display = 'none';
    loadSystemVoices();
  }
}

function saveElevenLabsKey() {
  const key = document.getElementById('elevenlabs-api-key').value.trim();
  if (!key) {
    alert("Please enter a valid API Key.");
    return;
  }
  localStorage.setItem('elevenlabs_api_key', key);
  fetchElevenLabsVoices(key);
}

async function fetchElevenLabsVoices(apiKey) {
  const voiceSelect = document.getElementById('voice-select');
  voiceSelect.innerHTML = '<option value="">Fetching ElevenLabs Voices...</option>';
  
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': apiKey }
    });
    
    if (!response.ok) throw new Error("Invalid API Key or API Error");
    
    const data = await response.json();
    voiceSelect.innerHTML = ''; // clear
    
    data.voices.forEach(voice => {
      const opt = document.createElement('option');
      opt.value = voice.voice_id;
      // Pre-select a good default if possible
      if (voice.name.toLowerCase().includes('rachel') || voice.name.toLowerCase().includes('adam')) {
         opt.selected = true;
      }
      opt.textContent = \`\${voice.name} (\${voice.labels && voice.labels.accent ? voice.labels.accent : 'Neutral'})\`;
      voiceSelect.appendChild(opt);
    });
    
    showToast("ElevenLabs voices loaded successfully!", "fa-solid fa-check");
  } catch (err) {
    console.error(err);
    alert("Failed to fetch ElevenLabs voices. Check your API key.");
    voiceSelect.innerHTML = '<option value="">Failed to load voices</option>';
  }
}

async function loadSystemVoices() {
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
}

function initVoiceStudio() {
  const engine = document.getElementById('tts-engine-select').value;
  if (engine === 'system') {
    loadSystemVoices();
  } else {
    const savedKey = localStorage.getItem('elevenlabs_api_key');
    if (savedKey) fetchElevenLabsVoices(savedKey);
  }
}

async function generateAudio() {
  const text = document.getElementById('tts-text').value.trim();
  if (!text) {
    alert("Please enter some text to speak.");
    return;
  }
  
  const engine = document.getElementById('tts-engine-select').value;
  const voiceValue = document.getElementById('voice-select').value;
  const btn = document.getElementById('btn-generate-audio');
  const originalBtnHtml = btn.innerHTML;
  
  if (engine === 'system') {
    if (!voiceValue) return alert("Please select a voice first.");
    
    if (!window.Capacitor || !window.Capacitor.Plugins || !window.Capacitor.Plugins.TextToSpeech) {
        return alert("TTS Plugin not available.");
    }
    
    const TTS = window.Capacitor.Plugins.TextToSpeech;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Speaking...';
    
    try {
      await TTS.speak({
        text: text,
        lang: voiceValue,
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
    
  } else if (engine === 'elevenlabs') {
    const apiKey = localStorage.getItem('elevenlabs_api_key');
    if (!apiKey) return alert("Please save your ElevenLabs API Key first.");
    if (!voiceValue) return alert("Please select a voice first.");
    
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating Audio...';
    btn.disabled = true;
    
    try {
      const response = await fetch(\`https://api.elevenlabs.io/v1/text-to-speech/\${voiceValue}\`, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'accept': 'audio/mpeg'
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2", // Multilingual model supports Hindi/English mix!
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });
      
      if (!response.ok) {
         const errData = await response.json().catch(()=>({}));
         throw new Error(errData.detail?.message || "Failed to generate audio from ElevenLabs");
      }
      
      const blob = await response.blob();
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
      
      showToast("Audio generated successfully!", "fa-solid fa-music");
      
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      btn.innerHTML = originalBtnHtml;
      btn.disabled = false;
    }
  }
}
`;
  appjs = parts[0] + anchor + '\n' + correctAILogic;
  fs.writeFileSync('app.js', appjs, 'utf8');
  console.log("App.js syntax fixed");
} else {
  console.log("Anchor not found!");
}
