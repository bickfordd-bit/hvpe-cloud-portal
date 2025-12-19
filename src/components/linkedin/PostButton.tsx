'use client';

import { useState } from 'react';

interface PostButtonProps {
  text: string;
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
  visibility?: 'PUBLIC' | 'CONNECTIONS';
  className?: string;
}

export default function LinkedInPostButton({
  text,
  linkUrl,
  linkTitle,
  linkDescription,
  visibility = 'PUBLIC',
  className = '',
}: PostButtonProps) {
  const [posting, setPosting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handlePost = async () => {
    setPosting(true);
    setResult(null);

    try {
      const response = await fetch('/api/linkedin/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          linkUrl,
          linkTitle,
          linkDescription,
          visibility,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post');
      }

      setResult({
        success: true,
        message: `Posted! View at: ${data.data.shareUrl}`,
      });
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Failed to post to LinkedIn',
      });
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className={className}>
      <button
        onClick={handlePost}
        disabled={posting}
        className="bg-[#0077B5] hover:bg-[#006399] disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
      >
        {posting ? (
          <>
            <span className="animate-spin">⏳</span>
            Posting...
          </>
        ) : (
          <>
            <span>🔗</span>
            Post to LinkedIn
          </>
        )}
      </button>

      {result && (
        <div
          className={`mt-2 p-3 rounded-lg text-sm ${
            result.success
              ? 'bg-green-900/30 text-green-300 border border-green-700'
              : 'bg-red-900/30 text-red-300 border border-red-700'
          }`}
        >
          {result.message}
        </div>
      )}
    </div>
  );
}
