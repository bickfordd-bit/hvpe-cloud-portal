'use client';

import type { Bucket } from '@bickford/shared';

interface BucketTilesProps {
  buckets: Bucket[];
  onBucketClick: (bucketId: number) => void;
}

export default function BucketTiles({ buckets, onBucketClick }: BucketTilesProps) {
  return (
    <div className="border-t-2 border-black bg-white">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-6 gap-4">
          {buckets.map((bucket) => (
            <button
              key={bucket.id}
              onClick={() => onBucketClick(bucket.id)}
              className="border-2 border-black p-4 hover:bg-gray-100 transition-colors text-center"
            >
              <div className="text-2xl font-bold mb-1">{bucket.count || 0}</div>
              <div className="text-sm font-semibold">{bucket.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
