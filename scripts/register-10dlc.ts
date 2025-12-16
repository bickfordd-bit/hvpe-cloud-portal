/**
 * Register for 10DLC to unblock SMS
 */

import twilio from "twilio";

const accountSid = "ACb0a4821ebd89c68cdbee5b1f7dfb446a";
const authToken = "74435130590eec2f3f8cc6ac28758936";

async function register10DLC() {
  try {
    const client = twilio(accountSid, authToken);
    
    console.log("🚀 Starting 10DLC Registration...\n");
    
    // Step 1: Create a Brand
    console.log("📝 Step 1: Registering Brand...");
    
    const brand = await client.messaging.v1.brandRegistrations.create({
      customerProfileBundleSid: 'BUxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // You'll need to create this first
      a2pProfileBundleSid: 'BNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Optional
      brandType: 'STARTER', // or 'STANDARD'
      // For STARTER (low volume, quick approval):
      email: 'derek@bickford.com',
      companyName: 'Bickford',
      website: 'https://hvpe-cloud-portal.vercel.app',
      // For STANDARD (requires more info):
      // ein: 'XX-XXXXXXX',
      // vertical: 'PROFESSIONAL',
      // street: '123 Main St',
      // city: 'Philadelphia',
      // state: 'PA',
      // postalCode: '19019',
      // country: 'US'
    });
    
    console.log(`✅ Brand registered: ${brand.sid}\n`);
    
    // Step 2: Create Campaign
    console.log("📝 Step 2: Creating SMS Campaign...");
    
    const campaign = await client.messaging.v1.services.create({
      friendlyName: 'Bickford SMS Campaign',
      usecaseType: 'MARKETING', // or 'MIXED', '2FA', etc.
      brandRegistrationSid: brand.sid,
      description: 'Promotional messages for Bickford app - Intent to Reality platform',
      messageFlow: 'Users receive invitation to try Bickford app with trial link',
      optInMessage: 'Reply YES to receive Bickford updates. Reply STOP to opt out.',
      optOutMessage: 'You have been unsubscribed from Bickford messages.',
      helpMessage: 'Bickford - Intent to Reality. Reply STOP to unsubscribe.',
      optInKeywords: ['START', 'YES', 'UNSTOP'],
      optOutKeywords: ['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'],
      helpKeywords: ['HELP', 'INFO']
    });
    
    console.log(`✅ Campaign created: ${campaign.sid}\n`);
    
    // Step 3: Link phone number to campaign
    console.log("📝 Step 3: Linking phone number...");
    
    const phoneNumber = '+12765985129';
    const phoneNumberUpdate = await client.incomingPhoneNumbers
      .list({ phoneNumber: phoneNumber })
      .then(numbers => {
        if (numbers.length > 0) {
          return client.incomingPhoneNumbers(numbers[0].sid)
            .update({ messagingServiceSid: campaign.sid });
        }
      });
    
    console.log(`✅ Phone number linked!\n`);
    
    console.log("🎉 10DLC REGISTRATION COMPLETE!");
    console.log("\n⏳ Campaign Review:");
    console.log("- STARTER brands: Usually approved within minutes to 1 day");
    console.log("- STANDARD brands: 1-2 weeks for full verification");
    console.log("\n📊 Check status in Twilio Console:");
    console.log("   Messaging → Regulatory Compliance → US A2P 10DLC\n");
    
  } catch (error: any) {
    console.error("\n❌ REGISTRATION FAILED");
    console.error(`Error: ${error.message}`);
    console.error(`Code: ${error.code || 'N/A'}`);
    
    if (error.code === 21610) {
      console.log("\n💡 Quick Fix: Use Twilio Console UI");
      console.log("1. Go to: https://console.twilio.com/us1/develop/sms/regulatory-compliance/brands");
      console.log("2. Click 'Register a Brand'");
      console.log("3. Choose 'Starter' (free, quick approval)");
      console.log("4. Fill in: Company Name, Email, Website");
      console.log("5. Create Campaign with 'Marketing' use case");
      console.log("6. Add phone number: +12765985129");
    }
  }
}

register10DLC();
