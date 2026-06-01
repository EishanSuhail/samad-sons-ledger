const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const superBrightCSS = `
/* ==========================================================================
   ULTRA BRIGHT & MULTI-COLORED LEDGER (BASED ON USER FEEDBACK)
   ========================================================================== */

/* 1. Make the Top Navigation Bar Bright and Multi-colored */
.app-nav {
  background: linear-gradient(90deg, #ff9a9e 0%, #fecfef 50%, #a1c4fd 100%) !important;
  border: none !important;
  box-shadow: 0 4px 15px rgba(255, 154, 158, 0.4) !important;
}
.nav-tab {
  color: #2b1055 !important;
  font-weight: 800 !important;
}
.nav-tab.active {
  background: rgba(255, 255, 255, 0.9) !important;
  color: #ff0844 !important;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1) !important;
  border-radius: 12px !important;
}
.nav-tab.active i {
  color: #ff0844 !important;
}

/* 2. Date Navigator Background Brightness */
.date-navigator {
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%) !important;
  border: none !important;
  box-shadow: 0 4px 15px rgba(132, 250, 176, 0.4) !important;
}
.date-display {
  color: #0052D4 !important;
  font-weight: 900 !important;
  text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
}
.date-navigator button {
  color: #0052D4 !important;
  background: rgba(255, 255, 255, 0.5) !important;
}

/* 3. The Ledger Diary Page (The large white background) */
.diary-page {
  /* Replace paper cream with a beautiful light multi-color gradient */
  background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 30%, #e0c3fc 70%, #8ec5fc 100%) !important;
  box-shadow: 0 10px 30px rgba(142, 197, 252, 0.4) !important;
  border-left: 10px solid #ff0844 !important; /* Bright leather binding spine */
}

/* 4. Beautiful Texts in Diary */
.diary-page-title {
  background: linear-gradient(to right, #f12711, #f5af19) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  font-size: 1.3rem !important;
  font-weight: 900 !important;
  text-shadow: 0px 2px 4px rgba(255, 255, 255, 0.8) !important;
}

.diary-date-indicator {
  color: #4a00e0 !important;
  font-weight: 800 !important;
}

/* 5. Empty State styling */
.empty-state h3 {
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  font-size: 1.4rem !important;
  font-weight: 900 !important;
}
.empty-state p {
  color: #6a11cb !important;
  font-weight: 700 !important;
}
.empty-state i {
  color: #ff0844 !important;
  opacity: 0.8;
}

/* 6. Multi-colored texts for Ledger Entries (Rows) */
.table-customer-name {
  color: #6a11cb !important; /* Deep Purple */
  font-weight: 900 !important;
  text-shadow: 1px 1px 0px rgba(255,255,255,0.7);
}

.table-item-name {
  color: #11998e !important; /* Vibrant Teal/Green */
  font-weight: 800 !important;
}

.col-rate {
  color: #e52d27 !important; /* Ruby Red */
  font-weight: 900 !important;
}

/* Make table headers stand out */
.ledger-table th {
  color: #ff0844 !important;
  font-weight: 900 !important;
  text-transform: uppercase !important;
  background: rgba(255, 255, 255, 0.4) !important;
}
`;

css += '\n' + superBrightCSS;
fs.writeFileSync('styles.css', css, 'utf8');
console.log("styles.css updated for super bright and colorful UI based on screenshot");
