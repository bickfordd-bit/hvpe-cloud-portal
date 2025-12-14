/**
 * Test SMS with proper formatting and compliance
 */

import twilio from "twilio";

const accountSid = "ACb0a4821ebd89c68cdbee5b1f7dfb446a";
const authToken = "74435130590eec2f3f8cc6ac28758936";
const fromNumber = "+12765985129"; // Bickford SMS Number (verified local)
const toNumber = "+12152057238"; // Target number

// Shorter, simpler message to test basic delivery
const message = `Hi! This is Derek from Bickford.

Try our new app: https://hvpe-cloud-portal.vercel.app/bickford

Reply STOP to unsubscribe.`;

async function sendSMS() {
  try {
    const client = twilio(accountSid, authToken);
    
    console.log("📱 Sending test SMS...");
    console.log(`From: ${fromNumber}`);
    console.log(`To: ${toNumber}\n`);
    
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: toNumber
    });

    console.log("\n✅ SMS SENT!");
    console.log(`📨 Message SID: ${result.sid}`);
    console.log(`📱 To: ${result.to}`);
    console.log(`📊 Status: ${result.status}`);
    
    // Wait a moment and check status
    console.log("\n⏳ Waiting 5 seconds to check delivery status...");
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const status = await client.messages(result.sid).fetch();
    console.log(`\n📊 Updated Status: ${status.status}`);
    if (status.errorCode) {
      console.log(`❌ Error Code: ${status.errorCode}`);
      console.log(`❌ Error: ${status.errorMessage}`);
    }
    
  } catch (error: any) {
    console.error("\n❌ FAILED TO SEND SMS");
    console.error(`Error: ${error.message}`);
    if (error.code) {
      console.error(`Code: ${error.code}`);
    }
  }
}

sendSMS();
