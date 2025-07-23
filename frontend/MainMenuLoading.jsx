import React, { useEffect, useState } from 'react';
import assets from './assets.json';
import './MainMenuLoading.css';

const MainMenuLoading = ({ onLoaded }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (progress < 100) {
      const timer = setTimeout(() => setProgress(progress + 1), 20);
      return () => clearTimeout(timer);
    } else if (onLoaded) {
      setTimeout(onLoaded, 500);
    }
  }, [progress, onLoaded]);

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