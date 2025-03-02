// Content script for EBIZ-Saas Platform Chrome extension
console.log("EBIZ-Saas Platform content script loaded");

// Safeguard against the specific icon error when the extension loads
(function() {
  // Send a message to the background script to verify communication
  try {
    chrome.runtime.sendMessage({ action: "contentScriptLoaded" }, function(response) {
      if (chrome.runtime.lastError) {
        console.log("Communication with background script failed:", chrome.runtime.lastError.message);
      } else {
        console.log("Communication with background script successful:", response);
      }
    });
  } catch (error) {
    console.error("Error sending message to background script:", error);
  }
  
  // Monkey patch the browserAction API if it exists
  if (typeof chrome !== 'undefined' && chrome.browserAction) {
    const originalSetIcon = chrome.browserAction.setIcon;
    
    // Replace with a safer version that includes error handling
    chrome.browserAction.setIcon = function(details, callback) {
      try {
        // Make a defensive copy of the details object
        const safeDetails = JSON.parse(JSON.stringify(details));
        
        // Ensure paths are correctly formatted
        if (safeDetails.path) {
          // No leading slashes for paths
          if (typeof safeDetails.path === 'string') {
            safeDetails.path = safeDetails.path.replace(/^\//, '');
          } else if (typeof safeDetails.path === 'object') {
            Object.keys(safeDetails.path).forEach(key => {
              safeDetails.path[key] = safeDetails.path[key].replace(/^\//, '');
            });
          }
        }
        
        // Call the original function with our safer details
        originalSetIcon.call(chrome.browserAction, safeDetails, callback);
      } catch (error) {
        console.error("Error in setIcon:", error);
        // Still call the callback if it exists, to prevent hanging
        if (callback) callback();
      }
    };
    
    console.log("Patched chrome.browserAction.setIcon for safer operation");
  }
})(); 