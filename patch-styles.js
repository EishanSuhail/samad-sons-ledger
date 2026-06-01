const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

// The user wants attractive backgrounds and coloured entries in the Ledger Diary.
const colorfulCSS = `
/* ==========================================================================
   ATTRACTIVE LEDGER DIARY OVERRIDES
   ========================================================================== */

/* Colorful Gradient Background for the Tab View */
#view-ledger {
  background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%) !important;
  min-height: 100vh;
}

/* Stunning Entry Cards for Table Rows */
.ledger-table tbody tr {
  background: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border-radius: 12px;
  margin-bottom: 12px;
  display: table-row; /* Keep table layout but style cells */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.ledger-table tbody tr:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  background-color: #f8fafc;
}

/* Beautiful Cell Spacing to mimic cards */
.ledger-table td {
  padding: 16px 12px;
  border-bottom: none !important;
  border-top: 1px solid #edf2f7;
}

.ledger-table tbody tr td:first-child {
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
  border-left: 4px solid transparent;
}

.ledger-table tbody tr td:last-child {
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}

/* Vibrant Row Markers based on Cash/Credit (Assumes we use nth-child for generic, or we can use the badge classes directly) */
/* Credit Row Marker - Light Red */
.ledger-table tbody tr:has(.bg-red-100) td:first-child {
  border-left-color: #fc8181;
}

/* Cash Row Marker - Light Green */
.ledger-table tbody tr:has(.bg-green-100) td:first-child {
  border-left-color: #68d391;
}

/* Enhanced Table Headers */
.ledger-table th {
  background: transparent;
  color: #4a5568;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.75rem;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 12px;
}

/* Attractive Typography */
.table-customer-name {
  color: #2b6cb0; /* Deep blue */
  font-size: 1.05rem;
  text-shadow: 0px 0px 1px rgba(43, 108, 176, 0.2);
}

.table-item-name {
  color: #718096;
  font-weight: 600;
  font-style: normal;
}

/* Glowing Badges */
.badge-cash-credit {
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  font-weight: 700;
  letter-spacing: 0.02em;
}

.bg-green-100 {
  background: linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%);
  color: #22543d;
  border: 1px solid #9ae6b4;
}

.bg-red-100 {
  background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
  color: #742a2a;
  border: 1px solid #feb2b2;
}

.text-green-600 {
  color: #38a169 !important;
  font-weight: 800;
}

.text-red-500 {
  color: #e53e3e !important;
  font-weight: 800;
}
`;

css += '\n' + colorfulCSS;
fs.writeFileSync('styles.css', css, 'utf8');
console.log("styles.css updated for colorful ledger");
