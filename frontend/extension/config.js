// config.js — Extension configuration
// Update FRONTEND_URL when deploying

const CONFIG = {
  FRONTEND_URL: 'https://autoslay.online', // Change this for different environments
};

// For use in other extension files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
