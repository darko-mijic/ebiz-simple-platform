# EBIZ-Saas Platform Chrome Extension

This document provides instructions for setting up and using the EBIZ-Saas Platform as a Chrome extension.

## Installation Guide

1. Copy the following files from the public directory to your extension directory:
   - `extension-manifest.json` (rename to `manifest.json`)
   - `background.js`
   - `icon-fixed/` directory (with all its contents)
   - `favicon.ico`

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" (toggle switch in the top right corner)

4. Click "Load unpacked" and select your extension directory

5. The extension should now be installed and visible in your Chrome toolbar

## Troubleshooting Icon Issues

If you encounter the error `Cannot read properties of undefined (reading 'setIcon')`:

1. Make sure your manifest.json includes:
   ```json
   "browser_action": {
     "default_icon": {
       "16": "icon-fixed/dark/16.png",
       "32": "icon-fixed/dark/32.png"
     },
     "default_title": "EBIZ-Saas Platform"
   },
   "background": {
     "scripts": ["background.js"],
     "persistent": false
   }
   ```

2. Check that all icon paths are relative (no leading slash) and the files actually exist

3. Make sure the `background.js` file is present and contains proper icon handling code

4. Reload the extension by clicking the refresh icon on the extension card in chrome://extensions/

5. Check the console for any errors (right-click on the extension icon → Inspect)

## Development Tips

1. Use relative paths for all resources in your manifest.json

2. The background script includes error handling for icon setting, which should prevent most crashes

3. If you make changes to the manifest or background script, reload the extension

4. For debugging, open the background page by clicking on "background page" link in chrome://extensions/

5. You can modify the background.js script to add more functionality as needed

## Common Errors and Solutions

### "Failed to load resource: net::ERR_FILE_NOT_FOUND"
- Check that all icon files are in the correct locations
- Verify paths in manifest.json are correct
- Make sure you've copied all required files from the public directory

### "Manifest version 2 is deprecated, and support will be removed in 2023"
- This is a warning and won't affect functionality currently
- We'll update to Manifest V3 in a future release

### "Cannot read properties of undefined (reading 'setIcon')"
- The background.js script includes defensive code to prevent this error
- Make sure chrome.browserAction is properly initialized before using it
- Check that your manifest includes the proper permissions and browser_action configuration

## Support

If you continue to experience issues, please:
1. Check the full console logs for any additional error information
2. Try a complete reinstall of the extension
3. Verify Chrome is up to date
4. Contact support with detailed error information 