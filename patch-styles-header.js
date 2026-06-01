const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const colorfulHeaderAndFormCSS = `
/* ==========================================================================
   SUPER COLORFUL HEADER & ENTRY FORM (ATTRACTIVE & MULTI-COLORED)
   ========================================================================== */

/* 1. App Header Background - Vibrant, Multi-colored, Animated Gradient */
.app-header {
  background: linear-gradient(45deg, #ff9a9e 0%, #fecfef 25%, #a1c4fd 50%, #c2e9fb 75%, #fbc2eb 100%) !important;
  background-size: 300% 300% !important;
  animation: gradientFlow 8s ease infinite !important;
  border: none !important;
  box-shadow: 0 10px 25px rgba(255, 154, 158, 0.4) !important;
  position: relative;
  z-index: 1;
}

@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Make Header Title text stand out beautifully against the colorful background */
.header-text h1 {
  background: linear-gradient(to right, #4a00e0, #8e2de2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 900 !important;
  text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.6);
}

.header-text p {
  color: #2b1055 !important;
  font-weight: 700 !important;
  text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
}

/* 2. Quick Entry Card Background - Multi-colored attractive gradient */
.quick-entry-card {
  background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%) !important;
  border: 1px solid rgba(255,255,255,0.8) !important;
  box-shadow: 0 8px 32px rgba(142, 197, 252, 0.3) !important;
}

/* 3. Multi-colored texts inside the Entry form */
/* Form Title */
.quick-entry-card .card-header h2 {
  background: linear-gradient(to right, #ff0844 0%, #ffb199 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 900 !important;
  font-size: 1.4rem !important;
  text-shadow: 0px 2px 4px rgba(255,255,255,0.7);
}

/* Input Labels */
.input-group label {
  background: linear-gradient(90deg, #11998e 0%, #38ef7d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 800 !important;
  font-size: 0.95rem !important;
  letter-spacing: 0.5px;
}

/* Action Buttons (Save/Clear) Texts & Backgrounds */
.btn-save {
  background: linear-gradient(to right, #f12711, #f5af19) !important;
  color: white !important;
  font-weight: 900 !important;
  border: none !important;
  box-shadow: 0 4px 15px rgba(241, 39, 17, 0.3) !important;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.2) !important;
}

.btn-secondary {
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%) !important;
  color: white !important;
  font-weight: 900 !important;
  border: none !important;
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3) !important;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.2) !important;
}

/* Entry Form Inputs Background and Colorful Text */
.entry-form-grid input, .entry-form-grid select {
  background: rgba(255,255,255,0.9) !important;
  color: #6a11cb !important; /* Deep Purple for input texts */
  font-weight: 800 !important;
  border: 2px solid rgba(255,255,255,0.5) !important;
}
.entry-form-grid input:focus, .entry-form-grid select:focus {
  border-color: #ff0844 !important;
  box-shadow: 0 0 8px rgba(255, 8, 68, 0.4) !important;
}
`;

css += '\n' + colorfulHeaderAndFormCSS;
fs.writeFileSync('styles.css', css, 'utf8');
console.log("styles.css updated for header and form colorful UI");
