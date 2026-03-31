// bridge.js — Content script that bridges web app ↔ extension communication
// This runs in the context of the frontend URL when the user is logged in

(function() {
  // Listen for messages from the web app (AuthContext)
  window.addEventListener('message', (event) => {
    // Only accept messages from the configured frontend URL or same origin
    if (event.origin !== CONFIG.FRONTEND_URL && event.origin !== window.location.origin) {
      return;
    }

    if (event.data?.type === 'AUTOSLAY_SAVE_USER') {
      // Forward to extension background script
      chrome.runtime.sendMessage({
        type: 'SAVE_USER_DATA',
        user: event.data.user,
        token: event.data.token
      }, (response) => {
        console.log('Extension saved user data:', response);
      });
    }

    if (event.data?.type === 'AUTOSLAY_LOGOUT') {
      chrome.runtime.sendMessage({ type: 'LOGOUT' }, (response) => {
        console.log('Extension logged out:', response);
      });
    }
  });

  // Notify web app that extension is ready
  window.postMessage({ type: 'AUTOSLAY_EXTENSION_READY' }, '*');
})();
