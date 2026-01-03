'use client';

import { useState, useEffect } from 'react';

export default function LinkedInConnectButton() {
  // Check if already connected during initialization
  const isConnectedFromCallback =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('linkedin_connected') === 'true'
      : false;

  const [connected, setConnected] = useState(isConnectedFromCallback);

  useEffect(() => {
    // Clean up URL if connected from callback
    if (isConnectedFromCallback && typeof window !== 'undefined') {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [isConnectedFromCallback]);

  const handleConnect = () => {
    window.location.href = '/api/linkedin/auth';
  };

  return (
    <div>
      {connected ? (
        <div className="flex items-center gap-2 text-green-400">
          <span>✓</span>
          <span>Connected to LinkedIn</span>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className="bg-[#0077B5] hover:bg-[#006399] text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <span>🔗</span>
          Connect LinkedIn
        </button>
      )}
    </div>
  );
}
