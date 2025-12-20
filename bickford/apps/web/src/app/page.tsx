'use client';

import { useEffect, useState, useCallback } from 'react';
import ChatInput from '@/components/ChatInput';
import StreamArea from '@/components/StreamArea';
import BucketTiles from '@/components/BucketTiles';
import BucketDrawer from '@/components/BucketDrawer';
import type { Chunk, Bucket, WSEvent } from '@bickford/shared';

export default function Home() {
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [filingChunkIds, setFilingChunkIds] = useState<Set<string>>(new Set());
  const [selectedBucket, setSelectedBucket] = useState<{ id: number; name: string } | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Fetch buckets on mount
  useEffect(() => {
    fetchBuckets();
  }, []);

  const fetchBuckets = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/buckets`);
      const data = await response.json();
      setBuckets(data.buckets || []);
    } catch (error) {
      console.error('Error fetching buckets:', error);
    }
  };

  // WebSocket connection with graceful reconnection
  useEffect(() => {
    let websocket: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connect = () => {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3002';
      websocket = new WebSocket(wsUrl);

      websocket.onopen = () => {
        console.log('✅ Connected to WebSocket server');
        setIsConnected(true);
        setReconnectAttempts(0);
      };

      websocket.onmessage = (event) => {
        try {
          const wsEvent: WSEvent = JSON.parse(event.data);
          handleWSEvent(wsEvent);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      websocket.onclose = () => {
        console.log('❌ Disconnected from WebSocket server');
        setIsConnected(false);
        
        // Graceful reconnection with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        setReconnectAttempts((prev) => prev + 1);
        
        console.log(`🔄 Reconnecting in ${delay / 1000}s...`);
        reconnectTimeout = setTimeout(() => {
          connect();
        }, delay);
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };

    connect();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (websocket) {
        websocket.close();
      }
    };
  }, [reconnectAttempts]);

  const handleWSEvent = useCallback((event: WSEvent) => {
    switch (event.type) {
      case 'chunk_created':
        setChunks((prev) => [...prev, event.data as Chunk]);
        break;

      case 'chunk_filed':
        const { id, bucketId } = event.data as { id: string; bucketId: number; bucketName: string };
        
        // Trigger filing animation
        setFilingChunkIds((prev) => new Set(prev).add(id));
        
        // After animation completes (600ms), remove chunk and update bucket count
        setTimeout(() => {
          setChunks((prev) => prev.filter((chunk) => chunk.id !== id));
          setFilingChunkIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          
          // Update bucket count
          setBuckets((prev) =>
            prev.map((bucket) =>
              bucket.id === bucketId
                ? { ...bucket, count: (bucket.count || 0) + 1 }
                : bucket
            )
          );
        }, 600);
        break;

      case 'message_complete':
        console.log('Message complete:', event.data);
        break;

      default:
        console.log('Unknown event type:', event.type);
    }
  }, []);

  const handleSendMessage = async (message: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      console.log('Message sent:', data);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleBucketClick = (bucketId: number) => {
    const bucket = buckets.find((b) => b.id === bucketId);
    if (bucket) {
      setSelectedBucket({ id: bucket.id, name: bucket.name });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="border-b-2 border-black bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Bickford</h1>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
              title={isConnected ? 'Connected' : 'Disconnected'}
            />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </header>

      {/* Stream Area */}
      <StreamArea chunks={chunks} filingChunkIds={filingChunkIds} />

      {/* Chat Input */}
      <div className="border-t-2 border-black bg-white px-4 py-4">
        <ChatInput onSendMessage={handleSendMessage} disabled={!isConnected} />
      </div>

      {/* Bucket Tiles */}
      <BucketTiles buckets={buckets} onBucketClick={handleBucketClick} />

      {/* Bucket Drawer */}
      {selectedBucket && (
        <BucketDrawer
          bucketId={selectedBucket.id}
          bucketName={selectedBucket.name}
          onClose={() => setSelectedBucket(null)}
        />
      )}
    </div>
  );
}
