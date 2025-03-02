# Public Assets Directory

This directory contains public assets that are directly accessible from the root URL of the application.

## Icon Requirements

To fix icon-related errors, please ensure proper image files are placed in this directory:

### Required Icon Files

- `/favicon.ico` - Main favicon file (16x16, 32x32) - Must be an actual .ico file, not a text file
- `/apple-icon.png` - Apple touch icon (180x180) - Must be a PNG image
- `/icon/dark/16.png` - Dark mode icon, 16x16 size - Must be a PNG image
- `/icon/dark/32.png` - Dark mode icon, 32x32 size - Must be a PNG image
- `/icon/light/16.png` - Light mode icon, 16x16 size - Must be a PNG image
- `/icon/light/32.png` - Light mode icon, 32x32 size - Must be a PNG image

Note: Creating text files with these names will cause build errors. All icon files must be proper binary image files in their respective formats.

## Dealing with Nested Frontend Directories

If you encounter the error "Failed to set icon: Failed to fetch", this may be due to the nested frontend directory structure. To fix this:

1. Identify which frontend directory is actually serving the application
2. Make sure icon files exist in the public folder of EVERY nested frontend directory
3. Navigate to each frontend directory and run:
   ```bash
   mkdir -p public/icon/dark public/icon/light
   # Then copy your icon files to each of these directories
   ```

4. You can use this command to copy icon files to all nested directories:
   ```bash
   cp public/icon/dark/16.png frontend/public/icon/dark/16.png
   cp public/icon/dark/32.png frontend/public/icon/dark/32.png
   cp public/icon/light/16.png frontend/public/icon/light/16.png
   cp public/icon/light/32.png frontend/public/icon/light/32.png
   cp public/favicon.ico frontend/public/favicon.ico
   cp public/apple-icon.png frontend/public/apple-icon.png
   ```

## Adding Icon Files

To create proper icon files:

1. Create icon designs in both light and dark variations
2. Export them in the required sizes and formats
3. Place them in the respective directories:
   - `/public/icon/dark/` for dark mode icons
   - `/public/icon/light/` for light mode icons
   - `/public/` for root-level icons like favicon.ico and apple-icon.png

## Troubleshooting Icon Errors

If you encounter build errors related to icon files:
1. Ensure all icon files are actual image files, not text files
2. Check the Next.js configuration in `next.config.js` for any assetPrefix settings
3. Make sure the metadata in `layout.tsx` has correct paths to your icon files
4. Try using absolute URLs in the metadata configuration 
5. Clear the Next.js cache: `npm run clean` (or remove the .next directory)
6. Check browser console for specific 404 errors that might indicate missing files 