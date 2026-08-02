// Shared viewport list — single source of truth for playwright.config.js
// (one project per viewport) and layout.spec.js (artifact/report naming).
// Names are also used as filesystem-safe directory/file name fragments.
module.exports = [
  { name: 'desktop-1920x1080', label: 'Desktop 1920x1080', width: 1920, height: 1080 },
  { name: 'laptop-1366x768', label: 'Laptop 1366x768', width: 1366, height: 768 },
  { name: 'tablet-1024x768', label: 'Tablet 1024x768', width: 1024, height: 768 },
  { name: 'android-landscape-915x412', label: 'Android landscape 915x412', width: 915, height: 412 },
  { name: 'iphone-landscape-844x390', label: 'iPhone landscape 844x390', width: 844, height: 390 },
  { name: 'small-landscape-740x360', label: 'Small landscape 740x360', width: 740, height: 360 },
  { name: 'iphone-se-landscape-667x375', label: 'iPhone SE landscape 667x375', width: 667, height: 375 },
];
