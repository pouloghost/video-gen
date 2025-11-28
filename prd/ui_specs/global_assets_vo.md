# UI Spec: Global Assets - VO & Audio

## 1. Layout Overview
*   **Parent**: Global Assets Tab -> Sidebar "VO & Audio".
*   **Structure**: Two-column layout (Left: Input, Right: Segments).

## 2. Left Column: Input Studio (Width: 40%)
*   **Header**: "Original Script".
*   **Component**: `TextArea`
    *   *Props*: `rows=20`, `placeholder="Paste your novel or script here..."`.
    *   *Style*: Monospace font, comfortable line height.
*   **Action Bar**:
    *   `Split Button`:
        *   Label: "Analyze & Split".
        *   Icon: Magic Wand.
        *   Action: Calls LLM to split text. Shows loading spinner overlay.
    *   `Clear Button`: Clears text.

## 3. Right Column: Segment Editor (Width: 60%)
*   **Header**: "Audio Segments".
*   **Toolbar**:
    *   `Voice Selector`: Dropdown (e.g., "Male - Deep", "Female - Soft").
    *   `Speed Slider`: 0.5x - 2.0x.
    *   `Generate All Button`: Primary. Triggers TTS for all segments.
*   **List Container**: Scrollable area.
*   **Item Component (VO Card)**:
    *   **State**: `Idle` | `Loading` | `Playing` | `Error`.
    *   **Content**:
        *   `Index`: "#1".
        *   `TextEditor`: Input for the segment text.
        *   `DurationBadge`: "3.2s" (Visible after TTS).
    *   **Actions**:
        *   `Play/Pause`: Icon button.
        *   `Merge Up`: Merges with previous segment.
        *   `Split Cursor`: Splits at cursor position.
        *   `Delete`: Trash icon.
*   **Footer**:
    *   `Save Assets`: Button. Commits changes to global state.

## 4. Interactions
*   **Split Logic**:
    *   On "Analyze", lock Left Column.
    *   Populate Right Column with cards.
*   **TTS Logic**:
    *   Debounce single card edits? No, explicit "Generate" button per card or "Generate All".
    *   On "Generate", show progress bar on card.
    *   On success, update `audio_url` and `duration`.
