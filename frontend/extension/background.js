// background.js — Service Worker for AutoSlay Extension

chrome.runtime.onInstalled.addListener(() => {
  console.log("AutoSlay installed.");
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_USER_DATA") {
    chrome.storage.local.get(["autoslay_user", "autoslay_token"], (result) => {
      sendResponse({ user: result.autoslay_user, token: result.autoslay_token });
    });
    return true; // Keep channel open for async response
  }

  if (message.type === "SAVE_USER_DATA") {
    chrome.storage.local.set({
      autoslay_user: message.user,
      autoslay_token: message.token
    }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === "LOGOUT") {
    chrome.storage.local.remove(["autoslay_user", "autoslay_token"], () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
