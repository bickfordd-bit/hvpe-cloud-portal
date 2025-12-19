'use client';

import { useEffect, useState } from 'react';
import type { Chunk } from '@bickford/shared';

interface BucketDrawerProps {
  bucketId: number | null;
  bucketName: string;
  onClose: () => void;
}

export default function BucketDrawer({ bucketId, bucketName, onClose }: BucketDrawerProps) {
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (bucketId === null) {
      setChunks([]);
      return;
    }

    const fetchChunks = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/buckets/${bucketId}/chunks`);
        const data = await response.json();
        setChunks(data.chunks || []);
      } catch (error) {
        console.error('Error fetching chunks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChunks();
  }, [bucketId]);

  if (bucketId === null) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-96 bg-white border-r-2 border-black overflow-y-auto">
        <div className="sticky top-0 bg-white border-b-2 border-black p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{bucketName}</h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold hover:bg-gray-100 w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-3">
          {loading && (
            <div className="text-center text-gray-400 py-8">Loading...</div>
          )}
          
          {!loading && chunks.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              No chunks filed yet.
            </div>
          )}

          {!loading && chunks.map((chunk) => (
            <div key={chunk.id} className="border-2 border-black p-3">
              <p className="text-xs text-gray-500 mb-2">
                {new Date(chunk.createdAt || '').toLocaleString()}
              </p>
              <p className="text-sm">{chunk.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
