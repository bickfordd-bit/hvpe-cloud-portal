'use client';

import { useState, useEffect } from 'react';

export default function LinkedInConnectButton() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Check if already connected (query param from callback)
    const params = new URLSearchParams(window.location.search);
    if (params.get('linkedin_connected') === 'true') {
      setConnected(true);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

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
