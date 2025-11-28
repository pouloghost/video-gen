# 全局导航与交互设计 (Global Navigation & Interaction Design)

## 1. 设计理念
*   **双核驱动**：系统分为 **Global Assets (全局资产)** 和 **Storyboard (故事板)** 两个核心入口。
*   **资产全局共享**：VO、故事概念、角色、场景属于全局资产，服务于所有分镜。
*   **分镜为生成单元**：Storyboard 是核心工作区，每个 Panel 是最小生成单元。


## 2. 布局结构 (Layout Structure)

### 2.0 仪表盘 (Dashboard)
*   **入口**：用户登录后的默认页面。
*   **功能**：项目列表管理、用户信息查看、新建项目。
*   **跳转**：点击具体项目后进入 **Project Editor** (包含 Global Assets 和 Storyboard)。

### 2.1 顶部导航栏 (Project Editor Top Bar)
*   **Left**:
    *   **Back to Dashboard**: 返回仪表盘图标。
    *   **Project Name**: 项目名称。
*   **Center (Main Switcher)**: 两个核心 Tab 切换。
    1.  **Global Assets** (VO / Concept / Visuals)
    2.  **Storyboard** (Script / Keyframes / Video)
*   **Export**: 新建按钮。

### 2.2 模块导航 (Sub-Navigation)

#### A. Global Assets 视图
左侧侧边栏导航：
1.  **VO & Audio**: 配音拆解与 TTS 生成。
2.  **Story Concept**: 故事核心概念与风格定义。
3.  **Visual Assets**: 角色 (Characters) 与 场景 (Scenes) 管理。

#### B. Storyboard 视图
*   **Timeline / Grid 切换**。
*   **Floating Asset Preview (悬浮资产球)**：
    *   常驻屏幕右下角或侧边。
    *   Hover/Click 展开小窗，快速查看当前已定义的角色和场景参考图，方便写 Prompt 时参考。

## 3. 交互逻辑 (Interaction Logic)

### 3.1 线性与非线性结合
*   **建议流程**：Global Assets (VO -> Concept -> Assets) -> Storyboard。
*   **非线性跳转**：用户可以在 Storyboard 发现缺少某个角色时，直接切回 Global Assets 添加，然后切回来继续生成。

### 3.2 状态同步
*   Global Assets 的变更（如修改了主角的参考图）应实时反映在 Storyboard 的悬浮预览中。
*   若修改了 VO 时长，Storyboard 中对应的 Panel 时长需同步更新（或提示冲突）。
