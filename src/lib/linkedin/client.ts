/**
 * LinkedIn API Client
 * Handles OAuth and content posting
 */

import { logger } from '@/lib/logger';

interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

interface LinkedInPost {
  author: string; // URN format: urn:li:person:{personId}
  lifecycleState: 'PUBLISHED';
  specificContent: {
    'com.linkedin.ugc.ShareContent': {
      shareCommentary: {
        text: string;
      };
      shareMediaCategory: 'NONE' | 'ARTICLE' | 'IMAGE';
      media?: Array<{
        status: 'READY';
        description: {
          text: string;
        };
        originalUrl: string;
        title: {
          text: string;
        };
      }>;
    };
  };
  visibility: {
    'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' | 'CONNECTIONS';
  };
}

export class LinkedInClient {
  private accessToken: string | null = null;
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.LINKEDIN_CLIENT_ID || '';
    this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET || '';
    this.redirectUri = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/linkedin/callback';
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'w_member_social,r_liteprofile,r_emailaddress',
      state: state || Math.random().toString(36).substring(7),
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<LinkedInTokenResponse> {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error('LinkedIn token exchange failed', { error, status: response.status });
      throw new Error(`LinkedIn auth failed: ${error}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    return data;
  }

  /**
   * Set access token manually
   */
  setAccessToken(token: string) {
    this.accessToken = token;
  }

  /**
   * Get user profile (to get person URN)
   */
  async getUserProfile(): Promise<{ id: string; firstName: string; lastName: string }> {
    if (!this.accessToken) throw new Error('No access token');

    const response = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'cache-control': 'no-cache',
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get profile: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Post text content to LinkedIn
   */
  async postText(text: string, visibility: 'PUBLIC' | 'CONNECTIONS' = 'PUBLIC'): Promise<{ id: string; shareUrl: string }> {
    if (!this.accessToken) throw new Error('No access token');

    // Get user profile to get person URN
    const profile = await this.getUserProfile();
    const authorUrn = `urn:li:person:${profile.id}`;

    const post: LinkedInPost = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text,
          },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': visibility,
      },
    };

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(post),
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error('LinkedIn post failed', { error, status: response.status });
      throw new Error(`Failed to post: ${error}`);
    }

    const result = await response.json();
    const postId = result.id;
    const shareUrl = `https://www.linkedin.com/feed/update/${postId}`;

    logger.info('LinkedIn post created', { postId, shareUrl });

    return { id: postId, shareUrl };
  }

  /**
   * Post content with link preview
   */
  async postWithLink(
    text: string,
    linkUrl: string,
    linkTitle: string,
    linkDescription: string,
    visibility: 'PUBLIC' | 'CONNECTIONS' = 'PUBLIC'
  ): Promise<{ id: string; shareUrl: string }> {
    if (!this.accessToken) throw new Error('No access token');

    const profile = await this.getUserProfile();
    const authorUrn = `urn:li:person:${profile.id}`;

    const post: LinkedInPost = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text,
          },
          shareMediaCategory: 'ARTICLE',
          media: [
            {
              status: 'READY',
              description: {
                text: linkDescription,
              },
              originalUrl: linkUrl,
              title: {
                text: linkTitle,
              },
            },
          ],
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': visibility,
      },
    };

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(post),
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error('LinkedIn post with link failed', { error, status: response.status });
      throw new Error(`Failed to post: ${error}`);
    }

    const result = await response.json();
    const postId = result.id;
    const shareUrl = `https://www.linkedin.com/feed/update/${postId}`;

    logger.info('LinkedIn post with link created', { postId, shareUrl });

    return { id: postId, shareUrl };
  }
}

export const linkedInClient = new LinkedInClient();
