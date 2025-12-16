/**
 * Twilio Setup - Check and acquire phone numbers
 */

import twilio from "twilio";

const accountSid = "ACb0a4821ebd89c68cdbee5b1f7dfb446a";
const authToken = "74435130590eec2f3f8cc6ac28758936";

async function setupTwilio() {
  try {
    const client = twilio(accountSid, authToken);
    
    console.log("📱 Checking your Twilio phone numbers...\n");
    
    // List all phone numbers in account
    const numbers = await client.incomingPhoneNumbers.list();
    
    if (numbers.length === 0) {
      console.log("❌ No phone numbers found in your account.\n");
    } else {
      console.log(`✅ Found ${numbers.length} phone number(s):\n`);
      numbers.forEach((number, i) => {
        console.log(`${i + 1}. ${number.phoneNumber}`);
        console.log(`   Type: ${number.capabilities.sms ? 'SMS-enabled' : 'Voice only'}`);
        console.log(`   Friendly Name: ${number.friendlyName || 'N/A'}`);
        console.log(`   Status: ${number.status}\n`);
      });
    }
    
    // Find a suitable SMS-enabled local number
    const smsNumber = numbers.find(n => n.capabilities.sms && !n.phoneNumber.includes('855'));
    
    if (smsNumber) {
      console.log(`\n✅ RECOMMENDED NUMBER FOR SMS: ${smsNumber.phoneNumber}`);
      console.log(`\nUpdate your script to use: "${smsNumber.phoneNumber}"\n`);
      return smsNumber.phoneNumber;
    }
    
    // Try to find available local numbers
    console.log("\n🔍 Searching for available local phone numbers in USA...\n");
    
    const availableNumbers = await client.availablePhoneNumbers('US')
      .local
      .list({
        smsEnabled: true,
        limit: 5
      });
    
    if (availableNumbers.length > 0) {
      console.log(`✅ Found ${availableNumbers.length} available numbers:\n`);
      availableNumbers.forEach((num, i) => {
        console.log(`${i + 1}. ${num.phoneNumber} (${num.locality}, ${num.region})`);
      });
      
      console.log("\n💡 To purchase the first number, run:");
      console.log("   Would you like me to purchase one automatically? (costs ~$1/month)\n");
      
      // Uncomment to auto-purchase:
      // const purchasedNumber = await client.incomingPhoneNumbers.create({
      //   phoneNumber: availableNumbers[0].phoneNumber,
      //   friendlyName: 'Bickford SMS Number'
      // });
      // console.log(`✅ Purchased: ${purchasedNumber.phoneNumber}`);
      
      return availableNumbers[0].phoneNumber;
    } else {
      console.log("❌ No available numbers found. Try a different area code.\n");
    }
    
  } catch (error: any) {
    console.error("\n❌ ERROR:");
    console.error(error.message);
    if (error.code) {
      console.error(`Code: ${error.code}`);
    }
  }
}

setupTwilio();
