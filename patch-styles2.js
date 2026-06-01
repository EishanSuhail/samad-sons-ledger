const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const moreColorfulCSS = `
/* ==========================================================================
   SUPER COLORFUL & ATTRACTIVE LEDGER DIARY OVERRIDES
   ========================================================================== */

/* Super Colorful and Vibrant Gradient Background for the Tab View */
#view-ledger {
  background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%) !important;
  min-height: 100vh;
}

/* Glassmorphism Entry Cards */
.ledger-table tbody tr {
  background: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  margin-bottom: 15px;
  display: table-row;
  transition: all 0.3s ease;
}

.ledger-table tbody tr:hover {
  transform: translateY(-3px) scale(1.01);
  box-shadow: 0 12px 32px 0 rgba(31, 38, 135, 0.25);
  background: rgba(255, 255, 255, 0.9) !important;
}

/* Beautiful Cell Spacing to mimic cards */
.ledger-table td {
  padding: 18px 12px;
  border-bottom: none !important;
  border-top: none !important;
}

.ledger-table tbody tr td:first-child {
  border-top-left-radius: 16px;
  border-bottom-left-radius: 16px;
  border-left: 5px solid transparent;
}

.ledger-table tbody tr td:last-child {
  border-top-right-radius: 16px;
  border-bottom-right-radius: 16px;
}

/* Vibrant Row Markers based on Cash/Credit */
.ledger-table tbody tr:has(.bg-red-100) td:first-child {
  border-left-color: #ff007f !important;
}

.ledger-table tbody tr:has(.bg-green-100) td:first-child {
  border-left-color: #00c853 !important;
}

/* Enhanced Table Headers */
.ledger-table th {
  background: rgba(255, 255, 255, 0.4);
  color: #1a202c;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.8rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.6);
  padding: 15px 10px;
  backdrop-filter: blur(5px);
}

/* Highly Colorful & Visible Typography */
.table-customer-name {
  color: #4a00e0 !important; /* Vibrant Deep Purple */
  font-size: 1.1rem;
  font-weight: 800;
  text-shadow: 0px 1px 2px rgba(255, 255, 255, 0.8);
}

.table-item-name {
  color: #005c97 !important; /* Vibrant Ocean Blue */
  font-weight: 700;
  font-size: 0.95rem;
}

.ledger-table td:nth-child(3) {
  color: #d31027 !important; /* Vibrant Ruby Red for Rates */
  font-weight: 800;
  font-size: 1rem;
}

/* Glowing Colorful Badges */
.badge-cash-credit {
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  font-weight: 800;
  letter-spacing: 0.03em;
  padding: 6px 10px !important;
  border-radius: 20px;
}

.bg-green-100 {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%) !important;
  color: #ffffff !important;
  border: none !important;
  text-shadow: 0px 1px 2px rgba(0,0,0,0.2);
}

.bg-red-100 {
  background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%) !important;
  color: #ffffff !important;
  border: none !important;
  text-shadow: 0px 1px 2px rgba(0,0,0,0.2);
}

.text-green-600 {
  color: #00b09b !important;
  font-weight: 900;
}

.text-red-500 {
  color: #cb2d3e !important;
  font-weight: 900;
}
`;

css += '\n' + moreColorfulCSS;
fs.writeFileSync('styles.css', css, 'utf8');
console.log("styles.css updated for super colorful ledger");
