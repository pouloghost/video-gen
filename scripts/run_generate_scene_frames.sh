#!/bin/bash

# Check if panel_id is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <panel_id> [anime_dir]"
  echo "  panel_id: Required. The ID of the panel to generate scene frames for."
  echo "  anime_dir: Optional. The working directory. Defaults to '../狼牙山五壮士/anime'."
  exit 1
fi

# Assign arguments to variables
panel_id=$1
anime_dir="$(dirname "$0")/../狼牙山五壮士/anime-revised/"

# Execute the Node.js script with the provided arguments
node "$(dirname "$0")/generate-scene-frames.js" "$panel_id" "$anime_dir"