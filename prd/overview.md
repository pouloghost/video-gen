# Video Generation Guidance Platform - Product Requirements Document (PRD)

## 1. 项目概述 (Project Overview)
本项目旨在构建一个引导用户生成视频的网站。核心价值在于串联“文生视频”的完整工作流，通过封装关键的Prompt工程，辅助用户从原始配音（VO）出发，自动化生成高质量的文生图（T2I）和图生视频（I2V）Prompt，最终由用户在站外工具中完成视频生成。

## 2. 核心流程 (Core Workflow)
系统采用 **双核驱动** 的架构，分为 **Global Assets** 和 **Storyboard** 两大模块。

### 模块一：Global Assets (全局资产)
负责定义视频的“骨架”和“灵魂”。
*   **VO & Audio**: 拆解配音，生成 TTS，确定时间轴。
*   **Story Concept**: 确定故事风格、流派。
*   **Visual Assets**: 确立角色和场景的形象标准 (Master References)。

### 模块二：Storyboard (分镜脚本)
负责具体的“血肉”填充。
*   **Batch Generation**: 批量生成分镜描述。
*   **Panel Editing**: 逐幕精修，结合 Global Assets 生成 Prompt。
*   **Floating Preview**: 在编辑分镜时，随时通过悬浮窗调用全局资产。
*   **Export**: 导出关键帧和视频生成 Prompt。

### 详细设计文档 (Detailed Design Docs)
*   **交互设计 (Interaction)**:
    *   [全局导航 (Navigation)](./nav.md)
    *   [Global Assets 模块](./global_assets.md)
    *   [Storyboard Editor 模块](./storyboard_editor.md)
    *   [账号与 CDKey](./account_cdkey.md)
*   **UI 开发规范 (UI Specs)**:
    *   [UI Spec: Project Dashboard](./ui_specs/dashboard.md)
    *   [UI Spec: Navigation & Layout](./ui_specs/nav_layout.md)
    *   [UI Spec: Auth & CDKey](./ui_specs/auth_cdkey.md)
    *   [UI Spec: Global Assets - VO](./ui_specs/global_assets_vo.md)
    *   [UI Spec: Global Assets - Visuals](./ui_specs/global_assets_visuals.md)
    *   [UI Spec: Storyboard Main](./ui_specs/storyboard_main.md)
    *   [UI Spec: Storyboard Floating](./ui_specs/storyboard_floating.md)

### 流程详情
1.  **VO 细化 (VO Refinement)**

    *   输入：原始 VO 文本。
    *   处理：调用大模型将原始 VO 拆解为细粒度的 VO 片段。
    *   输出：细粒度 VO 列表。
2.  **TTS 生成 (TTS Generation)**
    *   输入：细粒度 VO。
    *   处理：调用 TTS 服务生成语音。
    *   输出：音频文件及对应的时长信息。
3.  **故事概念抽取 (Story Concept Extraction)**
    *   输入：细粒度 VO。
    *   处理：调用大模型分析 VO 内容，抽取核心故事概念 (Story Concept)。
    *   输出：Story Concept 描述。
4.  **分镜脚本生成 (Storyboard Generation)**
    *   输入：细粒度 VO、Story Concept。
    *   处理：调用大模型生成分镜脚本 (Storyboard)。
    *   机制：以 30 幕 (Scenes) 为一个 Batch 进行生成。保持在同一个对话 Session 中，多轮对话完成全部分镜。
    *   输出：初步 Storyboard（包含画面描述等）。
5.  **角色与场景抽取 (Character & Scene Extraction)**
    *   输入：Storyboard。
    *   处理：分析 Storyboard 内容，提取关键角色 (Characters) 和 场景 (Scenes)。
    *   输出：角色列表、场景列表。
6.  **参考图 Prompt 生成 (Reference Image Prompt Generation)**
    *   输入：角色列表、场景列表。
    *   处理：为每个角色和场景生成用于文生图的 Prompt。
    *   输出：Character Prompts, Scene Prompts。
7.  **分镜脚本更新 (Storyboard Update)**
    *   输入：TTS 数据（时长）、参考图信息 (Ref Images/Prompts)。
    *   处理：将 TTS 的时间轴信息和生成的参考图信息回填整合到 Storyboard 中。
    *   输出：完整 Storyboard。
8.  **关键帧 Prompt 生成 (Keyframe Prompt Generation)**
    *   输入：完整 Storyboard、细粒度 VO。
    *   处理：综合分镜描述和 VO，为每一幕生成关键帧的文生图 (T2I) Prompt。
    *   输出：Keyframe Prompts 列表（用户可复制使用）。
9.  **视频生成 Prompt 生成 (Video Prompt Generation)**
    *   输入：Storyboard Panel 信息。
    *   处理：根据分镜动态描述，生成图生视频 (I2V) Prompt。
    *   输出：Video Prompts 列表（用户配合关键帧使用）。

## 3. 功能需求 (Functional Requirements)

### 3.1 输入与预处理
*   **VO 输入编辑器**：支持用户输入或粘贴长文本 VO。
*   **VO 拆分服务**：
    *   集成 LLM (如 GPT-4, Claude 等) 进行语义拆分。
    *   支持用户手动微调拆分后的 VO 片段。

### 3.2 故事板引擎 (Storyboard Engine)
*   **Batch 生成机制**：
    *   自动计算需要的 Batch 数量。
    *   维护 LLM 上下文窗口，确保分镜连贯性。
    *   支持“继续生成”操作。
*   **结构化存储**：Storyboard 需包含 Scene ID, Visual Description, Audio Script, Duration, Camera Movement 等字段。

### 3.3 资产管理 (Asset Management)
*   **实体识别**：自动识别脚本中的重复角色和场景。
*   **一致性控制**：确保生成的参考图 Prompt 包含一致的风格描述。

### 3.4 Prompt 封装与输出
*   **Prompt 模板系统**：
    *   内置针对主流生图/生视频模型（如 Midjourney, Stable Diffusion, Runway, Pika）的优化模板。
    *   支持动态填充变量（角色特征、环境描述、运镜指令）。
*   **用户交互界面**：
    *   提供清晰的 Prompt 复制按钮。
    *   (可选) 集成 API 直接调用生图工具（若支持）。
