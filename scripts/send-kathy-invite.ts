/**
 * Copyright (c) 2025 HVPE Inc. All rights reserved.
 * Quick script to send Kathy the Bickford trial app link
 */

async function sendKathyInvite() {
  const phoneNumber = "+16107178182"; // Kathy's number
  
  // Update this URL when deployed
  const appUrl = "https://hvpe-cloud-portal.vercel.app/bickford";
  
  const message = `Hi Kathy! 🎉

Try Bickford - the app that turns your intentions into reality instantly (not just chat).

Your trial link: ${appUrl}

What makes Bickford different?
• Intent to reality in seconds
• Not just conversation - actual transformation
• Patent-pending Reality Acceleration Formula

Tap the link on your phone, then "Add to Home Screen" for the full app experience.

Any questions? Just text back!

- Derek & the Bickford team`;

  try {
    const response = await fetch("http://localhost:3000/api/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: phoneNumber,
        message: message
      })
    });

    const result = await response.json();
    
    if (result.success) {
      if (result.simulation) {
        console.log("✅ SMS SIMULATED (Twilio not configured)");
        console.log(`📱 To: ${phoneNumber}`);
        console.log(`📝 Message preview: ${result.messagePreview}...`);
        console.log("\n⚠️  To send real SMS, configure Twilio:");
        console.log("1. TWILIO_ACCOUNT_SID");
        console.log("2. TWILIO_AUTH_TOKEN");
        console.log("3. TWILIO_PHONE_NUMBER");
      } else {
        console.log("✅ SMS SENT SUCCESSFULLY!");
        console.log(`📱 To: ${result.to}`);
        console.log(`📨 Message SID: ${result.messageSid}`);
        console.log(`📊 Status: ${result.status}`);
      }
    } else {
      console.error("❌ Failed to send SMS:", result.error);
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

sendKathyInvite();
