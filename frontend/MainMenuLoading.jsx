import React, { useEffect, useState } from 'react';
import './MainMenuLoading.css';

const getRandomInt = (max) => Math.floor(Math.random() * max);

const MainMenuLoading = ({ assetsPath, progress = 0, showAdvice = false, waitingMsgPath = '/frontend/waitingmsg.json' }) => {
  const [assets, setAssets] = useState(null);
  const [waitingMsgs, setWaitingMsgs] = useState([]);
  const [advice, setAdvice] = useState('');
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
      .catch(() => setError('Error loading assets.'));
  }, [assetsPath]);

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

  if (error) return <div className="mainmenu-loading-root">{error}</div>;
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