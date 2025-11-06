#!/bin/bash

# Script to extract entities and settings from refs.json
# Usage: ./extract-entities-settings.sh

# Define paths
REFS_FILE="/Users/zty/video-gen/狼牙山五壮士/anime-revised/refs.json"
OUTPUT_FILE="/Users/zty/video-gen/狼牙山五壮士/anime-revised/extracted-data.json"

# Check if refs file exists
if [ ! -f "$REFS_FILE" ]; then
    echo "Error: refs file not found - $REFS_FILE"
    exit 1
fi

# Run the TypeScript script to extract entities and settings
npx ts-node "$(dirname "$0")/extract-entities-settings.ts" "$REFS_FILE" "$OUTPUT_FILE"

echo "Extraction completed. Output saved to $OUTPUT_FILE"