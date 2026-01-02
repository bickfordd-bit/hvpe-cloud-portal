'use client';

import type { Chunk } from '@bickford/shared';

interface StreamAreaProps {
  chunks: Chunk[];
  filingChunkIds: Set<string>;
}

export default function StreamArea({ chunks, filingChunkIds }: StreamAreaProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-3">
        {chunks.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <p className="text-lg">No chunks streaming yet.</p>
            <p className="text-sm mt-2">Send a message to see it streamed and filed in real-time.</p>
          </div>
        )}
        {chunks.map((chunk) => (
          <div
            key={chunk.id}
            className={`border-2 border-black p-4 bg-white transition-all ${
              filingChunkIds.has(chunk.id) ? 'animate-drop' : ''
            }`}
          >
            <p className="text-sm text-gray-600 mb-1">Chunk ID: {chunk.id.substring(0, 8)}...</p>
            <p className="text-base">{chunk.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
