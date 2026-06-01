const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Add Nav Tab
const navTabHTML = `      <button class="nav-tab" id="tab-aivoice" onclick="switchTab('aivoice')">
        <i class="fa-solid fa-microphone-lines"></i>
        <span>AI Studio</span>
      </button>
    </nav>`;

html = html.replace(/<\/nav>/, navTabHTML);

// Add Section
const sectionHTML = `      <!-- TAB 5: AI VOICE STUDIO -->
      <section id="view-aivoice" class="tab-view">
        <div class="dashboard-hero" style="background: linear-gradient(135deg, #1e3a8a, #3b82f6);">
          <div class="hero-header">
            <h2>AI Voice Studio</h2>
            <p>Generate highly realistic human voices using ElevenLabs or System TTS.</p>
          </div>
        </div>

        <div style="padding: 15px;">
          
          <!-- Engine Settings -->
          <div style="background:white; border-radius:12px; padding:15px; margin-bottom:15px; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
            <h3 style="margin-top:0; font-size:1.1rem; color:#2d3748; margin-bottom:15px;">
              <i class="fa-solid fa-gear" style="color:var(--primary-color);"></i> Settings
            </h3>
            
            <label style="display:block; font-size:0.85rem; color:#4a5568; margin-bottom:5px; font-weight:600;">Voice Engine</label>
            <select id="tts-engine-select" onchange="toggleTtsEngine()" style="width:100%; padding:10px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:15px;">
              <option value="system">Free System TTS (Browser)</option>
              <option value="elevenlabs">ElevenLabs (Premium API)</option>
            </select>

            <div id="elevenlabs-config" style="display:none;">
              <label style="display:block; font-size:0.85rem; color:#4a5568; margin-bottom:5px; font-weight:600;">ElevenLabs API Key</label>
              <input type="password" id="elevenlabs-api-key" placeholder="Enter your secret API key..." style="width:100%; padding:10px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:10px;">
              <button onclick="saveElevenLabsKey()" style="width:100%; background:#edf2f7; color:#2d3748; border:none; padding:10px; border-radius:8px; font-weight:600;"><i class="fa-solid fa-floppy-disk"></i> Save Key & Load Voices</button>
            </div>
          </div>

          <!-- Studio -->
          <div style="background:white; border-radius:12px; padding:15px; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
            <h3 style="margin-top:0; font-size:1.1rem; color:#2d3748; margin-bottom:15px;">
              <i class="fa-solid fa-wand-magic-sparkles" style="color:var(--primary-color);"></i> Generate Audio
            </h3>

            <label style="display:block; font-size:0.85rem; color:#4a5568; margin-bottom:5px; font-weight:600;">Select Voice</label>
            <select id="voice-select" style="width:100%; padding:10px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:15px;">
              <option value="">Loading voices...</option>
            </select>

            <label style="display:block; font-size:0.85rem; color:#4a5568; margin-bottom:5px; font-weight:600;">Text to Speak</label>
            <textarea id="tts-text" rows="4" placeholder="Type your Hindi/Urdu/English text here..." style="width:100%; padding:10px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:15px; font-family:inherit; resize:vertical;"></textarea>

            <button onclick="generateAudio()" id="btn-generate-audio" style="width:100%; background:var(--primary-color); color:white; border:none; padding:12px; border-radius:8px; font-size:1rem; font-weight:600; margin-bottom:15px; box-shadow:0 4px 15px rgba(184,115,51,0.3);">
              <i class="fa-solid fa-play"></i> Generate & Play
            </button>

            <!-- Audio Player Output -->
            <div id="audio-output-container" style="display:none; text-align:center; padding-top:10px; border-top:1px solid #edf2f7;">
               <audio id="audio-player" controls style="width:100%; margin-bottom:10px;"></audio>
               <a id="audio-download" href="#" download="generated_audio.mp3" style="display:inline-block; font-size:0.85rem; color:var(--primary-color); text-decoration:none; font-weight:600;"><i class="fa-solid fa-download"></i> Download Audio File</a>
            </div>

          </div>

        </div>
      </section>
    </main>`;

html = html.replace(/<\/main>/, sectionHTML);

fs.writeFileSync('index.html', html, 'utf8');
console.log("index.html patched successfully");
