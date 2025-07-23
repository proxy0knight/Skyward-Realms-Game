# Universal Loading Screen

A fully modular, universal loading screen React component for any page or app. All assets, texts, and options are customizable via JSON files, with robust fallback support.

## Directory Structure
```
universalLoadingScreen/
  UniversalLoadingScreen.jsx
  UniversalLoadingScreen.css
  fallback.json
  waitingmsg.json
  assets/
    assets.json
```

## Usage
```jsx
import UniversalLoadingScreen from './universalLoadingScreen/UniversalLoadingScreen';

<UniversalLoadingScreen
  progress={progress} // (required) number 0-100
  assetsPath="./universalLoadingScreen/assets/assets.json" // (optional)
  showAdvice={true} // (optional)
  waitingMsgPath="./universalLoadingScreen/waitingmsg.json" // (optional)
/>
```
- `progress` (number, required): Loading progress (0–100). Must be provided by the parent.
- `assetsPath` (string, optional): Path to the JSON file for logo, crown, and loading text. Defaults to fallback.json value.
- `showAdvice` (boolean, optional): Show/hide the advice/message rectangle. Defaults to fallback.json value (true).
- `waitingMsgPath` (string, optional): Path to the JSON file with advice/messages. Defaults to fallback.json value.

## Fallback Behavior
If any prop except `progress` is missing, the component loads `fallback.json` and uses its values for missing props. By default, the advice/message rectangle is shown and default assets/messages are used.

## Customization
- Edit `assets/assets.json` for default logo, crown, and loading text.
- Edit `waitingmsg.json` for the pool of random advice/messages.
- Edit `fallback.json` to change default prop values.
- Style via `UniversalLoadingScreen.css`.

## Example
```jsx
<UniversalLoadingScreen progress={progress} />
// Uses all defaults from fallback.json and assets/assets.json
```