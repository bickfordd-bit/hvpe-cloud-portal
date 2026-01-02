export interface Chunk {
  id: string;
  content: string;
  messageId: string;
  bucketId?: number;
  bucketName?: string;
  createdAt?: string;
}

export interface Bucket {
  id: number;
  name: string;
  count?: number;
}

export interface WSEvent {
  type: 'chunk_created' | 'chunk_filed' | 'message_complete';
  data: Record<string, unknown>;
}

export interface RedisStreamEvent {
  type: 'message_received' | 'chunk_generated';
  messageId: string;
  chunkId?: string;
  content?: string;
  timestamp: string;
}
