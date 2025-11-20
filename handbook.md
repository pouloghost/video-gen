整体步骤：
1. @prompts/split-text.txt 把所有旁白拆分
2. @prompts/story-concept.txt 整理故事大纲
3. @prompts/storyboard.txt 形成逐幕稿，30个一轮，都生成完之后执行 @scripts/run_join_storyboard.sh 合并成一个
4. 生成tts文件，放到mp3s文件夹
5. @prompts/extract-refs.txt 提取主体和布景，@prompts/character-ref.txt&@prompts/setting-ref.txt 生成参考图
6. 执行 @scripts/run_merge_story_board.sh 合并ref和Storyboard
7. 执行 @scripts/update-duration-from-mp3.js 更新storyboard中的duration
8. 执行 @scripts/run_generate_scene_frames.sh 给每一个panel生成描述。这里要把所有refs里的参考图都发给模型。生成描述后同一个对话中 @prompts/modify-check.txt 直到出现 all is right
9. 根据8中的json逐张生成关键帧，涉及到zoom、pan之类的简单运镜，模型一般会挂
10. 执行 @scripts/run_generate_tween.sh 生成关键帧之间的过渡策略
11. 根据10中的策略构建视频（即梦3.0pro或着@studio中的静态特效）