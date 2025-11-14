import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface Panel {
  panel_id: number;
  voiceover_ref: string;
  '3w': string;
  description: string;
  mood: string;
  camera: string;
  duration_sec: number;
  notes: string;
  is_continue: boolean;
  characters: number[];
  setting: number | null;
  voiceover: string;
}

interface Storyboard {
  scenes: Panel[];
}

/**
 * 从故事板中提取连续的panel组
 * 连续panel的定义：is_continue=false的单个panel，或者一个is_continue=false及其后续is_continue=true的所有panel
 */
function extractContinuousPanels(panels: Panel[]): Panel[][] {
  const continuousGroups: Panel[][] = [];
  let currentGroup: Panel[] = [];

  for (const panel of panels) {
    if (!panel.is_continue && currentGroup.length > 0) {
      // 开始新的组，保存当前组
      continuousGroups.push([...currentGroup]);
      currentGroup = [panel];
    } else {
      // 加入当前组
      currentGroup.push(panel);
    }
  }

  // 添加最后一个组
  if (currentGroup.length > 0) {
    continuousGroups.push(currentGroup);
  }

  return continuousGroups;
}

/**
 * 根据起始panel id找到对应的连续组
 */
function findGroupByStartPanelId(groups: Panel[][], startPanelId: number): Panel[] | null {
  return groups.find(group => group.length > 0 && group[0].panel_id === startPanelId) || null;
}

/**
 * 处理每个连续panel组，生成tween配置文件
 */
async function processPanels() {
  try {
    // 解析命令行参数
    const args = process.argv.slice(2);
    
    // 设置默认值和解析参数
    let storyboardPath = '';
    let templatePath = '';
    let outputDir = '';
    let startPanelId: number | null = null;

    // 简单的参数解析逻辑
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--storyboard' && i + 1 < args.length) {
        storyboardPath = args[i + 1];
        i++;
      } else if (args[i] === '--template' && i + 1 < args.length) {
        templatePath = args[i + 1];
        i++;
      } else if (args[i] === '--output' && i + 1 < args.length) {
        outputDir = args[i + 1];
        i++;
      } else if (args[i] === '--start-id' && i + 1 < args.length) {
        startPanelId = parseInt(args[i + 1]);
        if (isNaN(startPanelId)) {
          console.error('起始panel id必须是数字');
          process.exit(1);
        }
        i++;
      }
    }

    console.log(`参数配置:`);
    console.log(`- 故事板文件: ${storyboardPath}`);
    console.log(`- 模板文件: ${templatePath}`);
    console.log(`- 输出目录: ${outputDir}`);
    if (startPanelId !== null) {
      console.log(`- 起始panel id: ${startPanelId}`);
    }

    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 读取故事板数据
    if (!fs.existsSync(storyboardPath)) {
      console.error(`故事板文件不存在: ${storyboardPath}`);
      process.exit(1);
    }
    const storyboardData = fs.readFileSync(storyboardPath, 'utf-8');
    const storyboard: Storyboard = JSON.parse(storyboardData);

    // 读取模板文件
    if (!fs.existsSync(templatePath)) {
      console.error(`模板文件不存在: ${templatePath}`);
      process.exit(1);
    }
    const template = fs.readFileSync(templatePath, 'utf-8');

    // 提取连续panel组
    const continuousGroups = extractContinuousPanels(storyboard.scenes);

    if (startPanelId !== null) {
      // 只处理指定起始id的组
      const targetGroup = findGroupByStartPanelId(continuousGroups, startPanelId);
      if (targetGroup) {
        const endPanelId = targetGroup[targetGroup.length - 1].panel_id;
        const outputPath = path.join(outputDir, `tween-${startPanelId}-${endPanelId}.txt`);

        // 创建panel数据JSON字符串
        const panelData = JSON.stringify(targetGroup, null, 2);

        // 替换模板中的占位符
        const content = template.replace('<gt_tmpl>panel</gt_tmpl>', panelData);

        // 写入文件
        fs.writeFileSync(outputPath, content, 'utf-8');
        console.log(`生成文件: ${outputPath}`);
        
        // 复制内容到剪贴板（使用文件重定向避免引号转义问题）
        try {
          // 使用cat命令读取文件并通过管道传给pbcopy
          execSync(`cat ${outputPath} | pbcopy`);
          console.log(`内容已复制到剪贴板`);
        } catch (clipboardError: any) {
          console.warn('复制到剪贴板失败:', clipboardError.message);
        }
        
        console.log(`成功生成1个tween配置文件`);
      } else {
        console.error(`未找到起始id为${startPanelId}的panel组`);
        process.exit(1);
      }
    } else {
      // 为所有连续组生成文件
      let lastContent = '';
      for (const group of continuousGroups) {
        if (group.length === 0) continue;

        const startGroupPanelId = group[0].panel_id;
        const endPanelId = group[group.length - 1].panel_id;
        const outputPath = path.join(outputDir, `tween-${startGroupPanelId}-${endPanelId}.txt`);

        // 创建panel数据JSON字符串
        const panelData = JSON.stringify(group, null, 2);

        // 替换模板中的占位符
        const content = template.replace('<gt_tmpl>panel</gt_tmpl>', panelData);
        
        // 保存最后一个文件的内容
        lastContent = content;

        // 写入文件
        fs.writeFileSync(outputPath, content, 'utf-8');
        console.log(`生成文件: ${outputPath}`);
      }
    }
  } catch (error) {
    console.error('处理过程中发生错误:', error);
    process.exit(1);
  }
}

// 执行主函数
processPanels();