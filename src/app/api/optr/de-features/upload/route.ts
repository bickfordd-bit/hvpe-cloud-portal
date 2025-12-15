import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiError } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';
import { DEFeaturesParser } from '@/lib/optr/deFeatures/parser';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    logger.info('DE Features workbook upload started');
    
    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('workbook') as File;
    
    if (!file) {
      return NextResponse.json(
        apiError('No workbook file provided'),
        { status: 400 }
      );
    }
    
    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        apiError('Invalid file type. Please upload an Excel file (.xlsx or .xls)'),
        { status: 400 }
      );
    }
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Parse workbook into mathematical object 𝒲
    const workbook = DEFeaturesParser.parseWorkbook(buffer);
    
    // Optionally store in database (for now, return in response)
    // TODO: Store in Prisma with versioning
    
    logger.info('Workbook parsed successfully', {
      featureCount: workbook.features.length,
      version: workbook.version
    });
    
    return NextResponse.json(apiSuccess({
      message: 'Workbook parsed successfully',
      workbook: {
        featureCount: workbook.features.length,
        choiceCount: workbook.choices.size,
        standardsCount: workbook.standards.length,
        metricsCount: workbook.metrics.length,
        version: workbook.version,
        lastUpdated: workbook.lastUpdated
      },
      // Return full workbook for now (can be cached on client)
      data: workbook
    }));
    
  } catch (error: any) {
    logger.error('Workbook upload failed', {
      error: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      apiError(error),
      { status: 500 }
    );
  }
}

// Get currently loaded workbook metadata
export async function GET(req: NextRequest) {
  try {
    // TODO: Retrieve from database
    // For now, return placeholder
    
    return NextResponse.json(apiSuccess({
      message: 'No workbook currently loaded',
      instructions: 'POST an Excel file to /api/optr/de-features/upload'
    }));
    
  } catch (error: any) {
    logger.error('Workbook retrieval failed', { error: error.message });
    return NextResponse.json(apiError(error), { status: 500 });
  }
}
