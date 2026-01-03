import { NextRequest, NextResponse } from "next/server";
import { apiSuccess, apiError } from "@/lib/apiResponse";
import { logger } from "@/lib/logger";
import {
  verifyCodexSecret,
  syncCodexChanges,
  previewCodexChanges,
  type CodexTask,
} from "@/lib/codex/sync";

/**
 * POST /api/codex/sync
 * 
 * Webhook endpoint for Codex task synchronization
 * Accepts tasks from Codex and applies changes to the system
 */
export async function POST(req: NextRequest) {
  try {
    // Verify webhook secret
    const secret = req.headers.get("x-codex-secret");
    if (!secret || !verifyCodexSecret(secret)) {
      logger.warn("Codex sync: unauthorized attempt", {
        ip: req.headers.get("x-forwarded-for"),
      });
      return NextResponse.json(apiError(new Error("Unauthorized")), {
        status: 401,
      });
    }

    const body = await req.json();
    const task: CodexTask = body;

    // Validate task
    if (!task.id || !task.description) {
      return NextResponse.json(
        apiError(new Error("Invalid task format: missing id or description")),
        { status: 400 },
      );
    }

    logger.info("Codex sync request received", {
      taskId: task.id,
      description: task.description,
      changesCount: task.changes
        ? Array.isArray(task.changes)
          ? task.changes.length
          : 0
        : 0,
    });

    // Check for preview-only mode
    const previewOnly = req.nextUrl.searchParams.get("preview") === "true";
    if (previewOnly) {
      const preview = await previewCodexChanges(task);
      return NextResponse.json(
        apiSuccess({
          mode: "preview",
          preview,
          task,
        }),
      );
    }

    // Apply changes
    const result = await syncCodexChanges(task);

    if (!result.success) {
      return NextResponse.json(
        apiError(new Error(result.error || "Sync failed")),
        { status: 500 },
      );
    }

    return NextResponse.json(
      apiSuccess({
        message: "Codex changes synced successfully",
        ...result,
      }),
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error("Codex sync endpoint error", { error: errorMessage });
    return NextResponse.json(
      apiError(error instanceof Error ? error : new Error(String(error))),
      { status: 500 },
    );
  }
}

/**
 * GET /api/codex/sync
 * Status endpoint - returns configuration and availability info
 */
export async function GET() {
  const isConfigured = !!process.env.CODEX_WEBHOOK_SECRET;

  return NextResponse.json(
    apiSuccess({
      status: "online",
      configured: isConfigured,
      endpoint: "/api/codex/sync",
      authentication: "x-codex-secret header required",
      usage: {
        sync: "POST with CodexTask body",
        preview: "POST with ?preview=true query param",
      },
    }),
  );
}
