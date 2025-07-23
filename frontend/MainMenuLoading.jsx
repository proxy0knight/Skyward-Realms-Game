import React, { useEffect, useState } from 'react';
import './MainMenuLoading.css';

const getRandomInt = (max) => Math.floor(Math.random() * max);

const MainMenuLoading = (props) => {
  const [assets, setAssets] = useState(null);
  const [waitingMsgs, setWaitingMsgs] = useState([]);
  const [advice, setAdvice] = useState('');
  const [error, setError] = useState(null);
  const [fallback, setFallback] = useState(null);

  // Load fallback.json if any prop except progress is missing
  useEffect(() => {
    let needsFallback = false;
    if (!props.assetsPath || props.showAdvice === undefined || !props.waitingMsgPath) {
      needsFallback = true;
    }
    if (needsFallback) {
      fetch('./fallback.json')
        .then((res) => res.json())
        .then(setFallback)
        .catch(() => setFallback(null));
    }
  }, [props.assetsPath, props.showAdvice, props.waitingMsgPath]);

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

  // Load waiting messages if advice is enabled
  useEffect(() => {
    const showAdvice = props.showAdvice !== undefined ? props.showAdvice : (fallback && fallback.showAdvice);
    const msgPath = props.waitingMsgPath || (fallback && fallback.waitingMsgPath);
    if (!showAdvice) return;
    setWaitingMsgs([]);
    setAdvice('');
    fetch(msgPath)
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
  }, [props.showAdvice, props.waitingMsgPath, fallback]);

  // progress is mandatory
  if (props.progress === undefined) {
    return <div className="mainmenu-loading-root">Error: progress prop is required.</div>;
  }
  const progress = props.progress;
  const showAdvice = props.showAdvice !== undefined ? props.showAdvice : (fallback && fallback.showAdvice);

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