# Frontend Visual Module

This directory contains modular visual and styling components for the game, with all assets and texts handled via a JSON file for easy customization.

## MainMenuLoading Component

- **File:** `MainMenuLoading.jsx`
- **Styles:** `MainMenuLoading.css`
- **Assets & Texts:** The parent page must provide the assets object directly (not a path)

### Usage

1. **Import the component:**
   ```jsx
   import MainMenuLoading from './frontend/MainMenuLoading';
   import mainMenuAssets from './frontend/assets-mainmenu.json';
   ```
2. **Render in your app:**
   ```jsx
   // For main menu loading with advice
   <MainMenuLoading
     assets={mainMenuAssets}
     durationMs={2000}
     onLoaded={yourCallbackFunction}
     showAdvice={true}
     waitingMsgPath="/frontend/waitingmsg.json"
   />

   // For another page loading (e.g., map editor) without advice
   import mapEditorAssets from './frontend/assets-mapeditor.json';
   <MainMenuLoading
     assets={mapEditorAssets}
     durationMs={3500}
     onLoaded={yourCallbackFunction}
     showAdvice={false}
   />
   ```
   - `assets` (object, required): The assets/texts object for this loading screen instance (imported or fetched by the parent page).
   - `durationMs` (number, optional): Total loading duration in milliseconds (default: 2000ms).
   - `onLoaded` (function, optional): Callback when loading completes.
   - `showAdvice` (boolean, optional): If true, shows a random advice/message in a resizable rectangle under the loading bar.
   - `waitingMsgPath` (string, optional): Path to the JSON file containing an array of advice/messages (default: `/frontend/waitingmsg.json`).
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
4. **Customize waiting messages:**
   - Edit `waitingmsg.json` to add or change the advice/messages shown when `showAdvice` is true.
   - Example:
     ```json
     [
       "Tip: You can double-click to run!",
       "Remember to save your progress often."
     ]
     ```

---

- All images and texts are referenced as variables from the JSON file for easy future updates.
- Add new components and reference their assets/texts in the same way for consistency.