/**
 * Copyright (c) 2025 HVPE Inc. All rights reserved.
 * Proprietary - Patent Pending
 * 
 * API Key Generation
 */

import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  try {
    const { name, scopes } = await req.json();

    // Generate secure API key
    const prefix = "bickford";
    const keyData = randomBytes(32).toString("hex");
    const apiKey = `${prefix}_${keyData}`;

    // In production, store this in database with hash
    // For now, return it to user (they must save it)
    const keyInfo = {
      id: randomBytes(16).toString("hex"),
      name: name || "Unnamed API Key",
      key: apiKey,
      scopes: scopes || ["bickford:chat", "optr:run", "optr:status"],
      createdAt: new Date().toISOString(),
      expiresAt: null, // null = no expiration
      lastUsed: null
    };

    // Log creation (in production, save to database)
    console.log("[API KEY CREATED]", {
      id: keyInfo.id,
      name: keyInfo.name,
      scopes: keyInfo.scopes
    });

    return NextResponse.json({
      success: true,
      apiKey: keyInfo,
      warning: "Save this key now - you won't be able to see it again!"
    });

  } catch (error: any) {
    console.error("[API KEY ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate API key" },
      { status: 500 }
    );
  }
}
