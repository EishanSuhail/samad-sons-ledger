const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

// Patch renderApp
const renderAppRegex = /else if \(state\.activeTab === 'estimates'\) \{\s*renderEstimates\(\);\s*\}/;
if (appjs.match(renderAppRegex)) {
  appjs = appjs.replace(renderAppRegex, "else if (state.activeTab === 'estimates') {\n      renderEstimates();\n    } else if (state.activeTab === 'aivoice') {\n      initVoiceStudio();\n    }");
}

// Append new AI Voice logic
const aiLogic = `
// ==========================================================================
// AI VOICE STUDIO INTEGRATION (ELEVENLABS + SYSTEM TTS)
// ==========================================================================

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

function loadSystemVoices() {
  const voiceSelect = document.getElementById('voice-select');
  
  const synth = window.speechSynthesis;
  let voices = synth.getVoices();
  
  const renderVoices = () => {
    voices = synth.getVoices();
    voiceSelect.innerHTML = '';
    
    // Sort so English-India or Hindi comes first, as it's a Ledger app for a desi user
    voices.sort((a, b) => {
       const aLang = a.lang.toLowerCase();
       const bLang = b.lang.toLowerCase();
       if (aLang.includes('in')) return -1;
       if (bLang.includes('in')) return 1;
       return 0;
    });

    voices.forEach((voice, index) => {
      const opt = document.createElement('option');
      opt.value = index; // Store index for system TTS
      opt.textContent = \`\${voice.name} (\${voice.lang})\`;
      voiceSelect.appendChild(opt);
    });
    
    systemVoices = voices;
  };
  
  if (voices.length === 0) {
    synth.onvoiceschanged = renderVoices;
  } else {
    renderVoices();
  }
}

function initVoiceStudio() {
  // Check if voices are loaded, if not load system voices as default
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
    if (voiceValue === "") return alert("Please select a voice first.");
    
    // System TTS
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = systemVoices[voiceValue];
    if (selectedVoice) utterance.voice = selectedVoice;
    
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Speaking...';
    
    utterance.onend = () => {
       btn.innerHTML = originalBtnHtml;
    };
    
    utterance.onerror = () => {
       btn.innerHTML = originalBtnHtml;
       alert("Error playing System TTS.");
    };
    
    synth.speak(utterance);
    
    // Note: System TTS doesn't generate an audio file, so we hide the audio player
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
      const audioDownload = document.getElementById('audio-download');
      
      audioPlayer.src = audioUrl;
      audioDownload.href = audioUrl;
      
      document.getElementById('audio-output-container').style.display = 'block';
      audioPlayer.play();
      
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

appjs = appjs + "\n" + aiLogic;

fs.writeFileSync('app.js', appjs, 'utf8');
console.log("app.js updated successfully");
