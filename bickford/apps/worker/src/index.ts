import dotenv from 'dotenv';
import WebSocket from 'ws';
import redis from './redis';
import db from './db';
import { classifyChunk } from './classifier';
import type { RedisStreamEvent } from '@bickford/shared';

dotenv.config();

const WS_URL = process.env.WS_URL || 'ws://localhost:3002';
const CONSUMER_GROUP = 'bickford-workers';
const CONSUMER_NAME = `worker-${process.pid}`;

let ws: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;

// Connect to WebSocket server
function connectWebSocket(): void {
  ws = new WebSocket(WS_URL);

  ws.on('open', () => {
    console.log('✅ Worker connected to WebSocket server');
  });

  ws.on('close', () => {
    console.log('❌ Worker disconnected from WebSocket server');
    // Reconnect after 5 seconds
    reconnectTimeout = setTimeout(connectWebSocket, 5000);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
}

// Broadcast event via WebSocket
function broadcast(data: unknown): void {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

// Initialize consumer group
async function initConsumerGroup(): Promise<void> {
  try {
    await redis.xgroup('CREATE', 'bickford:events', CONSUMER_GROUP, '0', 'MKSTREAM');
    console.log(`✅ Consumer group "${CONSUMER_GROUP}" created`);
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message && err.message.includes('BUSYGROUP')) {
      console.log(`✅ Consumer group "${CONSUMER_GROUP}" already exists`);
    } else {
      console.error('Error creating consumer group:', err);
      throw err;
    }
  }
}

// Process chunk event
async function processChunk(event: RedisStreamEvent): Promise<void> {
  if (event.type !== 'chunk_generated' || !event.chunkId || !event.content) {
    return;
  }

  const { chunkId, content, messageId } = event;

  try {
    // Classify the chunk
    const bucketName = classifyChunk(content);
    
    console.log(`📋 Classifying chunk ${chunkId.substring(0, 8)}... as "${bucketName}"`);

    // Get bucket ID
    const bucketResult = await db.query(
      'SELECT id FROM buckets WHERE name = $1',
      [bucketName]
    );

    if (bucketResult.rows.length === 0) {
      console.error(`Bucket "${bucketName}" not found`);
      return;
    }

    const bucketId = bucketResult.rows[0].id;

    // Save chunk to database
    await db.query(
      'INSERT INTO chunks (id, content, bucket_id, message_id) VALUES ($1, $2, $3, $4)',
      [chunkId, content, bucketId, messageId]
    );

    console.log(`💾 Chunk saved to database: ${chunkId.substring(0, 8)}... -> ${bucketName}`);

    // Broadcast chunk_filed event
    broadcast({
      type: 'chunk_filed',
      data: {
        id: chunkId,
        bucketId,
        bucketName,
        messageId,
      },
    });

    console.log(`📤 Broadcast chunk_filed event for ${chunkId.substring(0, 8)}...`);
  } catch (error) {
    console.error('Error processing chunk:', error);
  }
}

// Main consumer loop with circuit breaker
async function consumeEvents(): Promise<void> {
  console.log(`🔄 Starting consumer "${CONSUMER_NAME}" in group "${CONSUMER_GROUP}"`);

  let consecutiveErrors = 0;
  const MAX_CONSECUTIVE_ERRORS = 10;
  const BACKOFF_BASE = 1000;

  while (true) {
    try {
      // Read from consumer group
      const results = await redis.xreadgroup(
        'GROUP',
        CONSUMER_GROUP,
        CONSUMER_NAME,
        'BLOCK',
        '5000', // Block for 5 seconds
        'COUNT',
        '10',
        'STREAMS',
        'bickford:events',
        '>'
      );

      if (!results || results.length === 0) {
        consecutiveErrors = 0; // Reset on successful read
        continue;
      }

      // Process each message
      for (const [, messages] of results) {
        for (const [id, fields] of messages) {
          try {
            // Parse event data
            const dataIndex = fields.indexOf('data');
            if (dataIndex === -1) continue;

            const eventData = JSON.parse(fields[dataIndex + 1]) as RedisStreamEvent;
            
            // Process the event
            await processChunk(eventData);

            // Acknowledge the message
            await redis.xack('bickford:events', CONSUMER_GROUP, id);
            
            consecutiveErrors = 0; // Reset on successful processing
          } catch (error) {
            console.error(`Error processing message ${id}:`, error);
          }
        }
      }
    } catch (error) {
      consecutiveErrors++;
      console.error(`Error in consumer loop (attempt ${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS}):`, error);
      
      // Circuit breaker: exit if too many consecutive errors
      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        console.error('❌ Circuit breaker triggered: too many consecutive errors. Exiting...');
        process.exit(1);
      }
      
      // Exponential backoff
      const delay = Math.min(BACKOFF_BASE * Math.pow(2, consecutiveErrors - 1), 30000);
      console.log(`⏳ Backing off for ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Start worker
async function start(): Promise<void> {
  console.log('🚀 Starting Bickford Worker...');
  
  try {
    // Connect to WebSocket
    connectWebSocket();

    // Initialize consumer group
    await initConsumerGroup();

    // Start consuming events
    await consumeEvents();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: shutting down worker');
  
  if (ws) {
    ws.close();
  }
  
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
  
  await db.end();
  redis.disconnect();
  process.exit(0);
});

// Start the worker
start();
