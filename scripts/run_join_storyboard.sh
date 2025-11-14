#!/bin/bash

# Script to join all storyboard JSON files into one merged file
# Usage: ./run_join_storyboard.sh

# Define paths
STORYBOARDS_DIR="/Users/zty/video-gen/狼牙山五壮士/final/storyboards"
OUTPUT_FILE="/Users/zty/video-gen/狼牙山五壮士/final/storyboard.json"

# Check if storyboards directory exists
if [ ! -d "$STORYBOARDS_DIR" ]; then
    echo "Error: Storyboards directory not found - $STORYBOARDS_DIR"
    exit 1
fi

# Run the TypeScript script to join the JSON files
npx ts-node "$(dirname "$0")/join_storyboard.ts" "$STORYBOARDS_DIR" "$OUTPUT_FILE"

echo "Join completed. Output saved to $OUTPUT_FILE"