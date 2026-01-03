/**
 * Send OPTR T2V info to Derek
 */

import twilio from 'twilio';

const accountSid = 'ACb0a4821ebd89c68cdbee5b1f7dfb446a';
const authToken = '74435130590eec2f3f8cc6ac28758936';
const fromNumber = '+18555528521';
const toNumber = '+12152057238';

const message = `🚀 OPTR T2V (Text-to-Vector) Overview

What it does:
Transforms opportunity text into semantic vectors for intelligent matching and analysis.

How it works:
1. Ingests opportunity documents
2. Converts text to embeddings (vectors)
3. Stores in vector database
4. Matches against your capabilities
5. Calculates coverage & identifies blockers

Key Features:
✓ Semantic search (not just keywords)
✓ Cosine similarity scoring
✓ Real-time traceability
✓ Voice-controlled on mobile

Access it:
📱 https://hvpe-cloud-portal.vercel.app/optr

Voice commands:
• "Run analysis"
• "Check status"
• "Show blockers"

Patent-pending Reality Acceleration Formula included.

- Your OPTR System`;

async function sendOPTRInfo() {
  try {
    const client = twilio(accountSid, authToken);

    console.log('📱 Sending OPTR T2V info...');

    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: toNumber,
    });

    console.log('\n✅ SMS SENT!');
    console.log(`📨 Message SID: ${result.sid}`);
    console.log(`📱 To: ${result.to}`);
    console.log(`📊 Status: ${result.status}`);
  } catch (error: unknown) {
    console.error('\n❌ FAILED');
    console.error(`Error: ${error.message}`);
  }
}

sendOPTRInfo();
