# Global Assets 模块设计 (Global Assets Module Design)

## 1. 功能概述
整合了原有的 VO Studio、Story Lab (Concept部分) 和 Asset Manager。
这是项目的“设定集”和“素材库”，为 Storyboard 提供所有必要的上下文和约束。

## 2. 子模块设计

### 2.1 VO & Audio (配音与音频)
*   **输入**：长文本编辑器。
*   **处理**：
    *   **Split**: 拆分为细粒度 VO Segments。
    *   **TTS**: 批量生成音频，获得 duration。
*   **输出**：结构化的 VO 列表（Text + Audio + Duration）。

### 2.2 Story Concept (故事概念)
*   **提取**：基于 VO 内容，LLM 自动提取 Genre, Art Style, Core Theme。
*   **编辑**：用户可修改风格关键词（如 "Cinematic Lighting", "Ghibli Style"）。
*   **作用**：作为全局 System Prompt 的一部分，约束所有画面的基调。

### 2.3 Visual Assets (视觉资产)
*   **角色 (Characters)**：
    *   自动提取。
    *   配置：Name, Description, **Master Reference Image**。
*   **场景 (Scenes)**：
    *   主要场景地点的定义。
    *   配置：Name, Environment Desc, **Master Reference Image**。
*   **交互**：
    *   提供“上传参考图”功能。
    *   **Lock**: 锁定一张满意的图作为全局参考。

## 3. 核心交互流程
1.  用户先完成 **VO & Audio**，确立时间基准。
2.  系统自动分析 VO，填充 **Story Concept** 初稿。
3.  用户进入 **Visual Assets**，预设关键角色和场景的形象（此时可能还没有具体分镜，但可以先定主角长相）。
4.  所有资产准备就绪后，进入 Storyboard 开始具体画面的创作。
