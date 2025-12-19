import express, { Request, Response } from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import redis from './redis';
import db from './db';
import type { RedisStreamEvent } from '@bickford/shared';

dotenv.config();

const app = express();
const API_PORT = parseInt(process.env.API_PORT || '3001', 10);
const WS_PORT = parseInt(process.env.WS_PORT || '3002', 10);

app.use(cors());
app.use(express.json());

// WebSocket server
const wss = new WebSocketServer({ port: WS_PORT });
const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('✅ WebSocket client connected. Total clients:', clients.size);

  ws.on('close', () => {
    clients.delete(ws);
    console.log('❌ WebSocket client disconnected. Total clients:', clients.size);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Broadcast to all connected WebSocket clients
export function broadcast(data: unknown): void {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Helper to generate UUID (using crypto randomUUID if available, else fallback)
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return uuidv4();
}

// Fake LLM streamer - splits message into chunks
async function* generateChunks(message: string): AsyncGenerator<string> {
  const words = message.split(' ');
  const numChunks = Math.min(Math.max(6, Math.floor(words.length / 3)), 10);
  const chunkSize = Math.ceil(words.length / numChunks);

  for (let i = 0; i < numChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, words.length);
    const chunk = words.slice(start, end).join(' ');
    
    // Random delay between 300-800ms
    const delay = Math.floor(Math.random() * 500) + 300;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    yield chunk;
  }
}

// POST /api/chat - Accept message and stream chunks
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const messageId = generateId();
    console.log(`📨 Processing message: ${messageId}`);

    // Publish message_received event to Redis
    const messageEvent: RedisStreamEvent = {
      type: 'message_received',
      messageId,
      content: message,
      timestamp: new Date().toISOString(),
    };
    
    await redis.xadd(
      'bickford:events',
      '*',
      'data',
      JSON.stringify(messageEvent)
    );

    // Start streaming chunks
    res.json({ messageId, status: 'streaming' });

    // Generate and publish chunks asynchronously
    (async () => {
      for await (const chunk of generateChunks(message)) {
        const chunkId = generateId();
        
        // Publish chunk_generated event to Redis
        const chunkEvent: RedisStreamEvent = {
          type: 'chunk_generated',
          messageId,
          chunkId,
          content: chunk,
          timestamp: new Date().toISOString(),
        };

        await redis.xadd(
          'bickford:events',
          '*',
          'data',
          JSON.stringify(chunkEvent)
        );

        // Broadcast chunk_created to WebSocket clients
        broadcast({
          type: 'chunk_created',
          data: {
            id: chunkId,
            content: chunk,
            messageId,
          },
        });

        console.log(`📦 Chunk created: ${chunkId.substring(0, 8)}... - "${chunk.substring(0, 50)}..."`);
      }

      // Broadcast message_complete
      broadcast({
        type: 'message_complete',
        data: { messageId },
      });

      console.log(`✅ Message complete: ${messageId}`);
    })();

  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/buckets/:bucketId/chunks - Get chunks for a bucket
app.get('/api/buckets/:bucketId/chunks', async (req: Request, res: Response) => {
  try {
    const bucketId = parseInt(req.params.bucketId, 10);
    
    if (isNaN(bucketId)) {
      return res.status(400).json({ error: 'Invalid bucket ID' });
    }

    const result = await db.query(
      `SELECT c.id, c.content, c.message_id as "messageId", c.bucket_id as "bucketId", 
              b.name as "bucketName", c.created_at as "createdAt"
       FROM chunks c
       JOIN buckets b ON c.bucket_id = b.id
       WHERE c.bucket_id = $1
       ORDER BY c.created_at DESC
       LIMIT 100`,
      [bucketId]
    );

    res.json({ chunks: result.rows });
  } catch (error) {
    console.error('Error fetching chunks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/buckets - Get all buckets with counts
app.get('/api/buckets', async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT b.id, b.name, COUNT(c.id)::integer as count
       FROM buckets b
       LEFT JOIN chunks c ON b.id = c.bucket_id
       GROUP BY b.id, b.name
       ORDER BY b.id`
    );

    res.json({ buckets: result.rows });
  } catch (error) {
    console.error('Error fetching buckets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start API server
const server = http.createServer(app);
server.listen(API_PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${API_PORT}`);
  console.log(`🔌 WebSocket Server running on ws://localhost:${WS_PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
  await db.end();
  redis.disconnect();
});
