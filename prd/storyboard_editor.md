# Storyboard Editor 设计 (Storyboard Editor Design)

## 1. 功能概述
核心生成单元。用户在此基于 Global Assets 的上下文，逐幕生成和打磨视频内容。
**核心理念**：Panel Centric (以分镜为中心)。

## 2. 界面布局 (Interface Layout)

### 2.1 悬浮资产球 (Floating Asset Preview)
*   **位置**：常驻右下角或侧边栏，可折叠。
*   **功能**：
    *   **Quick View**: 鼠标悬停显示当前项目的主角头像、场景缩略图。
    *   **Context Awareness**: 始终展示最新的 Global Assets 状态。

### 2.2 分镜工作区 (Panel Workspace)
以 **Batch (30幕)** 为单位进行加载，但支持单幕精修。

*   **Panel Card**:
    *   **Header**: Scene ID | Duration.
    *   **Visual Editor**:
        *   **Description**: 画面描述文本。
        *   **Composition**: (可选) 构图简笔画或 Reference Image 上传。
    *   **Prompt Generator**:
        *   `Generate Prompts` 按钮：调用 LLM，结合 Global Assets (角色/场景) 和当前 Visual Desc 生成。
        *   **T2I Prompt**: 用于生成关键帧，每个关键帧要确认生成成功/失败。
        *   **I2V Prompt**: 用于生成视频，必须有关键帧之后。

### 2.3 底部时间轴 (Timeline)
*   与 Global Assets 中的 Audio Duration 保持同步。
*   支持调整分镜时长，若调整，需反馈给 Global Assets 更新 VO 剪辑 (或提示不一致)。

## 3. 核心交互流程

1.  **初始化**：
    *   加载 Global Assets 中的 VO 和 Concept。
    *   LLM 自动生成第一批 (Batch 1) 分镜草稿。
2.  **逐幕精修**：
    *   用户点击某个 Panel。
    *   打开 **悬浮资产球**，确认该幕出场角色。
    *   修改 Visual Description。
    *   点击 `Generate Prompts`。
3.  **生成与导出**：
    *   用户复制 Prompt 到站外工具生成素材。
