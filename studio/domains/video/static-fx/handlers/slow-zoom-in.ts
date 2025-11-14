import { execa } from 'execa';
import path from 'path';
import type { StaticFxParams, StaticFxResult } from '../dispatcher';

async function readImageWidth(imagePath: string): Promise<number> {
  return readImageDimension(imagePath, 'width');
}

async function readImageHeight(imagePath: string): Promise<number> {
    return readImageDimension(imagePath, 'height');
}

async function readImageDimension(imagePath: string, dimension: 'width' | 'height'): Promise<number> {
  const { stdout } = await execa('ffprobe', [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', `stream=${dimension}`,
    '-of', 'csv=p=0',
    imagePath
  ]);
  return parseInt(stdout.trim(), 10);
}

export async function slowZoomInHandler(params: StaticFxParams): Promise<StaticFxResult> {
  const { target_image, duration, coordinate } = params;
  
  // 生成输出视频路径，包含特效名称以避免覆盖
  const outputDir = path.dirname(target_image);
  const imageName = path.basename(target_image, path.extname(target_image));
  const outputVideo = path.join(outputDir, `${imageName}.mp4`);
  
  try {
    // 验证参数
    if (duration <= 0) {
      throw new Error('Duration must be greater than 0');
    }
    
    // 计算缩放参数
    // coordinate: [top, left, bottom, right] in percentages
    const [top, left, bottom, right] = coordinate;
    
    // 验证坐标范围
    if (top < 0 || left < 0 || bottom > 100 || right > 100 || top >= bottom || left >= right) {
      throw new Error('Invalid coordinates: must be 0 <= top < bottom <= 100 and 0 <= left < right <= 100');
    }
    
    // 计算裁剪区域的宽高比例
    const cropWidth = right - left;
    const cropHeight = bottom - top;
    
    // 初始缩放比例（完全显示原始图像）
    const initialScale = Math.max(100 / cropWidth, 100 / cropHeight);
    
    // 最终缩放比例（放大到裁剪区域）
    const finalScale = 1.0;

    const imageWidth = await readImageWidth(target_image);
    const imageHeight = await readImageHeight(target_image);
    
    // 构建ffmpeg命令
    const ffmpegArgs = [
      '-loop', '1',
      '-i', target_image,
      '-vf', [
        // 首先根据coordinate裁剪图像
        `crop=w='iw*${cropWidth/100}':h='ih*${cropHeight/100}':x='iw*${left/100}':y='ih*${top/100}'`,
        // 然后应用缩放动画
        `zoompan=z='${initialScale}+(${finalScale}-${initialScale})*t/${duration}':d='${Math.floor(duration * 25)}':s=${imageWidth}x1080`,
        // 确保输出尺寸
        `scale=${imageWidth}:${imageHeight}`
      ].join(','),
      '-c:v', 'libx264',
      '-t', duration.toString(),
      '-pix_fmt', 'yuv420p',
      '-y', // 覆盖输出文件
      '-loglevel', 'error', // 只输出错误信息
      outputVideo
    ];
    
    // 执行ffmpeg命令
    await execa('ffmpeg', ffmpegArgs);
    
    return {
      success: true,
      video_path: outputVideo
    };
  } catch (error) {
    console.error('Error applying slow_zoom_in effect:', error);
    return {
      success: false,
      video_path: ''
    };
  }
}