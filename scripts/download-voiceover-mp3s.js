const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Get input parameters
const mp3sFilePath = process.argv[2];
const voiceoverFilePath = process.argv[3];
const startIndex = process.argv[4];

// Validate command line arguments
if (!mp3sFilePath || !voiceoverFilePath || !startIndex) {
  console.error('Usage: node download-voiceover-mp3s.js <mp3s_file> <voiceover_file> <start_index>');
  console.error('Example: node download-voiceover-mp3s.js ../狼牙山五壮士/anime/scene/mp3s.txt ../狼牙山五壮士/voiceover-splited.txt 5.1');
  process.exit(1);
}

// Read the mp3s file
const mp3sPath = path.join(__dirname, mp3sFilePath);
if (!fs.existsSync(mp3sPath)) {
  console.error(`Error: MP3s file not found - ${mp3sPath}`);
  process.exit(1);
}

const mp3sContent = fs.readFileSync(mp3sPath, 'utf8');
const mp3sOutput = JSON.parse(mp3sContent).output;

// Extract URLs using regex
const urlRegex = /https?:\/\/[^\s"')]+\.mp3/g;
const urls = mp3sOutput.match(urlRegex) || [];

if (urls.length === 0) {
  console.error('No MP3 URLs found in the mp3s file');
  process.exit(1);
}

// Read the voiceover file
const voiceoverPath = path.join(__dirname, voiceoverFilePath);
if (!fs.existsSync(voiceoverPath)) {
  console.error(`Error: Voiceover file not found - ${voiceoverPath}`);
  process.exit(1);
}

const voiceoverContent = fs.readFileSync(voiceoverPath, 'utf8');
const voiceoverLines = voiceoverContent.split('\n').filter(line => line.trim() !== '');

// Parse voiceover lines to get indices
const voiceoverIndices = [];
for (const line of voiceoverLines) {
  const match = line.match(/^(\d+\.\d+)\s+/);
  if (match) {
    voiceoverIndices.push(match[1]);
  }
}

// Find the starting index position
const startIndexPosition = voiceoverIndices.indexOf(startIndex);
if (startIndexPosition === -1) {
  console.error(`Start index ${startIndex} not found in voiceover file`);
  process.exit(1);
}

// Create output directory if it doesn't exist
const outputDir = path.join(path.dirname(mp3sPath), 'mp3s');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to download a single file
function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const outputPath = path.join(outputDir, filename);
    
    const file = fs.createWriteStream(outputPath);
    
    client.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log(`Downloaded: ${filename}`);
          resolve();
        });
        
        file.on('error', (err) => {
          fs.unlink(outputPath, () => {}); // Delete the file async
          reject(err);
        });
      } else {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Download all MP3 files
async function downloadAllMp3s() {
  console.log(`Found ${urls.length} MP3 URLs to download`);
  console.log(`Starting from voiceover index: ${startIndex} (position ${startIndexPosition} in voiceover list)`);
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const currentIndexIndex = startIndexPosition + i;
    
    if (currentIndexIndex >= voiceoverIndices.length) {
      console.error(`Not enough voiceover entries to map to all URLs. Stopping at URL ${i + 1}.`);
      break;
    }
    
    const currentIndex = voiceoverIndices[currentIndexIndex];
    // Convert index like "5.1" to "5-1" for filename
    const filename = `voiceover-${currentIndex.replace('.', '-')}.mp3`;
    
    console.log(`Downloading ${url} as ${filename}`);
    
    try {
      await downloadFile(url, filename);
    } catch (error) {
      console.error(`Failed to download ${url}:`, error.message);
      // Continue with the next file instead of stopping completely
    }
  }
  
  console.log('Download process completed.');
}

// Start the download process
downloadAllMp3s().catch(error => {
  console.error('Error during download process:', error.message);
  process.exit(1);
});