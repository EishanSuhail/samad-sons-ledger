const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const universalBrightCSS = `
/* ==========================================================================
   UNIVERSAL BRIGHT & COLORFUL THEME FOR ALL TABS
   ========================================================================== */

/* 1. Apply the stunning background to all tabs (Customers, Dashboard, Estimates, AI Studio) */
.tab-view {
  background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 30%, #e0c3fc 70%, #8ec5fc 100%) !important;
  border-radius: 12px;
  padding: 15px;
  margin: -10px; /* Counteract padding if any */
  min-height: calc(100vh - 120px);
}

/* Specific overrides for #view-customers which had a hardcoded background */
#view-customers {
  background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 30%, #e0c3fc 70%, #8ec5fc 100%) !important;
}

/* 2. Make Cards in all tabs look vibrant and bright */
.okcredit-customer-card,
.stat-card,
.estimate-card,
.feature-card,
.ai-voice-card,
.settings-card {
  background: rgba(255, 255, 255, 0.85) !important;
  box-shadow: 0 8px 25px rgba(142, 197, 252, 0.4) !important;
  border: 1px solid rgba(255,255,255,0.9) !important;
  border-radius: 16px !important;
  backdrop-filter: none !important; /* Avoid cracking */
  transition: transform 0.2s;
  transform: translateZ(0);
  margin-bottom: 15px;
  padding: 16px;
}

/* Hover effects for interactive cards */
.okcredit-customer-card:hover,
.estimate-card:hover {
  transform: translateY(-2px) translateZ(0);
}

/* 3. Text and Headings across all tabs */
/* Titles inside tabs */
.tab-view h2,
.tab-view h3,
.section-title {
  background: linear-gradient(to right, #f12711, #f5af19) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  font-weight: 900 !important;
  text-shadow: 0px 2px 4px rgba(255, 255, 255, 0.8) !important;
}

/* Stat Card specific text colors */
.stat-card .stat-value {
  color: #6a11cb !important;
  font-weight: 900 !important;
  text-shadow: 1px 1px 0px rgba(255,255,255,0.7);
}

/* Customer Name in Customer List */
.cust-name {
  color: #6a11cb !important;
  font-weight: 900 !important;
  font-size: 1.1rem;
}

.cust-phone {
  color: #0052D4 !important;
  font-weight: 700 !important;
}

/* Search bar and inputs in other tabs */
.search-bar-wrapper,
.input-group input,
.input-group select {
  background: rgba(255,255,255,0.95) !important;
  border: 2px solid rgba(255, 255, 255, 0.6) !important;
  border-radius: 12px;
  color: #4a00e0 !important;
  font-weight: 700 !important;
}

/* Badges across tabs */
.amount-due {
  color: #e52d27 !important;
  font-weight: 900 !important;
}
.amount-advance {
  color: #11998e !important;
  font-weight: 900 !important;
}

.bg-blue-100 {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
  color: white !important;
}
`;

css += '\n' + universalBrightCSS;
fs.writeFileSync('styles.css', css, 'utf8');
console.log("styles.css updated to make all tabs bright and colorful");
