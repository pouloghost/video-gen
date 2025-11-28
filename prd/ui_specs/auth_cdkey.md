# UI Spec: Auth & CDKey

## 1. Login / Register Page
*   **Route**: `/login`
*   **Layout**: Center Card Layout.
*   **Components**:
    *   `Title`: "Welcome to VideoGen"
    *   `Tabs`: Login | Register
    *   **Login Tab**:
        *   `Input`: Phone Number.
        *   `Input`: Password.
        *   `Button`: "Login" (Primary, Full Width).
    *   **Register Tab**:
        *   `Input`: Phone Number.
        *   `Input`: Verification Code (with "Send Code" button).
        *   `Input`: Password.
        *   `Input`: Confirm Password.
        *   `Button`: "Sign Up" (Primary, Full Width).

## 2. CDKey Activation Page
*   **Route**: `/activate` (Redirect here if `user.status === 'inactive'`)
*   **Layout**: Center Card Layout (Modal-like).
*   **Components**:
    *   `Icon`: Lock/Key Icon (Large).
    *   `Title`: "Activate Your License".
    *   `Description`: "Please enter your product key to continue."
    *   `Input`: CDKey Input (4 groups of 4 chars or single string).
        *   *Format*: `XXXX-XXXX-XXXX-XXXX`
    *   `Button`: "Activate" (Primary).
    *   `Link`: "Where to buy?" (Opens external shop).
    *   `Logout`: "Sign in with different account".

## 3. User Dropdown (Header)
*   **Trigger**: User Avatar.
*   **Menu Items**:
    *   `Profile`: Shows Phone Number.
    *   `License Info`:
        *   Label: "Active" (Green Dot).
        *   Text: "Expires: 2025-12-31".
    *   `Bind New Key`: Opens Activation Modal.
    *   `Logout`: Clears JWT, redirects to Login.

## 4. Error States
*   **Invalid Key**: Toast Error "Invalid CDKey format".
*   **Used Key**: Toast Error "This CDKey is already bound to another account".
*   **Expired**:
    *   Global Banner: "Your license has expired. [Renew Now]"
    *   Disable all "Generate" buttons.
