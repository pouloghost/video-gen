#!/bin/bash

# Script to extract voiceover text based on start and end indices
# Usage: ./extract-voiceover.sh <start_index> <end_index>

# Check if correct number of arguments provided
if [ $# -ne 2 ]; then
    echo "Usage: $0 <start_index> <end_index>"
    echo "Example: $0 5.1 10.2"
    exit 1
fi

# Get start and end indices from command line arguments
START_INDEX=$1
END_INDEX=$2

# Run the node script to extract voiceover
node "$(dirname "$0")/extract-voiceover.js" "../狼牙山五壮士/voiceover-splited.txt" "$START_INDEX" "$END_INDEX"

echo "Voiceover extraction completed."