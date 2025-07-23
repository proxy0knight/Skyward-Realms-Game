import React, { useEffect, useState } from 'react';
import './MainMenuLoading.css';

const MainMenuLoading = ({ assetsPath, durationMs = 2000, onLoaded }) => {
  const [progress, setProgress] = useState(0);
  const [assets, setAssets] = useState(null);
  const [error, setError] = useState(null);

  // Dynamically load assets JSON
  useEffect(() => {
    setAssets(null);
    setError(null);
    fetch(assetsPath)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load assets');
        return res.json();
      })
      .then(setAssets)
      .catch(setError);
  }, [assetsPath]);

  // Animate loading bar
  useEffect(() => {
    if (!assets) return;
    if (progress < 100) {
      const step = 100 / (durationMs / 20);
      const timer = setTimeout(() => setProgress(Math.min(progress + step, 100)), 20);
      return () => clearTimeout(timer);
    } else if (onLoaded) {
      setTimeout(onLoaded, 500);
    }
  }, [progress, assets, durationMs, onLoaded]);

  if (error) return <div className="mainmenu-loading-root">Error loading assets.</div>;
  if (!assets) return <div className="mainmenu-loading-root">Loading assets...</div>;

  return (
    <div className="mainmenu-loading-root">
      <img
        src={assets.logo}
        alt="Game Logo"
        className="mainmenu-logo"
        draggable={false}
      />
      <div className="mainmenu-loading-content">
        <div className="mainmenu-loading-title">
          <span className="mainmenu-loading-anim-circle" />
          <span>{assets.loadingText}</span>
        </div>
        <div className="mainmenu-loading-bar-container">
          <div
            className="mainmenu-loading-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="mainmenu-crown-container">
        <img
          src={assets.crown}
          alt="Crown"
          className="mainmenu-crown"
          draggable={false}
        />
      </div>
    </div>
  );
};

export default MainMenuLoading;