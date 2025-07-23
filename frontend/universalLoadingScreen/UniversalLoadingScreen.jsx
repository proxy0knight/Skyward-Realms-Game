import React, { useEffect, useState } from 'react';
import './UniversalLoadingScreen.css';

const getRandomInt = (max) => Math.floor(Math.random() * max);

const UniversalLoadingScreen = (props) => {
  const [assets, setAssets] = useState(null);
  const [waitingMsgs, setWaitingMsgs] = useState([]);
  const [advice, setAdvice] = useState('');
  const [error, setError] = useState(null);
  const [fallback, setFallback] = useState(null);

  // Load fallback.json if assetsPath is missing
  useEffect(() => {
    if (!props.assetsPath) {
      fetch('./fallback.json')
        .then((res) => res.json())
        .then(setFallback)
        .catch(() => setFallback(null));
    }
  }, [props.assetsPath]);

  // Dynamically load assets JSON
  useEffect(() => {
    const path = props.assetsPath || (fallback && fallback.assetsPath);
    if (!path) return;
    setAssets(null);
    setError(null);
    fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load assets');
        return res.json();
      })
      .then(setAssets)
      .catch(() => setError('Error loading assets.'));
  }, [props.assetsPath, fallback]);

  // Load waiting messages from path in assets
  useEffect(() => {
    if (!assets || !assets.waitingMsgPath) return;
    setWaitingMsgs([]);
    setAdvice('');
    fetch(assets.waitingMsgPath)
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
  }, [assets]);

  // progress is mandatory
  if (props.progress === undefined) {
    return <div className="mainmenu-loading-root">Error: progress prop is required.</div>;
  }

  if (error) return <div className="mainmenu-loading-root">{error}</div>;
  if (!assets) return <div className="mainmenu-loading-root">Loading assets...</div>;

  // Show advice rectangle only if showAdvice is true (default true)
  const showAdvice = assets.showAdvice !== undefined ? assets.showAdvice : true;

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
            style={{ width: `${props.progress}%` }}
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

export default UniversalLoadingScreen;