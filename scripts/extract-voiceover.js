const fs = require('fs');
const path = require('path');

// Get input file, start index and end index from command line arguments
const inputFile = process.argv[2];
const startIndex = parseFloat(process.argv[3]);
const endIndex = parseFloat(process.argv[4]);

// Validate command line arguments
if (!inputFile || isNaN(startIndex) || isNaN(endIndex)) {
  console.error('Usage: node extract-voiceover.js <input_file> <start_index> <end_index>');
  console.error('Example: node extract-voiceover.js ../狼牙山五壮士/voiceover-splited.txt 5.1 10.2');
  process.exit(1);
}

if (startIndex > endIndex) {
  console.error('Error: Start index must be less than or equal to end index');
  process.exit(1);
}

// Read the input file
const filePath = path.join(__dirname, inputFile);
if (!fs.existsSync(filePath)) {
  console.error(`Error: File not found - ${filePath}`);
  process.exit(1);
}

const fileContent = fs.readFileSync(filePath, 'utf8');
const lines = fileContent.split('\n').filter(line => line.trim() !== '');

// Parse each line to extract index and voiceover text
const voiceoverArray = [];
for (const line of lines) {
  const match = line.match(/^(\d+\.\d+)\s+(.+)$/);
  if (match) {
    const index = parseFloat(match[1]);
    const text = match[2];
    voiceoverArray.push({ index, text });
  }
}

// Filter voiceover array based on start and end indices
const filteredVoiceover = voiceoverArray.filter(item => 
  item.index >= startIndex && item.index <= endIndex
);

// Output just the voiceover text parts as a simple array
const textOnly = filteredVoiceover.map(item => item.text);
console.log(JSON.stringify(textOnly, null, 2));