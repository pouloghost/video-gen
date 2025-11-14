#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { parseFile } = require('music-metadata');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

async function getMP3Duration(filePath) {
  try {
    const metadata = await parseFile(filePath);
    const durationInSeconds = metadata.format.duration;
    return Math.round(durationInSeconds);
  } catch (error) {
    console.error(`Error getting duration for ${filePath}:`, error);
    return 0;
  }
}

async function updateDurations() {
  const mp3Dir = '/Users/zty/video-gen/狼牙山五壮士/mp3s';
  const storyboardPath = '/Users/zty/video-gen/狼牙山五壮士/final/merged_storyboard.json';
  
  // 读取storyboard文件
  const storyboardContent = await readFile(storyboardPath, 'utf-8');
  const storyboard = JSON.parse(storyboardContent);
  
  // 创建voiceover_ref到时长的映射
  const durationMap = new Map();
  
  // 获取所有MP3文件的时长
  const mp3Files = fs.readdirSync(mp3Dir).filter(file => file.endsWith('.mp3'));
  
  console.log(`Found ${mp3Files.length} MP3 files`);
  
  for (const file of mp3Files) {
    const filePath = path.join(mp3Dir, file);
    const duration = await getMP3Duration(filePath);
    // 从文件名提取voiceover_ref格式 (voiceover-a-b.mp3 -> a.b)
    const match = file.match(/voiceover-(\d+)-(\d+)\.mp3/);
    if (match) {
      const ref = `${match[1]}.${match[2]}`;
      durationMap.set(ref, duration);
      console.log(`Duration for ${ref}: ${duration} seconds`);
    }
  }
  
  // 统计每个voiceover_ref出现的次数
  const refCount = new Map();
  for (const scene of storyboard.scenes) {
    if (scene.voiceover_ref) {
      const count = refCount.get(scene.voiceover_ref) || 0;
      refCount.set(scene.voiceover_ref, count + 1);
    }
  }
  
  // 更新每个scene的duration_sec字段
  let updatedCount = 0;
  for (const scene of storyboard.scenes) {
    if (scene.voiceover_ref && durationMap.has(scene.voiceover_ref)) {
      const totalDuration = durationMap.get(scene.voiceover_ref);
      const count = refCount.get(scene.voiceover_ref);
      const oldDuration = scene.duration_sec;
      scene.duration_sec = Math.round(totalDuration / count);
      console.log(`Updated panel ${scene.panel_id} (ref: ${scene.voiceover_ref}) from ${oldDuration} to ${scene.duration_sec} seconds (total: ${totalDuration}, count: ${count})`);
      updatedCount++;
    }
  }
  
  // 写入更新后的storyboard文件
  await writeFile(storyboardPath, JSON.stringify(storyboard, null, 2), 'utf-8');
  console.log(`Successfully updated ${updatedCount} scenes in storyboard with MP3 durations`);
}

updateDurations().catch(console.error);