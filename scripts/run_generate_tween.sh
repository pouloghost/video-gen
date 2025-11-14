#!/bin/bash

# Script to generate tween configuration files
# Usage: ./run_generate_tween.sh [--start-id <panel_id>] [--storyboard <path>] [--template <path>] [--output <dir>]

# Default values
SCRIPT_DIR="$(dirname "$0")"
DEFAULT_STORYBOARD="$SCRIPT_DIR/../狼牙山五壮士/final/merged_storyboard.json"
DEFAULT_TEMPLATE="$SCRIPT_DIR/../prompts/tween.txt"
DEFAULT_OUTPUT="$SCRIPT_DIR/../狼牙山五壮士/final/tween/"
START_ID=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --start-id)
      START_ID="--start-id $2"
      shift 2
      ;;
    --storyboard)
      STORYBOARD="--storyboard $2"
      shift 2
      ;;
    --template)
      TEMPLATE="--template $2"
      shift 2
      ;;
    --output)
      OUTPUT="--output $2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--start-id <panel_id>] [--storyboard <path>] [--template <path>] [--output <dir>]"
      exit 1
      ;;
  esac
done

# Set default values if not provided
STORYBOARD=${STORYBOARD:-"--storyboard $DEFAULT_STORYBOARD"}
TEMPLATE=${TEMPLATE:-"--template $DEFAULT_TEMPLATE"}
OUTPUT=${OUTPUT:-"--output $DEFAULT_OUTPUT"}

# Execute the TypeScript script with the provided arguments
echo "Running generate_tween.ts with arguments: $STORYBOARD $TEMPLATE $OUTPUT $START_ID"
npx ts-node "$SCRIPT_DIR/generate_tween.ts" $STORYBOARD $TEMPLATE $OUTPUT $START_ID

echo "Tween configuration generation completed."