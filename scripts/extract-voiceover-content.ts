import * as fs from 'fs';
import * as path from 'path';

// 从命令行参数获取输入文件路径
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('错误：请提供输入文件路径作为命令行参数');
    console.error('用法：npx ts-node extract-voiceover-content.ts <输入文件路径>');
    process.exit(1);
}

const inputFilePath = args[0];

// 检查输入文件是否存在
if (!fs.existsSync(inputFilePath)) {
    console.error(`错误：输入文件不存在: ${inputFilePath}`);
    process.exit(1);
}

// 在输入文件的同级文件夹中生成输出文件
const inputDir = path.dirname(inputFilePath);
const inputFileName = path.basename(inputFilePath, path.extname(inputFilePath));
const outputFilePath = path.join(inputDir, `${inputFileName}-content.json`);

/**
 * 从voiceover-splited.txt文件中提取VO内容
 * @param filePath 输入文件路径
 * @returns VO内容数组
 */
function extractVoiceoverContent(filePath: string): string[] {
    try {
        // 读取文件内容
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // 按行分割文件内容
        const lines = content.split('\n');
        
        // 提取VO内容
        const voContent: string[] = [];
        
        lines.forEach(line => {
            // 忽略空行
            if (line.trim()) {
                // 匹配行中的格式：数字.数字 内容
                // 使用正则表达式提取内容部分
                const match = line.match(/^\d+\.\d+\s+(.+)$/);
                if (match && match[1]) {
                    voContent.push(match[1]);
                } else {
                    console.warn(`无法解析行: ${line}`);
                }
            }
        });
        
        return voContent;
    } catch (error) {
        console.error('读取文件时出错:', error);
        return [];
    }
}

/**
 * 将VO内容数组保存为JSON文件
 * @param content VO内容数组
 * @param outputPath 输出文件路径
 */
function saveAsJson(content: string[], outputPath: string): void {
    try {
        // 确保输出目录存在
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // 保存为JSON文件，使用缩进使输出更易读
        fs.writeFileSync(outputPath, JSON.stringify(content, null, 2), 'utf-8');
        console.log(`VO内容已成功保存到: ${outputPath}`);
        console.log(`总共提取了 ${content.length} 条VO内容`);
    } catch (error) {
        console.error('保存文件时出错:', error);
    }
}

/**
 * 主函数
 */
function main(): void {
    console.log('开始提取VO内容...');
    const voContent = extractVoiceoverContent(inputFilePath);
    saveAsJson(voContent, outputFilePath);
    
    // 输出前几条内容作为预览
    if (voContent.length > 0) {
        console.log('\n前5条VO内容预览:');
        voContent.slice(0, 5).forEach((vo, index) => {
            console.log(`${index + 1}. ${vo}`);
        });
    }
}

// 运行主函数
main();