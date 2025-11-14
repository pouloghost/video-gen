import path from 'path';
import { slowZoomInHandler } from './handlers/slow-zoom-in';

// 定义请求参数类型
export interface StaticFxParams {
  target_image: string;
  duration: number;
  coordinate: [number, number, number, number]; // [top, left, bottom, right] in percentages
  fx: string;
}

// 定义响应类型
export interface StaticFxResult {
  success: boolean;
  video_path: string;
}

// 特效处理器映射
const fxHandlers: Record<string, (params: StaticFxParams) => Promise<StaticFxResult>> = {
  'slow_zoom_in': slowZoomInHandler,
  // 可以继续添加更多特效处理器
};

// 主处理函数
export async function applyStaticFx(params: StaticFxParams): Promise<StaticFxResult> {
  const { target_image, fx } = params;
  
  // 检查特效是否存在
  if (!fxHandlers[fx]) {
    throw new Error(`Unsupported effect: ${fx}`);
  }
  
  // 获取目标图像的绝对路径
  const imagePath = path.isAbsolute(target_image) 
    ? target_image 
    : path.resolve(process.cwd(), target_image);
  
  // 检查文件是否存在
  const fs = await import('fs');
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image file not found: ${imagePath}`);
  }
  
  // 调用对应的特效处理器
  const handler = fxHandlers[fx];
  return await handler({
    ...params,
    target_image: imagePath
  });
}