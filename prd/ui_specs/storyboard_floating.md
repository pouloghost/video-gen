# UI Spec: Storyboard - Floating Asset Preview

## 1. Component Overview
*   **Type**: Floating Action Button (FAB) + Popover / Drawer.
*   **Position**: Bottom Right (fixed).
*   **Z-Index**: High (Overlay).

## 2. Collapsed State (FAB)
*   **Icon**: "Assets" / "Layers".
*   **Label**: "Global Assets".
*   **Interaction**: Click to expand.

## 3. Expanded State (Panel)
*   **Dimensions**: Width 300px, Height 500px (or dynamic).
*   **Header**: "Quick Assets" | Close Button.
*   **Tabs**: Characters | Scenes.
*   **Content (List)**:
    *   **Character Item**:
        *   Avatar (Circle).
        *   Name.
        *   `Copy Prompt` Button (Copies "A young warrior with blue hair...").
        *   `Drag Handle`: Drag to Storyboard Panel to insert Name into description.
    *   **Scene Item**:
        *   Thumbnail (Rectangle).
        *   Name.
        *   `Copy Prompt` Button.

## 4. Context Awareness
*   **Sync**:
    *   If Global Assets are updated in the other tab, this list must reflect changes immediately.
*   **Usage**:
    *   User is writing a Visual Description in Scene 5.
    *   Opens Floating Panel.
    *   Sees "Hero" character.
    *   Drags "Hero" into Scene 5 description.
    *   Text becomes "Hero stands in the rain...".
