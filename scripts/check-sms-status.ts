/**
 * Check SMS status
 */

import twilio from 'twilio';

const accountSid = 'ACb0a4821ebd89c68cdbee5b1f7dfb446a';
const authToken = '74435130590eec2f3f8cc6ac28758936';
const messageSid = 'SMa347202a1614da625c924ad4bb555fa4'; // Latest message

async function checkStatus() {
  try {
    const client = twilio(accountSid, authToken);

    console.log(`📱 Checking status for message: ${messageSid}\n`);

    const message = await client.messages(messageSid).fetch();

    console.log('📊 MESSAGE STATUS:\n');
    console.log(`From: ${message.from}`);
    console.log(`To: ${message.to}`);
    console.log(`Status: ${message.status}`);
    console.log(`Date Sent: ${message.dateSent || 'Not sent yet'}`);
    console.log(`Price: ${message.price || 'N/A'} ${message.priceUnit || ''}`);
    console.log(`Error Code: ${message.errorCode || 'None'}`);
    console.log(`Error Message: ${message.errorMessage || 'None'}`);
    console.log(`\nBody Preview: ${message.body.substring(0, 100)}...`);

    if (message.status === 'failed' || message.status === 'undelivered') {
      console.log('\n❌ MESSAGE FAILED TO DELIVER');
      console.log('Possible reasons:');
      console.log('- Invalid phone number');
      console.log('- Number cannot receive SMS');
      console.log('- Carrier blocked the message');
      console.log('- Number requires opt-in first');
    } else if (message.status === 'queued' || message.status === 'sent') {
      console.log('\n⏳ Message is still being processed/delivered');
    } else if (message.status === 'delivered') {
      console.log('\n✅ Message was delivered successfully');
    }

    // Also check recent messages
    console.log('\n\n📋 Recent messages from your account:\n');
    const recentMessages = await client.messages.list({ limit: 5 });

    recentMessages.forEach((msg, i) => {
      console.log(`${i + 1}. ${msg.to} - ${msg.status} - ${msg.dateCreated}`);
      if (msg.errorCode) {
        console.log(`   ❌ Error: ${msg.errorCode} - ${msg.errorMessage}`);
      }
    });
  } catch (error: unknown) {
    console.error('\n❌ ERROR:');
    console.error(error.message);
  }
}

checkStatus();
