import { z } from 'zod';
import { applyStaticFx } from '../../../domains/video/static-fx/dispatcher';

// 定义请求参数schema
const StaticFxRequestSchema = z.object({
  target_image: z.string(),
  duration: z.number(),
  coordinate: z.array(z.number()).length(4), // [top, left, bottom, right] in percentages
  fx: z.string()
});

// 定义响应schema
const StaticFxResponseSchema = z.object({
  success: z.boolean(),
  video_path: z.string()
});

export default defineEventHandler(async (event) => {
  try {
    // 获取请求体
    const body = await readBody(event);
    
    // 验证请求参数
    const { target_image, duration, coordinate, fx } = StaticFxRequestSchema.parse(body);
    
    // 调用dispatcher处理特效
    const result = await applyStaticFx({
      target_image,
      duration,
      coordinate: coordinate as [number, number, number, number],
      fx
    });
    
    // 验证响应
    return StaticFxResponseSchema.parse(result);
  } catch (error) {
    console.error('Error in static-fx API:', error);
    return {
      success: false,
      video_path: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});