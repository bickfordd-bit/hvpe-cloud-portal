/**
 * Send Derek the Bickford app download link
 */

import twilio from "twilio";

const accountSid = "ACb0a4821ebd89c68cdbee5b1f7dfb446a";
const authToken = "74435130590eec2f3f8cc6ac28758936";
const fromNumber = "+18555528521";
const toNumber = "+12152057238"; // Derek's number

const message = `🚀 Your Bickford Instance is Ready!

App URL: https://hvpe-cloud-portal.vercel.app/bickford

Quick setup:
1. Tap the link on your phone
2. Tap Share → "Add to Home Screen"
3. Name it "Bickford" and tap Add

🎯 What makes it different:
• Intent to Reality - not just chat
• Patent-pending Reality Acceleration
• Instant manifestation engine

Your features:
✨ Bickford Chat
🎬 Penelope (Cinema Content)
💰 Our Life (Financial Tracker)
📊 OPTR (Voice-enabled)
🔑 API Keys

Need help? Text back anytime.

- Derek`;

async function sendToDerek() {
  try {
    const client = twilio(accountSid, authToken);
    
    console.log("📱 Sending your Bickford instance...");
    
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: toNumber
    });

    console.log("\n✅ SMS SENT!");
    console.log(`📨 Message SID: ${result.sid}`);
    console.log(`📱 To: ${result.to}`);
    console.log(`📊 Status: ${result.status}`);
    
  } catch (error: any) {
    console.error("\n❌ FAILED");
    console.error(`Error: ${error.message}`);
  }
}

sendToDerek();
