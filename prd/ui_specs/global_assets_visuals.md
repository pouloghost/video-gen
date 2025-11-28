# UI Spec: Global Assets - Visuals (Concept & Assets)

## 1. Layout Overview
*   **Parent**: Global Assets Tab -> Sidebar "Visual Assets".
*   **Structure**: Vertical Scroll (Concept Section -> Characters Section -> Scenes Section).

## 2. Section A: Story Concept
*   **Card Style**: Large Hero Card.
*   **Fields**:
    *   `Genre`: Tag Input (e.g., [Sci-Fi], [Thriller]).
    *   `Art Style`: Text Input with Autocomplete (e.g., "Cyberpunk", "Watercolor").
    *   `Core Theme`: Text Area (Brief description of the mood).
*   **Actions**:
    *   `Auto-Extract`: Button (Re-runs LLM analysis on VO).

## 3. Section B: Characters
*   **Header**: "Characters"
*   **Grid**: Responsive Grid (3 columns on desktop).
*   **Card Component**:
    *   **Thumbnail**:
        *   If `ref_image` exists: Show Image.
        *   Else: Placeholder with upload image.
    *   **Info**:
        *   `Name`: Bold text.
        *   `Tagline`: Short description (truncate 1 line).
    *   **Actions**: `Edit` (Pencil), `Delete`.

## 4. Section C: Scenes
*   **Header**: "Scenes"
*   **Grid**: Same as Characters.

## 5. Asset Detail Modal (Drawer)
*   **Trigger**: Clicking `Edit` or `Add` on Character/Scene card.
*   **Content**:
    *   `Name`.
    *   `Description`: "A young warrior with blue hair..."
    *   **Reference Image Uploader**:
        *   `Dropzone`: "Drag & drop or click to upload".
        *   `Preview`: Show uploaded image.
*   **Footer**:
    *   `Close`.

## 6. Interactions
*   **Validation**: Name is required.
*   **Sync**: Saving an asset immediately updates the "Floating Asset Preview" in Storyboard (if open).
