# UI Spec: Storyboard Editor - Main

## 1. Layout Overview
*   **Parent**: Storyboard Tab.
*   **Structure**:
    *   Top: Toolbar.
    *   Center: Panel Grid/List (Scrollable).
    *   Bottom: Timeline (Fixed).
    *   Right (Overlay): Floating Asset Preview.

## 2. Toolbar
*   **Left**:
    *   `Batch Indicator`: "Batch 1 (Scenes 1-30)".
    *   `Pagination`: < Prev | Next >.

## 3. Panel Card (Grid View)
*   **Style**: Card, fixed width (~300px), variable height.
*   **Header**:
    *   `Scene ID`: "Scene 5".
    *   `Duration`: "3.5s" (Editable? No, syncs with VO).

### 3.1 Default Mode (Overview Mode)
*   **Visual Section**:
    *   `Description`: Text Area (Auto-resize).
    *   `Reference`: Thumbnail (Click to expand).
*   **Action**:
    *   `Magic Generate` Button: "Generate Keyframe".
        *   **Interaction**: Clicking this shrinks the Visual Section (or moves it to the side) and expands the **Generation Step-by-Step View**.

### 3.2 Generation Mode (Step-by-Step View)
*   **Layout**: Accordion or Vertical Step List.
*   **Step 1: A list of T2I Prompts (Keyframe)**
    *   `Prompt Text`: Read-only/Editable text area.
    *   `Copy` Button.
    *   `Action`:
        *   User goes to Midjourney to generate.
        *   User pastes the result image back here.
    *   `Finish` Button:
        *   Only enabled after image is pasted/uploaded.
        *   Clicking it marks this step complete and unlocks Step 2.
*   **Step 2: A list of I2V Prompts (Video)**
    *   `State`: Locked until Step 1 is finished.
    *   `Prompt Text`: Read-only/Editable.
    *   `Copy` Button.
    *   `Action`:
        *   User goes to Runway/Pika.
        *   User pastes the result video URL/File.
    *   `Finish` Button:
        *   Marks the panel as "Done".
        *   Collapses Generation View, returns to Default Mode with previews populated.

## 4. Timeline (Bottom)
*   **Height**: `120px`.
*   **Track**: Horizontal scroll.
*   **Clips**:
    *   Represent Scenes.
    *   Width proportional to duration.
    *   Label: Scene ID.
    *   Color: Blue (Active), Gray (Inactive).

## 5. Interactions
*   **Generate Prompts**:
    *   Clicking "Generate" on a panel sends request to LLM.
    *   Input: Global Assets + Current Panel Visual Desc.
    *   Output: Fills T2I/I2V text areas in the Step-by-Step view.
*   **Keyframe Upload**:
    *   User generates image in Midjourney -> Copies Image -> Pastes in Panel.
    *   **Continuity Check**: If next panel `panel.is_continue = true`, User must upload current "Panel's Keyframe" as a required input reference before mark generation finish.
    *   Panel updates `keyframe_url`.
