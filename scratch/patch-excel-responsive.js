const fs = require('fs');
const path = require('path');

const stylesPath = path.join(__dirname, '..', 'styles.css');
const wwwStylesPath = path.join(__dirname, '..', 'www', 'styles.css');

console.log("Installing Responsive Excel Stack Layout for mobile devices...");

const responsiveExcelStyles = `
/* -------------------------------------------------------------------------- */
/* RESPONSIVE AI EXCEL CARDS GRID FOR MOBILE DEVICES                         */
/* -------------------------------------------------------------------------- */
@media (max-width: 600px) {
  #view-aiexcel .table-scroll-container {
    border: none !important;
    background: transparent !important;
    overflow-x: visible !important;
  }

  #view-aiexcel table {
    display: block !important;
    width: 100% !important;
  }

  #view-aiexcel thead {
    display: none !important; /* Hide wide header labels */
  }

  #excel-grid-tbody {
    display: flex !important;
    flex-direction: column !important;
    gap: 12px !important;
    width: 100% !important;
  }

  #excel-grid-tbody tr {
    display: flex !important;
    flex-flow: row wrap !important;
    background: #ffffff !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 12px !important;
    padding: 12px !important;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.03) !important;
    position: relative !important;
    margin-bottom: 4px !important;
  }

  #excel-grid-tbody td {
    display: block !important;
    padding: 4px 0 !important;
    width: 100% !important;
    background: transparent !important;
    border: none !important;
  }

  /* 1. SN Cell styling in top-left */
  #excel-grid-tbody td.excel-sn {
    position: absolute !important;
    top: 12px !important;
    left: 12px !important;
    width: 24px !important;
    height: 24px !important;
    background: #edf2f7 !important;
    color: #4a5568 !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 0.75rem !important;
    padding: 0 !important;
    z-index: 5 !important;
  }

  /* 2. Description Cell styling */
  #excel-grid-tbody td:nth-child(2) {
    order: 2 !important;
    width: 100% !important;
    padding-left: 32px !important; /* Make room for SN */
    margin-bottom: 6px !important;
  }

  #excel-grid-tbody td:nth-child(2) input {
    border: 1px solid #cbd5e0 !important;
    border-radius: 6px !important;
    background: #f7fafc !important;
    padding: 8px 10px !important;
    font-size: 0.9rem !important;
    font-weight: 600 !important;
  }

  /* 3. Qty Cell side-by-side */
  #excel-grid-tbody td:nth-child(3) {
    order: 3 !important;
    width: 30% !important;
    margin-right: 3% !important;
  }
  #excel-grid-tbody td:nth-child(3)::before {
    content: 'Qty' !important;
    display: block !important;
    font-size: 0.72rem !important;
    color: #718096 !important;
    margin-bottom: 3px !important;
    font-weight: bold !important;
  }
  #excel-grid-tbody td:nth-child(3) input {
    border: 1px solid #cbd5e0 !important;
    border-radius: 6px !important;
    padding: 6px !important;
    background: #f7fafc !important;
    text-align: center !important;
  }

  /* 4. Unit Cell side-by-side */
  #excel-grid-tbody td:nth-child(4) {
    order: 4 !important;
    width: 33% !important;
    margin-right: 3% !important;
  }
  #excel-grid-tbody td:nth-child(4)::before {
    content: 'Unit' !important;
    display: block !important;
    font-size: 0.72rem !important;
    color: #718096 !important;
    margin-bottom: 3px !important;
    font-weight: bold !important;
  }
  #excel-grid-tbody td:nth-child(4) select {
    border: 1px solid #cbd5e0 !important;
    border-radius: 6px !important;
    padding: 6px !important;
    background: #f7fafc !important;
  }

  /* 5. Price Cell side-by-side */
  #excel-grid-tbody td:nth-child(5) {
    order: 5 !important;
    width: 31% !important;
  }
  #excel-grid-tbody td:nth-child(5)::before {
    content: 'Price' !important;
    display: block !important;
    font-size: 0.72rem !important;
    color: #718096 !important;
    margin-bottom: 3px !important;
    font-weight: bold !important;
    text-align: right !important;
  }
  #excel-grid-tbody td:nth-child(5) input {
    border: 1px solid #cbd5e0 !important;
    border-radius: 6px !important;
    padding: 6px !important;
    background: #f7fafc !important;
    text-align: right !important;
  }

  /* 6. Amount Cell */
  #excel-grid-tbody td:nth-child(6) {
    order: 6 !important;
    width: 60% !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    margin-top: 8px !important;
    border-top: 1px solid #edf2f7 !important;
    padding-top: 8px !important;
    color: #2d3748 !important;
  }
  #excel-grid-tbody td:nth-child(6)::before {
    content: 'Total Amount:' !important;
    font-size: 0.8rem !important;
    color: #718096 !important;
    font-weight: bold !important;
  }

  /* 7. Actions Buttons Cell */
  #excel-grid-tbody td:nth-child(7) {
    order: 7 !important;
    width: 40% !important;
    display: flex !important;
    justify-content: flex-end !important;
    align-items: center !important;
    margin-top: 8px !important;
    border-top: 1px solid #edf2f7 !important;
    padding-top: 8px !important;
    gap: 10px !important;
  }
  
  /* Hide standard vertical margin decoration inside cards */
  #view-aiexcel .diary-margin-line {
    display: none !important;
  }
}
`;

if (fs.existsSync(stylesPath)) {
  let styles = fs.readFileSync(stylesPath, 'utf8');
  if (styles.includes("RESPONSIVE AI EXCEL CARDS GRID FOR MOBILE DEVICES")) {
    console.log("Responsive styles already in styles.css.");
  } else {
    styles += responsiveExcelStyles;
    fs.writeFileSync(stylesPath, styles, 'utf8');
    console.log("Appended responsive styles to styles.css.");
  }
  
  if (fs.existsSync(wwwStylesPath)) {
    let wwwStyles = fs.readFileSync(wwwStylesPath, 'utf8');
    if (!wwwStyles.includes("RESPONSIVE AI EXCEL CARDS GRID FOR MOBILE DEVICES")) {
      wwwStyles += responsiveExcelStyles;
      fs.writeFileSync(wwwStylesPath, wwwStyles, 'utf8');
      console.log("Appended responsive styles to www/styles.css.");
    }
  }
}

console.log("Responsive styles installation completed!");
