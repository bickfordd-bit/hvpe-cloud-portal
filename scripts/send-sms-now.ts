/**
 * Send SMS to Kathy directly using Twilio
 */

import twilio from "twilio";

const accountSid = "ACb0a4821ebd89c68cdbee5b1f7dfb446a";
const authToken = "74435130590eec2f3f8cc6ac28758936";
const fromNumber = "+18555528521"; // Your Twilio number
const toNumber = "+16107178182"; // Kathy's number

const message = `Hi Kathy! 🎉

Try Bickford - the app that turns your intentions into reality instantly (not just chat).

Your trial link: https://hvpe-cloud-portal.vercel.app/bickford

What makes Bickford different?
• Intent to reality in seconds
• Not just conversation - actual transformation
• Patent-pending Reality Acceleration Formula

Tap the link on your phone, then "Add to Home Screen" for the full app experience.

Any questions? Just text back!

- Derek & the Bickford team`;

async function sendSMS() {
  try {
    const client = twilio(accountSid, authToken);
    
    console.log("📱 Sending SMS to Kathy...");
    
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: toNumber
    });

    console.log("\n✅ SMS SENT SUCCESSFULLY!");
    console.log(`📨 Message SID: ${result.sid}`);
    console.log(`📱 To: ${result.to}`);
    console.log(`📊 Status: ${result.status}`);
    console.log(`💰 Price: ${result.price || 'calculating...'}`);
    
  } catch (error: any) {
    console.error("\n❌ FAILED TO SEND SMS");
    console.error(`Error: ${error.message}`);
    if (error.code) {
      console.error(`Twilio Error Code: ${error.code}`);
    }
    if (error.moreInfo) {
      console.error(`More info: ${error.moreInfo}`);
    }
  }
}

sendSMS();
