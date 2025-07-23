import React, { useState, useEffect } from 'react';
import UniversalLoadingScreen from './universalLoadingScreen/UniversalLoadingScreen';

const TestUniversalLoadingScreen = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!loading) return;
    let start = Date.now();
    const duration = 30000; // 30 seconds
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const percent = Math.min(100, (elapsed / duration) * 100);
      setProgress(percent);
      if (percent >= 100) {
        clearInterval(interval);
        setTimeout(() => setLoading(false), 500);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [loading]);

  return (
    <div style={{ minHeight: '100vh', background: '#222' }}>
      {loading && (
        <UniversalLoadingScreen progress={progress} />
      )}
      {!loading && (
        <div style={{ color: '#fff', textAlign: 'center', paddingTop: '40vh', fontSize: '2rem' }}>
          Page Loaded!
        </div>
      )}
    </div>
  );
};

export default TestUniversalLoadingScreen;