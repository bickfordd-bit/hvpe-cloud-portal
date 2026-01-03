import { NextRequest, NextResponse } from "next/server";
import { apiSuccess, apiError } from "@/lib/apiResponse";
import { logger } from "@/lib/logger";
import { DEFeaturesMatcher } from "@/lib/optr/deFeatures/matcher";
import fs from "fs/promises";
import path from "path";

// TODO: Replace with database lookup
// For now, load from a cached file
const WORKBOOK_CACHE_PATH = path.join(
  process.cwd(),
  "data",
  "de-features-workbook.json",
);

export async function POST(req: NextRequest) {
  try {
    // Validate environment at runtime, not build time
    const apiKey =
      process.env.HVPE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        apiError(
          "OpenAI API key not configured. Set HVPE_OPENAI_API_KEY or OPENAI_API_KEY environment variable.",
        ),
        { status: 503 },
      );
    }

    const body = await req.json();
    const { requirements, opportunityId, topK = 5 } = body;

    if (!requirements || !Array.isArray(requirements)) {
      return NextResponse.json(
        apiError("Requirements must be an array of strings"),
        { status: 400 },
      );
    }

    logger.info("DE Features matching started", {
      opportunityId,
      requirementCount: requirements.length,
    });

    // Load workbook (TODO: from database)
    let workbookData: string;
    try {
      workbookData = await fs.readFile(WORKBOOK_CACHE_PATH, "utf-8");
    } catch {
      return NextResponse.json(
        apiError(
          "No DE Features workbook loaded. Please upload one first via /api/optr/de-features/upload",
        ),
        { status: 404 },
      );
    }

    const workbook = JSON.parse(workbookData);

    // Initialize matcher
    const matcher = new DEFeaturesMatcher(workbook);
    await matcher.initialize();

    // Match requirements
    const matchedFeatures = await matcher.matchRequirements(requirements, topK);

    // Analyze for gaps
    const analysis = await matcher.analyzeOpportunity(
      opportunityId || "unknown",
      requirements,
      apiKey,
    );

    logger.info("DE Features matching completed", {
      opportunityId,
      matchCount: matchedFeatures.length,
      coverageScore: analysis.coverageScore,
    });

    return NextResponse.json(
      apiSuccess({
        analysis,
        matchedFeatures: matchedFeatures.slice(0, topK),
      }),
    );
  } catch (error) {
    logger.error("DE Features matching failed", {
      error: (error as Error).message,
      stack: (error as Error).stack,
    });

    return NextResponse.json(apiError(error), { status: 500 });
  }
}
