# Universal Loading Screen

A fully modular, universal loading screen React component for any page or app. All assets, texts, and options are customizable via JSON files, with robust fallback support.

## Directory Structure
```
frontend/universalLoadingScreen/
  UniversalLoadingScreen.jsx
  UniversalLoadingScreen.css
  fallback.json
  waitingmsg.json
  assets/
    assets.json
```

## How to Use in Other Screens

1. **Import the component in your page:**
   ```jsx
   import UniversalLoadingScreen from './frontend/universalLoadingScreen/UniversalLoadingScreen';
   ```
2. **Control loading state and progress in your page:**
   ```jsx
   import React, { useState, useEffect } from 'react';
   import UniversalLoadingScreen from './frontend/universalLoadingScreen/UniversalLoadingScreen';

   function MyPage() {
     const [loading, setLoading] = useState(true);
     const [progress, setProgress] = useState(0);

     useEffect(() => {
       // Simulate loading steps
       const steps = [20, 40, 60, 80, 100];
       let i = 0;
       const interval = setInterval(() => {
         setProgress(steps[i]);
         i++;
         if (i === steps.length) {
           clearInterval(interval);
           setTimeout(() => setLoading(false), 500);
         }
       }, 500);
       return () => clearInterval(interval);
     }, []);

     return (
       <>
         {loading && (
           <UniversalLoadingScreen
             progress={progress}
             // Optionally override defaults:
             // assetsPath="./frontend/universalLoadingScreen/assets/assets.json"
           />
         )}
         {!loading && (
           <div>
             {/* Your actual page content here */}
           </div>
         )}
       </>
     );
   }
   ```
3. **Best Practices:**
   - Always provide the `progress` prop (0–100) to control the loading bar.
   - Use the loading screen as an overlay by conditionally rendering it while your page is loading.
   - You can override the `assetsPath` prop or rely on the default in `fallback.json`.
   - The loading screen will automatically read the waiting message path from the assets file and load messages from there.
   - Place your own assets/messages in the `assets/` folder or customize the JSON files as needed.

## Props
- `progress` (number, required): Loading progress (0–100).
- `assetsPath` (string, optional): Path to the JSON file for logo, crown, loading text, and waitingMsgPath.

## Fallback Behavior
If `assetsPath` is missing, the component loads `fallback.json` and uses its value for `assetsPath`. By default, the advice/message rectangle is shown and default assets/messages are used.

## Customization
- Edit `assets/assets.json` for default logo, crown, loading text, and `waitingMsgPath`.
- Edit the file referenced by `waitingMsgPath` for the pool of random advice/messages.
- Edit `fallback.json` to change default prop values.
- Style via `UniversalLoadingScreen.css`.

## Example
```jsx
<UniversalLoadingScreen progress={progress} />
// Uses all defaults from fallback.json and assets/assets.json
```