import React, { useState, useEffect } from 'react';

const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest text-center py-2 z-50 animate-pulse">
      ⚠️ Connexion Perdue - Mode Hors Ligne
    </div>
  );
};

export default OfflineBanner;
