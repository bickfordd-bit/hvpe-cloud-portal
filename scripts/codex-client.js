#!/usr/bin/env node
/**
 * Codex Sync Client
 * Helper for sending tasks to Codex sync endpoint from Node.js
 */

const https = require('https');
const http = require('http');
const { readFileSync } = require('fs');
const { join } = require('path');

const CODEX_SECRET = process.env.CODEX_WEBHOOK_SECRET;
const API_URL = process.env.API_URL || 'http://localhost:3000';

if (!CODEX_SECRET) {
  console.error('Error: CODEX_WEBHOOK_SECRET not set');
  process.exit(1);
}

/**
 * Send task to Codex sync endpoint
 */
async function sendTask(task, preview = false) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_URL}/api/codex/sync${preview ? '?preview=true' : ''}`);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;

    const data = JSON.stringify(task);

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'x-codex-secret': CODEX_SECRET,
      },
    };

    const req = lib.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(result);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${result.error || body}`));
          }
        } catch (e) {
          reject(new Error(`Invalid JSON response: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * Create a task from file changes
 */
function createTask(description, changes, metadata = {}) {
  return {
    taskId: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    description,
    timestamp: new Date().toISOString(),
    changes,
    metadata,
  };
}

/**
 * CLI usage
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'send') {
    // Usage: node codex-client.js send task.json [--preview]
    const taskFile = args[1];
    const preview = args.includes('--preview');

    if (!taskFile) {
      console.error('Usage: node codex-client.js send <task.json> [--preview]');
      process.exit(1);
    }

    const task = JSON.parse(readFileSync(taskFile, 'utf-8'));

    console.log(`Sending task: ${task.description}`);
    console.log(`Mode: ${preview ? 'PREVIEW' : 'SYNC'}`);

    sendTask(task, preview)
      .then((result) => {
        console.log('Success:', JSON.stringify(result, null, 2));
      })
      .catch((error) => {
        console.error('Error:', error.message);
        process.exit(1);
      });
  } else if (command === 'create') {
    // Usage: node codex-client.js create "description" file1.ts file2.ts
    const description = args[1];
    const files = args.slice(2);

    if (!description || files.length === 0) {
      console.error('Usage: node codex-client.js create "description" <file1> <file2> ...');
      process.exit(1);
    }

    const changes = files.map((filePath) => ({
      type: 'modify',
      path: filePath,
      content: readFileSync(filePath, 'utf-8'),
    }));

    const task = createTask(description, changes, {
      client: 'codex-client-cli',
    });

    console.log(JSON.stringify(task, null, 2));
  } else {
    console.log('Codex Sync Client');
    console.log('');
    console.log('Usage:');
    console.log('  node codex-client.js send <task.json> [--preview]');
    console.log('  node codex-client.js create "description" <file1> <file2> ...');
    console.log('');
    console.log('Environment:');
    console.log('  CODEX_WEBHOOK_SECRET - Required webhook secret');
    console.log('  API_URL - API endpoint (default: http://localhost:3000)');
  }
}

module.exports = { sendTask, createTask };
