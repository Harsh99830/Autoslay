// background.js — Service Worker for AutoSlay Extension

chrome.runtime.onInstalled.addListener((details) => {
  console.log("AutoSlay installed.");

  // Open website automatically after fresh install
  if (details.reason === "install") {
    chrome.tabs.create({
      url: "https://autoslay.vercel.app"
    });
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  // Get stored user data
  if (message.type === "GET_USER_DATA") {
    chrome.storage.local.get(
      ["autoslay_user", "autoslay_token"],
      (result) => {
        sendResponse({
          user: result.autoslay_user,
          token: result.autoslay_token
        });
      }
    );

    return true;
  }

  // Save user data
  if (message.type === "SAVE_USER_DATA") {
    chrome.storage.local.set(
      {
        autoslay_user: message.user,
        autoslay_token: message.token
      },
      () => {
        sendResponse({ success: true });
      }
    );

    return true;
  }

  // Logout user
  if (message.type === "LOGOUT") {
    chrome.storage.local.remove(
      ["autoslay_user", "autoslay_token"],
      () => {
        sendResponse({ success: true });
      }
    );

    return true;
  }
});
