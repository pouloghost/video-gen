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
  
  const outputDir = path.dirname(target_image);
  const imageName = path.basename(target_image, path.extname(target_image));
  const outputVideo = path.join(outputDir, `${imageName}.mp4`);
  
  try {
    const [top, left, bottom, right] = coordinate;
    const cropWidth = right - left;
    const cropHeight = bottom - top;
    
    const imageWidth = await readImageWidth(target_image);
    const imageHeight = await readImageHeight(target_image);
    
    const fps = 60;
    
    // 计算裁剪区域
    const cropX = Math.round(left * imageWidth);
    const cropY = Math.round(top * imageHeight);
    
    // 使用scale2ref和overlay实现平滑缩放
    const ffmpegArgs = [
      '-loop', '1',
      '-i', target_image,
      '-filter_complex', [
        // 先放大，再裁剪，避免zoompan的精度问题
        `[0:v]scale='${imageWidth}+((${imageWidth}*(1/${cropWidth}-1))*t/${duration}):` +
        `${imageHeight}+((${imageHeight}*(1/${cropHeight}-1))*t/${duration})'` +
        `:eval=frame,` +
        `crop=${imageWidth}:${imageHeight}:` +
        `'${cropX}*t/${duration}':` +
        `'${cropY}*t/${duration}',` +
        `setpts=PTS-STARTPTS,` +
        `fps=${fps}`
      ].join(''),
      '-t', duration.toString(),
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-preset', 'slow',
      '-crf', '18',
      '-y',
      '-loglevel', 'error',
      outputVideo
    ];
    
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