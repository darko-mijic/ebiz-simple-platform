#!/bin/bash
echo "======== FRONTEND DIRECTORY STRUCTURE ANALYSIS ========" && echo ""
FRONTEND_DIRS=$(find . -name "frontend" -type d | sort) && FRONTEND_COUNT=$(echo "$FRONTEND_DIRS" | wc -l) && echo "Found $FRONTEND_COUNT frontend directories:" && echo "$FRONTEND_DIRS"
