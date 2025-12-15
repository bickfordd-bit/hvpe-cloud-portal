import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const startTime = Date.now();
  
  type HealthCheck = { status: string; message?: string };
  
  const health: {
    status: string;
    timestamp: string;
    uptime: number;
    checks: {
      api: HealthCheck;
      database: HealthCheck;
      openai: HealthCheck;
    };
    version: string;
    environment: string;
  } = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      api: { status: "ok" },
      database: { status: "unknown" },
      openai: { status: "unknown" }
    },
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development"
  };

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = { status: "ok" };
  } catch (error) {
    health.checks.database = { 
      status: "degraded",
      message: "Database not available (optional)"
    };
  }

  // Check OpenAI API key configuration
  if (process.env.OPENAI_API_KEY || process.env.HVPE_OPENAI_API_KEY) {
    health.checks.openai = { status: "configured" };
  } else {
    health.checks.openai = { 
      status: "missing",
      message: "OpenAI API key not configured"
    };
    health.status = "degraded";
  }

  const responseTime = Date.now() - startTime;

  return NextResponse.json({
    ...health,
    responseTime: `${responseTime}ms`
  }, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}
