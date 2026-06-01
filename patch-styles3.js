const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

// Replace the previous colorful CSS entirely to fix cracking and white backgrounds
const newCSS = `
/* ==========================================================================
   PERFORMANCE-FRIENDLY COLORFUL LEDGER (FIXED SCROLL CRACK)
   ========================================================================== */

/* Force body/app container to adopt background when in ledger view (via JS or forcing it here) */
body {
  background: #fdfbfb; /* Fallback */
}

/* Tab View Colorful Background */
#view-ledger {
  /* This gradient will act as the background */
  background: linear-gradient(135deg, #FFDEE9 0%, #B5FFFC 100%) !important;
  border-radius: 12px;
  padding: 10px;
  margin: -10px; /* Stretch out of the padding */
  min-height: calc(100vh - 120px);
}

/* Solid Colorful Cards (NO backdrop-filter to prevent cracking) */
.ledger-table tbody tr {
  background: #ffffff !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  margin-bottom: 12px;
  display: table-row; /* Changed back to table-row for better alignment but with cell-level styling */
  transition: transform 0.2s;
  /* Hardware acceleration fix */
  transform: translateZ(0);
  will-change: transform;
}

.ledger-table tbody tr:hover {
  transform: translateY(-2px) translateZ(0);
}

/* Spacing and coloring */
.ledger-table td {
  padding: 16px 10px;
  border-bottom: 1px solid rgba(0,0,0,0.03) !important;
  border-top: none !important;
  background: rgba(255, 255, 255, 0.85); /* Solid white tint, NO blur */
}

/* Beautiful Rounded Corners on Cells to mock cards */
.ledger-table tbody tr td:first-child {
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
  border-left: 6px solid transparent;
}

.ledger-table tbody tr td:last-child {
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}

/* Vibrant Row Markers */
.ledger-table tbody tr:has(.bg-red-100) td:first-child {
  border-left-color: #ff007f !important;
  background: linear-gradient(to right, rgba(255,0,127,0.05), rgba(255,255,255,0.9)) !important;
}

.ledger-table tbody tr:has(.bg-green-100) td:first-child {
  border-left-color: #00c853 !important;
  background: linear-gradient(to right, rgba(0,200,83,0.05), rgba(255,255,255,0.9)) !important;
}

/* Enhanced Table Headers */
.ledger-table th {
  color: #2c3e50;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.85rem;
  border-bottom: 3px solid rgba(0, 0, 0, 0.1);
  padding: 12px 10px;
}

/* Highly Colorful Typography */
.table-customer-name {
  color: #6a11cb !important; /* Deep Purple */
  font-size: 1.1rem;
  font-weight: 800;
}

.table-item-name {
  color: #2575fc !important; /* Ocean Blue */
  font-weight: 700;
  font-size: 0.95rem;
}

.ledger-table td:nth-child(3) {
  color: #e52d27 !important; /* Ruby Red */
  font-weight: 900;
  font-size: 1rem;
}

/* Glowing Badges */
.badge-cash-credit {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  font-weight: 900;
  letter-spacing: 0.02em;
  padding: 6px 12px !important;
  border-radius: 20px;
}

.bg-green-100 {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%) !important;
  color: #fff !important;
}

.bg-red-100 {
  background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%) !important;
  color: #fff !important;
}
`;

// Remove the previous blocks I added:
const toRemoveRegex = /\/\* ==========================================================================\s*(?:ATTRACTIVE LEDGER DIARY OVERRIDES|SUPER COLORFUL & ATTRACTIVE LEDGER DIARY OVERRIDES)\s*========================================================================== \*\/(?:.|\n)*/g;

css = css.replace(toRemoveRegex, '');
css += '\n' + newCSS;

fs.writeFileSync('styles.css', css, 'utf8');
console.log("styles.css updated with performance fixes and new colors");
