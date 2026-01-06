/**
 * Intent Execution API Route
 * GET /api/intent/execute - Execute intent with Server-Sent Events (SSE)
 */

import { NextRequest } from "next/server";

type ProgressUpdate = {
  step: string;
  status: "pending" | "in_progress" | "complete" | "error";
  message: string;
  timestamp: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(req: NextRequest) {
  const intent = req.nextUrl.searchParams.get("intent");

  if (!intent) {
    return new Response("Intent parameter is required", { status: 400 });
  }

  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const sendUpdate = (update: ProgressUpdate) => {
        const data = `data: ${JSON.stringify(update)}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      try {
        // Simulate intent execution with progress updates
        // In a real implementation, this would call actual backend services

        // Step 1: Parse intent
        sendUpdate({
          step: "Analyzing intent",
          status: "in_progress",
          message: "Understanding your request...",
          timestamp: new Date().toISOString(),
        });
        await sleep(800);
        sendUpdate({
          step: "Analyzing intent",
          status: "complete",
          message: "Intent understood",
          timestamp: new Date().toISOString(),
        });

        // Step 2: Check permissions
        sendUpdate({
          step: "Verifying permissions",
          status: "in_progress",
          message: "Checking account permissions...",
          timestamp: new Date().toISOString(),
        });
        await sleep(600);
        sendUpdate({
          step: "Verifying permissions",
          status: "complete",
          message: "Permissions verified",
          timestamp: new Date().toISOString(),
        });

        // Step 3: Execute actions (simulated)
        const actions = [
          { name: "Fetching market data", duration: 1000 },
          { name: "Calculating positions", duration: 800 },
          { name: "Updating dashboard", duration: 600 },
        ];

        for (const action of actions) {
          sendUpdate({
            step: action.name,
            status: "in_progress",
            message: `Processing ${action.name.toLowerCase()}...`,
            timestamp: new Date().toISOString(),
          });
          await sleep(action.duration);
          sendUpdate({
            step: action.name,
            status: "complete",
            message: `${action.name} completed`,
            timestamp: new Date().toISOString(),
          });
        }

        // Final completion
        sendUpdate({
          step: "Execution complete",
          status: "complete",
          message: "All actions completed successfully",
          timestamp: new Date().toISOString(),
        });

        // Close the stream
        controller.close();
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        sendUpdate({
          step: "Execution failed",
          status: "error",
          message: errorMessage,
          timestamp: new Date().toISOString(),
        });
        controller.close();
      }
    },
  });

  // Return SSE response
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
