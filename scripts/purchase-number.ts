/**
 * Purchase a Twilio phone number
 */

import twilio from 'twilio';

const accountSid = 'ACb0a4821ebd89c68cdbee5b1f7dfb446a';
const authToken = '74435130590eec2f3f8cc6ac28758936';
const numberToPurchase = '+12765985129';

async function purchaseNumber() {
  try {
    const client = twilio(accountSid, authToken);

    console.log(`📱 Purchasing phone number: ${numberToPurchase}...\n`);

    const purchasedNumber = await client.incomingPhoneNumbers.create({
      phoneNumber: numberToPurchase,
      friendlyName: 'Bickford SMS Number',
      smsUrl: 'https://hvpe-cloud-portal.vercel.app/api/sms',
      smsMethod: 'POST',
    });

    console.log('✅ NUMBER PURCHASED SUCCESSFULLY!\n');
    console.log(`📞 Phone Number: ${purchasedNumber.phoneNumber}`);
    console.log(`📝 Friendly Name: ${purchasedNumber.friendlyName}`);
    console.log(`📊 SID: ${purchasedNumber.sid}`);
    console.log(`💰 Monthly Cost: ~$1.00`);
    console.log(`\n✅ Ready to send SMS immediately!\n`);

    return purchasedNumber.phoneNumber;
  } catch (error: unknown) {
    console.error('\n❌ FAILED TO PURCHASE NUMBER');
    console.error(`Error: ${error.message}`);
    if (error.code) {
      console.error(`Code: ${error.code}`);
    }
    if (error.moreInfo) {
      console.error(`More info: ${error.moreInfo}`);
    }
  }
}

purchaseNumber();
