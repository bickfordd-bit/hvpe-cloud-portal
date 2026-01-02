/**
 * LinkedIn Post API
 * POST /api/linkedin/post
 */

import { NextRequest, NextResponse } from 'next/server';
import { linkedInClient } from '@/lib/linkedin/client';
import { apiSuccess, apiError } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';

interface PostRequest {
  text: string;
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
  visibility?: 'PUBLIC' | 'CONNECTIONS';
}

export async function POST(req: NextRequest) {
  try {
    // Get access token from cookie (or database/session)
    const accessToken = req.cookies.get('linkedin_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        apiError(new Error('Not authenticated with LinkedIn')),
        { status: 401 }
      );
    }

    const body: PostRequest = await req.json();

    if (!body.text) {
      return NextResponse.json(
        apiError(new Error('Text content is required')),
        { status: 400 }
      );
    }

    // Set access token
    linkedInClient.setAccessToken(accessToken);

    // Post to LinkedIn
    let result;
    if (body.linkUrl && body.linkTitle) {
      result = await linkedInClient.postWithLink(
        body.text,
        body.linkUrl,
        body.linkTitle,
        body.linkDescription || '',
        body.visibility || 'PUBLIC'
      );
    } else {
      result = await linkedInClient.postText(
        body.text,
        body.visibility || 'PUBLIC'
      );
    }

    logger.info('LinkedIn post created via API', { postId: result.id });

    return NextResponse.json(
      apiSuccess({
        postId: result.id,
        shareUrl: result.shareUrl,
        message: 'Posted to LinkedIn successfully',
      })
    );
  } catch (error: any) {
    logger.error('LinkedIn post API error', { error: error.message });
    return NextResponse.json(apiError(error), { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'LinkedIn Post API',
    usage: {
      method: 'POST',
      body: {
        text: 'Your post content (required)',
        linkUrl: 'URL to share (optional)',
        linkTitle: 'Link title (optional)',
        linkDescription: 'Link description (optional)',
        visibility: 'PUBLIC or CONNECTIONS (optional, default: PUBLIC)',
      },
    },
    authentication: 'Requires LinkedIn OAuth - visit /api/linkedin/auth first',
  });
}
