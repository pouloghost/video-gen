import { applyStaticFx } from '../../dispatcher.ts';

async function testSlowZoomIn() {
  try {
    // 使用狼牙山五壮士目录下的测试图像
    const testImage = '/Users/zty/video-gen/狼牙山五壮士/anime-revised/scene/scene-1-0.png';
    const duration = 5; // 5秒
    const coordinate: [number, number, number, number] = [0.3, 0.3, 0.8, 0.8]; // 裁剪区域：top=30%, left=30%, bottom=80%, right=50%
    
    console.log('开始测试慢镜头缩放效果...');
    console.log('测试图像:', testImage);
    console.log('持续时间:', duration, '秒');
    console.log('裁剪坐标:', coordinate);
    
    const result = await applyStaticFx({
      target_image: testImage,
      duration,
      coordinate,
      fx: 'slow_zoom_in'
    });
    
    if (result.success) {
      console.log('测试成功！生成的视频路径:', result.video_path);
    } else {
      console.error('测试失败！');
    }
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}
testSlowZoomIn();
