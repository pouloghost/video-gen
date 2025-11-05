const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get panel_id and animeDir from command line arguments
const panelId = process.argv[2];
const animeDir = process.argv[3] || path.join(__dirname, '..', '狼牙山五壮士', 'anime');

if (!panelId) {
  console.error('Please provide a panel_id as an argument');
  process.exit(1);
}

// Define base directories
const projectRoot = path.join(__dirname, '..');
const promptsDir = path.join(projectRoot, 'prompts');

// Read template file
const templatePath = path.join(promptsDir, 'scene-frames.txt');
let templateContent = fs.readFileSync(templatePath, 'utf8');

// Read data files
const mergedStoryboard = JSON.parse(fs.readFileSync(path.join(animeDir, 'merged_storyboard.json'), 'utf8'));
const refs = JSON.parse(fs.readFileSync(path.join(animeDir, 'refs.json'), 'utf8'));

// Find scene by panel_id
const scene = mergedStoryboard.scenes.find(s => s.panel_id === parseInt(panelId));
if (!scene) {
  console.error(`Scene with panel_id ${panelId} not found`);
  process.exit(1);
}

// Process setting
let settingContent = '';
if (scene.setting) {
  // Find setting in refs
  const settingRef = refs.settings.find(s => s.id === scene.setting);
  if (settingRef) {
    delete settingRef.scene_ids;
    // Read setting prompt from file
    const settingFilePath = path.join(animeDir, 'setting', `setting-${scene.setting}.json`);
    if (fs.existsSync(settingFilePath)) {
      const settingData = JSON.parse(fs.readFileSync(settingFilePath, 'utf8'));
      // Add setting_image_prompt field
      const settingWithImagePrompt = {
        ...settingRef,
        setting_image_prompt: settingData.prompt
      };
      settingContent = JSON.stringify(settingWithImagePrompt, null, 2);
    } else {
      settingContent = JSON.stringify(settingRef, null, 2);
    }
  }
}

// Process characters
let charactersContent = [];
if (scene.characters && scene.characters.length > 0) {
  scene.characters.forEach(charId => {
    // Find character in refs
    const characterRef = refs.characters.find(c => c.id === charId);
    if (characterRef) {
      delete characterRef.scene_ids;
      // Read character prompt from file
      const characterFilePath = path.join(animeDir, 'character', `character-${charId}.json`);
      if (fs.existsSync(characterFilePath)) {
        const characterData = JSON.parse(fs.readFileSync(characterFilePath, 'utf8'));
        // Add portrait_prompt field
        const characterWithPortraitPrompt = {
          ...characterRef,
          portrait_prompt: characterData.prompt
        };
        charactersContent.push(JSON.stringify(characterWithPortraitPrompt, null, 2));
      } else {
        charactersContent.push(JSON.stringify(characterRef, null, 2));
      }
    }
  });
}

// Replace placeholders in template
templateContent = templateContent.replace('<gt_tmpl>setting</gt_tmpl>', settingContent);
templateContent = templateContent.replace('<gt_tmpl>character</gt_tmpl>', charactersContent.join('\n\n'));
templateContent = templateContent.replace('<gt_tmpl>scene</gt_tmpl>', JSON.stringify(scene, null, 2));

// Write output file
const outputPath = path.join(animeDir, 'scene', `scene-${panelId}.txt`);
fs.writeFileSync(outputPath, templateContent);

console.log(`Scene frames prompt generated successfully: ${outputPath}`);

// Copy to clipboard on macOS
try {
  // Use pbcopy to copy the content
  execSync(`pbcopy < "${outputPath}"`);
  
  console.log('Content copied to clipboard successfully');
} catch (error) {
  console.warn('Failed to copy content to clipboard:', error.message);
}