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

// Main function to extract entities and settings from refs.json
function extractEntitiesAndSettings(refsPath: string, outputPath: string): void {
    // Read the refs file
    const refs = readJsonFile(refsPath);

    // Extract entities and settings, removing thought and panel_ids
    const extractedData = {
        entities: refs.entities.map((entity: any) => {
            const { panel_ids, ...entityWithoutPanelIds } = entity;
            return entityWithoutPanelIds;
        }),
        settings: refs.settings.map((setting: any) => {
            const { panel_ids, ...settingWithoutPanelIds } = setting;
            return settingWithoutPanelIds;
        })
    };

    // Write the extracted data to output file
    writeJsonFile(outputPath, extractedData);
    console.log(`Extracted entities and settings saved to ${outputPath}`);
}

// Get file paths from command line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
    console.error('Usage: npx ts-node extract-entities-settings.ts <refs.json> <output.json>');
    process.exit(1);
}

const [refsPath, outputPath] = args;

// Check if refs file exists
if (!fs.existsSync(refsPath)) {
    console.error(`Refs file not found: ${refsPath}`);
    process.exit(1);
}

// Run the extraction function
extractEntitiesAndSettings(refsPath, outputPath);