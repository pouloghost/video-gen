# UI Spec: Project Dashboard (Home)

## 1. Layout Overview
*   **Route**: `/dashboard` (Default after login).
*   **Layout**: Global Layout (Top Nav only, No Sidebar or simplified Sidebar).

## 2. Top Navigation (Dashboard Mode)
*   **Left**: Logo.
*   **Right**:
    *   `Create Project` Button (Primary).
    *   `User Avatar` (Dropdown).

## 3. User Info Section (Header)
*   **Style**: Banner / Hero section.
*   **Content**:
    *   `Greeting`: "Welcome back, [User Phone]".
    *   `Plan Info`:
        *   "Pro Plan" (Badge).
        *   "Valid until: 2025-12-31".
    *   `Stats`:
        *   "Projects: 12".
        *   "Generated Videos: 45".

## 4. Project List Section
*   **Header**: "My Projects" | Search Input | Sort Dropdown (Newest/Oldest).
*   **Grid**: Responsive (3-4 columns).
*   **Empty State**:
    *   Illustration.
    *   Text: "No projects yet. Start your first video creation!"
    *   Button: "Create New Project".

## 5. Project Card Component
*   **Visual**:
    *   `Thumbnail`:
        *   If project has Character ref: Show first character ref.
        *   Else: Placeholder gradient with Project Title.
*   **Info**:
    *   `Title`: "Cyberpunk City Intro".
    *   `Last Edited`: "2 hours ago".
    *   `Status`: "Draft" | "Exported".
*   **Actions (Hover)**:
    *   `Open`: Click card body.
    *   `Menu (...)`:
        *   Rename.
        *   Delete (Confirm Modal).

## 6. Create Project Modal
*   **Trigger**: Click "Create Project".
*   **Fields**:
    *   `Project Name` (Required).
    *   `Description` (Optional).
*   **Action**: "Create" -> Redirects to `/project/[id]/global-assets`.

## 7. Interactions
*   **Navigation**: Clicking a project card navigates to the Editor (Global Assets / Storyboard) for that specific project ID.
*   **Back to Dashboard**: In the Editor, clicking the Logo or a "Home" icon in the Top Nav returns here.
