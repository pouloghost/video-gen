#!/bin/bash

# Script to merge refs.json and storyboard.json
# Usage: ./mergeJson.sh <path_to_refs.json> <path_to_storyboard.json> <output_path>

# Check if correct number of arguments provided
# if [ $# -ne 3 ]; then
#     echo "Usage: $0 <path_to_refs.json> <path_to_storyboard.json> <output_path>"
#     exit 1
# fi

# Get file paths from command line arguments
REFS_FILE="/Users/zty/video-gen/狼牙山五壮士/anime/refs.json"
STORYBOARD_FILE="/Users/zty/video-gen/狼牙山五壮士/anime/storyboard.json"
OUTPUT_FILE="/Users/zty/video-gen/狼牙山五壮士/anime/merged_storyboard.json"

# Check if files exist
if [ ! -f "$REFS_FILE" ]; then
    echo "Error: refs file not found - $REFS_FILE"
    exit 1
fi

if [ ! -f "$STORYBOARD_FILE" ]; then
    echo "Error: storyboard file not found - $STORYBOARD_FILE"
    exit 1
fi

# Run the node script to merge the JSON files
node "$(dirname "$0")/merge_story_board.js" "$STORYBOARD_FILE" "$REFS_FILE" "$OUTPUT_FILE"

echo "Merge completed. Output saved to $OUTPUT_FILE"