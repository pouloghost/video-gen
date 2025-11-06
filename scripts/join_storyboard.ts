import * as fs from 'fs';
import * as path from 'path';

// Function to read and parse JSON file
function readJsonFile(filePath: string): any {
    const rawData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(rawData);
}

// Function to write JSON file
function writeJsonFile(filePath: string, data: any): void {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Main function to join all storyboard files
function joinStoryboards(storyboardsDir: string, outputFile: string): void {
    // Check if storyboards directory exists
    if (!fs.existsSync(storyboardsDir) || !fs.statSync(storyboardsDir).isDirectory()) {
        console.error(`Storyboards directory not found: ${storyboardsDir}`);
        process.exit(1);
    }

    // Read all JSON files from the storyboards directory
    const files = fs.readdirSync(storyboardsDir)
        .filter(file => path.extname(file) === '.json')
        .sort((a, b) => {
            // Sort files numerically by filename (1.json, 2.json, etc.)
            const numA = parseInt(path.basename(a, '.json'));
            const numB = parseInt(path.basename(b, '.json'));
            return numA - numB;
        });

    if (files.length === 0) {
        console.error(`No JSON files found in directory: ${storyboardsDir}`);
        process.exit(1);
    }

    // Read and parse all storyboard JSON files
    let allScenes: any[] = [];
    for (const file of files) {
        const filePath = path.join(storyboardsDir, file);
        console.log(`Processing file: ${filePath}`);
        
        try {
            const storyboardData = readJsonFile(filePath);
            
            // Check if it has scenes array directly or if scenes are nested
            if (Array.isArray(storyboardData)) {
                // If the JSON file contains an array of scenes directly
                allScenes = allScenes.concat(storyboardData);
            } else if (storyboardData.scenes && Array.isArray(storyboardData.scenes)) {
                // If the JSON file contains an object with a scenes property
                allScenes = allScenes.concat(storyboardData.scenes);
            } else {
                console.warn(`File ${file} does not contain a valid scenes array`);
            }
        } catch (error) {
            console.error(`Error reading file ${filePath}:`, error);
        }
    }

    // Sort scenes by panel_id
    allScenes.sort((a, b) => a.panel_id - b.panel_id);

    // Create a combined storyboard object with all scenes
    const mergedStoryboard = { scenes: allScenes };

    // Write the merged result to output file
    writeJsonFile(outputFile, mergedStoryboard);
    console.log(`Merged storyboard saved to ${outputFile}`);
    console.log(`Total scenes processed: ${allScenes.length}`);
}

// Get directory paths from command line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
    console.error('Usage: ts-node join_storyboard.ts <storyboards_directory> <output.json>');
    process.exit(1);
}

const [storyboardsDir, outputFile] = args;

// Run the join function
joinStoryboards(storyboardsDir, outputFile);