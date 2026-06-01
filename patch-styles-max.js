const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const ultraNeonBrightCSS = `
/* ==========================================================================
   MAXIMUM BRIGHTNESS NEON UI (EXTREME VIBRANCY)
   ========================================================================== */

/* 1. Top Navigation Bar - Ultra Bright Neon Orange/Red */
.app-nav {
  background: linear-gradient(90deg, #F12711 0%, #F5AF19 50%, #FFD200 100%) !important;
  border: none !important;
  box-shadow: 0 6px 20px rgba(241, 39, 17, 0.6) !important;
}
.nav-tab {
  color: #fff !important;
  font-weight: 900 !important;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}
.nav-tab.active {
  background: #ffffff !important;
  color: #F12711 !important;
  box-shadow: 0 4px 15px rgba(255,255,255,0.8) !important;
  text-shadow: none !important;
}
.nav-tab.active i {
  color: #F12711 !important;
}

/* 2. Date Navigator - Ultra Bright Neon Green */
.date-navigator {
  background: linear-gradient(135deg, #11998E 0%, #38EF7D 100%) !important;
  border: none !important;
  box-shadow: 0 6px 20px rgba(17, 153, 142, 0.6) !important;
}
.date-display {
  color: #ffffff !important;
  font-weight: 900 !important;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.4) !important;
  font-size: 1.1rem;
}
.date-navigator button {
  color: #11998E !important;
  background: #ffffff !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
}

/* 3. All Tabs Background - Ultra Bright Neon Blue to Pink */
.tab-view, #view-customers, .diary-page {
  background: linear-gradient(135deg, #00c6ff 0%, #0072ff 40%, #bc4e9c 100%) !important;
  border-radius: 12px;
}

.diary-page {
  border-left: 12px solid #FFD200 !important; /* Bright Yellow binding */
  box-shadow: 0 10px 40px rgba(0, 198, 255, 0.6) !important;
}

/* 4. Cards inside Tabs - Pure White to make background pop, but highly visible */
.okcredit-customer-card,
.stat-card,
.estimate-card,
.feature-card,
.ai-voice-card,
.settings-card,
.ledger-table tbody tr {
  background: #ffffff !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2) !important;
  border: 2px solid rgba(255,255,255,1) !important;
}

/* 5. Texts - Extreme High Contrast Neon Colors */
.diary-page-title, .tab-view h2, .tab-view h3, .section-title {
  background: linear-gradient(to right, #FF007F, #FFD200) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  font-weight: 900 !important;
  font-size: 1.5rem !important;
  text-shadow: 0px 2px 5px rgba(255, 255, 255, 0.9) !important;
}

/* Table and List Texts */
.table-customer-name, .cust-name {
  color: #ff007f !important; /* Neon Pink */
  font-size: 1.2rem !important;
  font-weight: 900 !important;
}

.table-item-name {
  color: #00c6ff !important; /* Neon Cyan */
  font-weight: 900 !important;
  font-size: 1rem !important;
}

.col-rate, .amount-due, .stat-value {
  color: #ff0000 !important; /* Pure Bright Red */
  font-weight: 900 !important;
  font-size: 1.1rem !important;
}

/* Table Headers */
.ledger-table th {
  color: #ffffff !important;
  background: #0072ff !important; /* Solid Neon Blue for high visibility */
  font-weight: 900 !important;
  font-size: 0.9rem !important;
}

/* Empty State */
.empty-state h3 {
  color: #FFD200 !important;
  text-shadow: 2px 2px 5px rgba(0,0,0,0.5) !important;
}
.empty-state p {
  color: #ffffff !important;
  font-weight: 900 !important;
  font-size: 1.1rem;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
}
.empty-state i {
  color: #FFD200 !important;
  opacity: 1 !important;
  filter: drop-shadow(0px 0px 10px rgba(255,210,0,0.8));
}
`;

css += '\n' + ultraNeonBrightCSS;
fs.writeFileSync('styles.css', css, 'utf8');
console.log("styles.css updated with MAXIMUM BRIGHTNESS colors");
