/**
 * Copyright (c) 2025 HVPE Inc. All rights reserved.
 * Proprietary - Patent Pending
 *
 * SMS Sending API
 */

import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(req: Request) {
  try {
    const { to, message } = await req.json();

    if (!to || !message) {
      return NextResponse.json({ error: "Missing 'to' or 'message' field" }, { status: 400 });
    }

    // Check for Twilio credentials
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      // Fallback mode - simulate SMS in development
      console.log('[SMS SIMULATION MODE]');
      console.log(`To: ${to}`);
      console.log(`Message: ${message}`);
      console.log(`From: ${fromNumber || '(not configured)'}`);

      return NextResponse.json({
        success: true,
        simulation: true,
        message: 'SMS simulated (Twilio credentials not configured)',
        to,
        messagePreview: message.substring(0, 100),
      });
    }

    // Send real SMS via Twilio
    const client = twilio(accountSid, authToken);

    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: to,
    });

    return NextResponse.json({
      success: true,
      simulation: false,
      messageSid: result.sid,
      status: result.status,
      to: result.to,
    });
  } catch (error: unknown) {
    console.error('[SMS ERROR]', error);
    return NextResponse.json({ error: error.message || 'Failed to send SMS' }, { status: 500 });
  }
}
