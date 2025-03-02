// Background script for the Chrome extension
chrome.runtime.onInstalled.addListener(function() {
  console.log('EBIZ-Saas Platform extension installed');
  
  // Set the icon properly on installation
  try {
    chrome.browserAction.setIcon({
      path: {
        "16": "icon-fixed/dark/16.png",
        "32": "icon-fixed/dark/32.png"
      }
    });
  } catch (error) {
    console.error('Error setting icon:', error);
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "getStatus") {
    sendResponse({status: "Extension is running correctly"});
  }
});

// Function to safely set the icon
function safeSetIcon(iconPath) {
  if (chrome && chrome.browserAction && chrome.browserAction.setIcon) {
    try {
      chrome.browserAction.setIcon({
        path: iconPath
      });
      return true;
    } catch (error) {
      console.error('Error setting icon:', error);
      return false;
    }
  }
  return false;
}

// Set icon with error handling
safeSetIcon({
  "16": "icon-fixed/dark/16.png",
  "32": "icon-fixed/dark/32.png"
}); 