#!/bin/bash

# This script copies icon files to all nested frontend directories
# Run this script from the main frontend directory

# Create source icons if they don't exist
mkdir -p public/icon/dark public/icon/light

# Download placeholder icons if they don't exist
if [ ! -f public/icon/dark/16.png ]; then
  echo "Downloading dark mode 16px icon"
  curl -o public/icon/dark/16.png https://placehold.co/16x16/222222/ffffff.png
fi

if [ ! -f public/icon/dark/32.png ]; then
  echo "Downloading dark mode 32px icon"
  curl -o public/icon/dark/32.png https://placehold.co/32x32/222222/ffffff.png
fi

if [ ! -f public/icon/light/16.png ]; then
  echo "Downloading light mode 16px icon"
  curl -o public/icon/light/16.png https://placehold.co/16x16/ffffff/222222.png
fi

if [ ! -f public/icon/light/32.png ]; then
  echo "Downloading light mode 32px icon"
  curl -o public/icon/light/32.png https://placehold.co/32x32/ffffff/222222.png
fi

if [ ! -f public/apple-icon.png ]; then
  echo "Downloading Apple icon"
  curl -o public/apple-icon.png https://placehold.co/180x180/ffffff/222222.png
fi

if [ ! -f public/favicon.ico ]; then
  echo "Downloading favicon"
  curl -o public/favicon.ico https://placehold.co/32x32/222222/ffffff.ico
fi

# Find all nested frontend directories
echo "Finding all nested frontend directories..."
FRONTEND_DIRS=$(find . -name "frontend" -type d | sort)

# Create icon directories and copy files
for dir in $FRONTEND_DIRS; do
  echo "Processing directory: $dir"
  
  # Create directories
  mkdir -p "$dir/public/icon/dark" "$dir/public/icon/light"
  
  # Copy icons
  cp public/icon/dark/16.png "$dir/public/icon/dark/16.png"
  cp public/icon/dark/32.png "$dir/public/icon/dark/32.png"
  cp public/icon/light/16.png "$dir/public/icon/light/16.png"
  cp public/icon/light/32.png "$dir/public/icon/light/32.png"
  cp public/apple-icon.png "$dir/public/apple-icon.png"
  cp public/favicon.ico "$dir/public/favicon.ico"
  
  echo "Copied icons to $dir/public/"
done

echo "Icon files have been copied to all frontend directories"
echo "You may need to restart your development server for changes to take effect" 