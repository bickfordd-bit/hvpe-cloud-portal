import { logger } from '@/lib/logger';

/**
 * Mathematical representation of API key management
 * 
 * K_openai ∈ Σ*, K_openai ∉ 𝒟_persisted
 * Auth(service) = getenv("HVPE_OPENAI_API_KEY") | getenv("OPENAI_API_KEY")
 */

export interface KeyMetadata {
  source: 'HVPE_OPENAI_API_KEY' | 'OPENAI_API_KEY';
  createdAt?: Date;
  expiresAt?: Date;
  lastRotated?: Date;
  usageCount: number;
  lastUsed?: Date;
}

export interface RateLimitStatus {
  tokensPerMinute: number;
  requestsPerMinute: number;
  currentTPM: number;
  currentRPM: number;
  percentageUsedTPM: number;
  percentageUsedRPM: number;
  shouldThrottle: boolean;
  shouldAlert: boolean;
}

/**
 * OpenAI Key Manager
 * Handles secure key retrieval, validation, rotation tracking, and rate limiting
 */
export class OpenAIKeyManager {
  private static instance: OpenAIKeyManager;
  private key: string | null = null;
  private metadata: KeyMetadata = {
    source: 'HVPE_OPENAI_API_KEY',
    usageCount: 0
  };
  private rateLimitState: {
    tpmUsed: number;
    rpmUsed: number;
    windowStart: Date;
  } = {
    tpmUsed: 0,
    rpmUsed: 0,
    windowStart: new Date()
  };

  private constructor() {
    this.loadKey();
    this.loadMetadata();
  }

  static getInstance(): OpenAIKeyManager {
    if (!OpenAIKeyManager.instance) {
      OpenAIKeyManager.instance = new OpenAIKeyManager();
    }
    return OpenAIKeyManager.instance;
  }

  /**
   * Load API key from environment
   * Priority: HVPE_OPENAI_API_KEY > OPENAI_API_KEY
   */
  private loadKey(): void {
    // Try HVPE key first (preferred)
    if (process.env.HVPE_OPENAI_API_KEY) {
      this.key = process.env.HVPE_OPENAI_API_KEY;
      this.metadata.source = 'HVPE_OPENAI_API_KEY';
      logger.info('OpenAI key loaded from HVPE_OPENAI_API_KEY');
      return;
    }

    // Fallback to standard OpenAI key
    if (process.env.OPENAI_API_KEY) {
      this.key = process.env.OPENAI_API_KEY;
      this.metadata.source = 'OPENAI_API_KEY';
      logger.warn('OpenAI key loaded from fallback OPENAI_API_KEY (prefer HVPE_OPENAI_API_KEY)');
      return;
    }

    logger.error('No OpenAI API key found in environment');
    throw new Error(
      'OpenAI API key not found. Set HVPE_OPENAI_API_KEY or OPENAI_API_KEY environment variable.\n' +
      'Get your key from: https://platform.openai.com/api-keys'
    );
  }

  /**
   * Load key metadata from environment
   */
  private loadMetadata(): void {
    if (process.env.OPENAI_KEY_CREATED_AT) {
      this.metadata.createdAt = new Date(process.env.OPENAI_KEY_CREATED_AT);
    }

    if (process.env.OPENAI_KEY_EXPIRES_AT) {
      this.metadata.expiresAt = new Date(process.env.OPENAI_KEY_EXPIRES_AT);
    }
  }

  /**
   * Get API key (safe accessor)
   * Never logs the actual key value
   */
  getKey(): string {
    if (!this.key) {
      throw new Error('OpenAI API key not available');
    }

    // Check if key is expired
    if (this.metadata.expiresAt && new Date() > this.metadata.expiresAt) {
      logger.error('OpenAI API key has expired', {
        expiresAt: this.metadata.expiresAt,
        source: this.metadata.source
      });
      throw new Error('OpenAI API key expired. Please rotate your key.');
    }

    // Track usage
    this.metadata.usageCount++;
    this.metadata.lastUsed = new Date();

    return this.key;
  }

  /**
   * Validate key format (without making API call)
   */
  validateKeyFormat(key?: string): boolean {
    const keyToValidate = key || this.key;
    if (!keyToValidate) return false;

    // OpenAI keys start with sk- and are 48-51 characters
    return /^sk-[a-zA-Z0-9-_]{43,}$/.test(keyToValidate);
  }

  /**
   * Get key metadata (safe - no actual key exposed)
   */
  getMetadata(): KeyMetadata {
    return {
      ...this.metadata,
      lastUsed: this.metadata.lastUsed
    };
  }

  /**
   * Track rate limit usage
   */
  trackUsage(tokensUsed: number): void {
    const now = new Date();
    const minutesSinceWindow = (now.getTime() - this.rateLimitState.windowStart.getTime()) / 60000;

    // Reset window if more than 1 minute has passed
    if (minutesSinceWindow >= 1) {
      this.rateLimitState = {
        tpmUsed: tokensUsed,
        rpmUsed: 1,
        windowStart: now
      };
    } else {
      this.rateLimitState.tpmUsed += tokensUsed;
      this.rateLimitState.rpmUsed += 1;
    }

    logger.debug('Rate limit usage tracked', {
      tokensUsed,
      tpmTotal: this.rateLimitState.tpmUsed,
      rpmTotal: this.rateLimitState.rpmUsed
    });
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus(): RateLimitStatus {
    const tpmLimit = Number(process.env.OPENAI_TPM_LIMIT || 90000);
    const rpmLimit = Number(process.env.OPENAI_RPM_LIMIT || 3500);
    const alertThreshold = Number(process.env.OPENAI_ALERT_THRESHOLD || 80);

    const percentageUsedTPM = (this.rateLimitState.tpmUsed / tpmLimit) * 100;
    const percentageUsedRPM = (this.rateLimitState.rpmUsed / rpmLimit) * 100;

    const shouldThrottle = percentageUsedTPM > 90 || percentageUsedRPM > 90;
    const shouldAlert = percentageUsedTPM > alertThreshold || percentageUsedRPM > alertThreshold;

    if (shouldAlert) {
      logger.warn('OpenAI rate limit approaching threshold', {
        percentageUsedTPM,
        percentageUsedRPM,
        alertThreshold
      });
    }

    return {
      tokensPerMinute: tpmLimit,
      requestsPerMinute: rpmLimit,
      currentTPM: this.rateLimitState.tpmUsed,
      currentRPM: this.rateLimitState.rpmUsed,
      percentageUsedTPM,
      percentageUsedRPM,
      shouldThrottle,
      shouldAlert
    };
  }

  /**
   * Check if key should be rotated
   */
  shouldRotateKey(): boolean {
    const metadata = this.getMetadata();

    // Rotate if expired
    if (metadata.expiresAt && new Date() > metadata.expiresAt) {
      return true;
    }

    // Rotate if created more than 30 days ago
    if (metadata.createdAt) {
      const daysSinceCreation = (Date.now() - metadata.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation > 30) {
        logger.warn('OpenAI key is older than 30 days, consider rotating', {
          daysSinceCreation
        });
        return true;
      }
    }

    return false;
  }

  /**
   * Redact key for logging (show only prefix and suffix)
   */
  static redactKey(key: string): string {
    if (!key || key.length < 10) return '***';
    return `${key.substring(0, 7)}...${key.substring(key.length - 4)}`;
  }
}

// Export lazy singleton getter to avoid errors during build
let _keyManagerInstance: OpenAIKeyManager | null = null;

export function getKeyManager(): OpenAIKeyManager {
  if (!_keyManagerInstance) {
    _keyManagerInstance = OpenAIKeyManager.getInstance();
  }
  return _keyManagerInstance;
}

// Backwards compatibility - lazy getter that returns the instance
export const keyManager = new Proxy({} as OpenAIKeyManager, {
  get(_target, prop) {
    return (getKeyManager() as any)[prop];
  }
});
