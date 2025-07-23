import React, { useEffect, useState } from 'react';
import './MainMenuLoading.css';

const getRandomInt = (max) => Math.floor(Math.random() * max);

const MainMenuLoading = ({ assets, durationMs = 2000, onLoaded, showAdvice = false, waitingMsgPath = '/frontend/waitingmsg.json' }) => {
  const [progress, setProgress] = useState(0);
  const [waitingMsgs, setWaitingMsgs] = useState([]);
  const [advice, setAdvice] = useState('');
  const [error, setError] = useState(null);

  // Load waiting messages if advice is enabled
  useEffect(() => {
    if (!showAdvice) return;
    setWaitingMsgs([]);
    setAdvice('');
    fetch(waitingMsgPath)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load waiting messages');
        return res.json();
      })
      .then((msgs) => {
        setWaitingMsgs(msgs);
        if (Array.isArray(msgs) && msgs.length > 0) {
          setAdvice(msgs[getRandomInt(msgs.length)]);
        }
      })
      .catch(() => setError('Error loading waiting messages.'));
  }, [showAdvice, waitingMsgPath]);

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
        {showAdvice && (
          <div className="mainmenu-advice-rect">
            {error ? error : advice}
          </div>
        )}
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