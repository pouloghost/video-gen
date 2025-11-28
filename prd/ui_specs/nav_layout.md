# UI Spec: Navigation & Layout

## 1. 全局布局 (Global Layout)
采用 **响应式侧边栏 + 顶部导航** 的混合布局。

### 1.1 Root Container
*   **Style**: `h-screen w-screen flex flex-col overflow-hidden bg-gray-900 text-white`

### 1.2 Top Navigation Bar (Header)
*   **Height**: `64px`
*   **Background**: `bg-gray-800 border-b border-gray-700`
*   **Elements**:
    *   **Left**:
        *   `HomeButton`: Icon (Home/Grid) -> Link to `/dashboard`.
        *   `Divider`: Vertical line.
        *   `Logo`: Icon + Text "VideoGen".
        *   `ProjectTitle`: Input (transparent), placeholder="Untitled Project".
    *   **Center (Main Switcher)**:
        *   `SegmentedControl`:
            *   Option 1: **Global Assets** (Icon: Folder/Database)
            *   Option 2: **Storyboard** (Icon: Film/Clapperboard)
    *   **Right**:
        *   `ExportButton`: Primary Color, Icon=Export, Label="Export".
        *   `UserAvatar`: Dropdown menu (Profile, CDKey, Logout).

### 1.3 Sidebar (Left)
*   **Width**: `240px` (Collapsible to `64px`)
*   **Background**: `bg-gray-800 border-r border-gray-700`
*   **Context**: Changes based on Top Nav selection.

#### State A: Global Assets Mode
*   **Menu Items**:
    *   `VO & Audio` (Icon: Mic)
    *   `Story Concept` (Icon: Lightbulb)
    *   `Visual Assets` (Icon: Image)

#### State B: Storyboard Mode
*   **Menu Items**:
    *   `Timeline View` (Icon: Clock)
    *   `Grid View` (Icon: Grid)
    *   `List View` (Icon: List)
*   **Filter/Sort**:
    *   `Filter`: Dropdown (All Scenes, Missing Prompts, Completed).

### 1.4 Main Content Area
*   **Style**: `flex-1 overflow-auto bg-gray-900 relative`
*   **Padding**: `p-6`

## 2. 交互细节
*   **Tab Switching**:
    *   Clicking "Global Assets" -> Sidebar shows Asset modules -> Main Content loads last active asset module.
    *   Clicking "Storyboard" -> Sidebar shows View options -> Main Content loads Storyboard.
*   **Responsive**:
    *   On mobile (<768px), Sidebar becomes a Drawer (Hamburger menu).
