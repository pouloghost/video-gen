const fs = require('fs');
const path = require('path');

// Function to read and parse JSON file
function readJsonFile(filePath) {
    const rawData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(rawData);
}

// Function to write JSON file
function writeJsonFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Function to get voiceover text by voiceover_ref
function getVoiceoverText(voiceoverRef, voiceoverFilePath) {
    if (!fs.existsSync(voiceoverFilePath)) {
        console.warn(`Voiceover file not found: ${voiceoverFilePath}`);
        return null;
    }
    
    const voiceoverContent = fs.readFileSync(voiceoverFilePath, 'utf8');
    const lines = voiceoverContent.split('\n').filter(line => line.trim() !== '');
    
    // Find the line that starts with the voiceover_ref
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith(voiceoverRef + ' ')) {
            // Return the text part after the voiceover_ref
            return trimmedLine.substring(voiceoverRef.length + 1).trim();
        }
    }
    
    console.warn(`Voiceover text not found for ref: ${voiceoverRef}`);
    return null;
}

// Main function to merge storyboard and refs
function mergeStoryBoard(storyboardPath, refsPath, outputPath) {
    // Read the storyboard and refs files
    const storyboard = readJsonFile(storyboardPath);
    const refs = readJsonFile(refsPath);

    // Create a map for quick lookup of characters and settings by scene_id
    const characterMap = new Map();
    const settingMap = new Map();

    // Populate character map
    refs.characters.forEach(character => {
        character.scene_ids.forEach(sceneId => {
            if (!characterMap.has(sceneId)) {
                characterMap.set(sceneId, []);
            }
            characterMap.get(sceneId).push(character.id);
        });
    });

    // Populate setting map
    refs.settings.forEach(setting => {
        setting.scene_ids.forEach(sceneId => {
            settingMap.set(sceneId, setting.id);
        });
    });

    // Merge characters and settings into scenes
    storyboard.scenes.forEach(scene => {
        const sceneId = scene.panel_id;
        
        // Add characters
        scene.characters = characterMap.get(sceneId) || [];
        
        // Add setting
        scene.setting = settingMap.get(sceneId) ? settingMap.get(sceneId) : null;
        
        // Add voiceover text if voiceover_ref exists
        if (scene.voiceover_ref) {
            // Determine the path to the voiceover-splited.txt file
            const animeDir = path.dirname(storyboardPath);
            const voiceoverFilePath = path.join(path.dirname(animeDir), 'voiceover-splited.txt');
            const voiceoverText = getVoiceoverText(scene.voiceover_ref, voiceoverFilePath);
            if (voiceoverText) {
                scene.voiceover = voiceoverText;
            }
        }
    });

    // Write the merged result to output file
    writeJsonFile(outputPath, storyboard);
    console.log(`Merged storyboard saved to ${outputPath}`);
}

// Get file paths from command line arguments
const args = process.argv.slice(2);
if (args.length !== 3) {
    console.error('Usage: node mergeStoryBoard.js <storyboard.json> <refs.json> <output.json>');
    process.exit(1);
}

const [storyboardPath, refsPath, outputPath] = args;

// Check if files exist
if (!fs.existsSync(storyboardPath)) {
    console.error(`StoryBoard file not found: ${storyboardPath}`);
    process.exit(1);
}

if (!fs.existsSync(refsPath)) {
    console.error(`Refs file not found: ${refsPath}`);
    process.exit(1);
}

// Run the merge function
mergeStoryBoard(storyboardPath, refsPath, outputPath);