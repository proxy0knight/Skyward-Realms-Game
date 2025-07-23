# Frontend Visual Module

This directory contains modular visual and styling components for the game, with all assets and texts handled via a JSON file for easy customization.

## MainMenuLoading Component

- **File:** `MainMenuLoading.jsx`
- **Styles:** `MainMenuLoading.css`
- **Assets & Texts:** `assets.json`

### Usage

1. **Import the component:**
   ```jsx
   import MainMenuLoading from './frontend/MainMenuLoading';
   ```
2. **Render in your app:**
   ```jsx
   <MainMenuLoading onLoaded={yourCallbackFunction} />
   ```
3. **Customize assets/texts:**
   - Edit `assets.json` to change the logo, crown image, or loading text.

### assets.json Example
```json
{
  "logo": "../game-client/src/assets/images/game-logo.png",
  "crown": "../game-client/src/assets/images/fantasy_mountains.jpg",
  "loadingText": "Loading..."
}
```

---

- All images and texts are referenced as variables from `assets.json` for easy future updates.
- Add new components and reference their assets/texts in the same way for consistency.