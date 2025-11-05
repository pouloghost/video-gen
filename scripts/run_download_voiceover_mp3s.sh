#!/bin/bash

# Script to download voiceover MP3 files
# Usage: ./run_download_voiceover_mp3s.sh <start_index>

# Check if correct number of arguments provided
if [ $# -ne 1 ]; then
    echo "Usage: $0 <start_index>"
    echo "Example: $0 5.1"
    exit 1
fi

# Get start index from command line arguments
START_INDEX=$1

# Run the node script to download MP3 files
node "$(dirname "$0")/download-voiceover-mp3s.js" "../狼牙山五壮士/mp3s.txt" "../狼牙山五壮士/voiceover-splited.txt" "$START_INDEX"

echo "MP3 download process completed."