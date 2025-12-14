/**
 * Lookup phone number details
 */

import twilio from "twilio";

const accountSid = "ACb0a4821ebd89c68cdbee5b1f7dfb446a";
const authToken = "74435130590eec2f3f8cc6ac28758936";
const numberToCheck = "+12152057238";

async function lookupNumber() {
  try {
    const client = twilio(accountSid, authToken);
    
    console.log(`🔍 Looking up: ${numberToCheck}\n`);
    
    const phoneNumber = await client.lookups.v2
      .phoneNumbers(numberToCheck)
      .fetch();
    
    console.log("📊 NUMBER DETAILS:\n");
    console.log(`Phone Number: ${phoneNumber.phoneNumber}`);
    console.log(`Valid: ${phoneNumber.valid}`);
    console.log(`National Format: ${phoneNumber.nationalFormat}`);
    console.log(`Country Code: ${phoneNumber.countryCode}`);
    
    if (phoneNumber.callingCountryCode) {
      console.log(`Calling Country Code: ${phoneNumber.callingCountryCode}`);
    }
    
  } catch (error: any) {
    console.error("\n❌ LOOKUP FAILED");
    console.error(`Error: ${error.message}`);
    console.error("\nThis could mean:");
    console.error("- Number is invalid");
    console.error("- Number format is incorrect");
    console.error("- Number doesn't exist");
  }
}

lookupNumber();
