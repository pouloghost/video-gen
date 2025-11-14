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

    if (!(cropWidth > 0 && cropHeight > 0)) {
      throw new Error(`Invalid coordinate: [${coordinate.join(', ')}]`);
    }

    const imageWidth = await readImageWidth(target_image);
    const imageHeight = await readImageHeight(target_image);

    const fps = 60;
    const frames = Math.max(2, Math.round(duration * fps)); // 保证 >=2 帧
    const den = frames - 1;

    // 最终缩放倍数（目标是把选区放大到铺满整幅图）
    const sxFinal = 1 / cropWidth;
    const syFinal = 1 / cropHeight;

    // n 从 0→den，线性进度 p = n/den；避免使用逗号函数（min/if）以简化转义
    const scaleW = `round(iw*(1+(${sxFinal}-1)*n/${den}))`;
    const scaleH = `round(ih*(1+(${syFinal}-1)*n/${den}))`;
    // crop 发生在 scale 之后，这里的 iw/ih 即为缩放后的尺寸
    const cropXExpr = `round(${left}*iw*n/${den})`;
    const cropYExpr = `round(${top}*ih*n/${den})`;

    const filterGraph = [
      `[0:v]fps=${fps},format=gbrp,setsar=1`,
      `scale=${scaleW}:${scaleH}:eval=frame`,
      `crop=w=${imageWidth}:h=${imageHeight}:x=${cropXExpr}:y=${cropYExpr}:exact=1`,
      `format=yuv420p`
    ].join(',');

    const ffmpegArgs = [
      '-loop', '1',
      '-i', target_image,
      '-filter_complex', filterGraph,
      '-frames:v', String(frames),        // 用帧数收尾，避免最后几帧时间误差
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-preset', 'slow',
      '-crf', '18',
      '-movflags', '+faststart',
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