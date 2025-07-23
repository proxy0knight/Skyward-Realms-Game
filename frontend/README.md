# Frontend Visual Module

This directory contains modular visual and styling components for the game, with all assets and texts handled via a JSON file for easy customization.

## MainMenuLoading Component

- **File:** `MainMenuLoading.jsx`
- **Styles:** `MainMenuLoading.css`
- **Assets & Texts:** JSON file, dynamically loaded via `assetsPath` prop

### Usage

1. **Import the component:**
   ```jsx
   import MainMenuLoading from './frontend/MainMenuLoading';
   ```
2. **Render in your app:**
   ```jsx
   // For main menu loading
   <MainMenuLoading assetsPath="/frontend/assets-mainmenu.json" durationMs={2000} onLoaded={yourCallbackFunction} />

   // For another page loading (e.g., map editor)
   <MainMenuLoading assetsPath="/frontend/assets-mapeditor.json" durationMs={3500} onLoaded={yourCallbackFunction} />
   ```
   - `assetsPath` (string, required): Path to the JSON file containing assets and texts for this loading screen instance.
   - `durationMs` (number, optional): Total loading duration in milliseconds (default: 2000ms).
   - `onLoaded` (function, optional): Callback when loading completes.
3. **Customize assets/texts:**
   - Create a JSON file for each context (e.g., `assets-mainmenu.json`, `assets-mapeditor.json`).
   - Example:
     ```json
     {
       "logo": "../game-client/src/assets/images/game-logo.png",
       "crown": "../game-client/src/assets/images/fantasy_mountains.jpg",
       "loadingText": "Loading..."
     }
     ```

---

- All images and texts are referenced as variables from the JSON file for easy future updates.
- Add new components and reference their assets/texts in the same way for consistency.