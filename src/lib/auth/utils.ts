/**
 * Authentication Utilities
 * Provides password hashing and token management
 */

import { createHash, randomBytes } from 'crypto';

export class AuthUtils {
  /**
   * Hash a password using SHA-256
   * In production, use bcrypt or argon2 instead
   */
  static hashPassword(password: string, salt?: string): string {
    const actualSalt = salt || randomBytes(16).toString('hex');
    const hash = createHash('sha256');
    hash.update(password + actualSalt);
    return `${actualSalt}:${hash.digest('hex')}`;
  }

  /**
   * Verify a password against a hash
   */
  static verifyPassword(password: string, hashedPassword: string): boolean {
    const [salt, hash] = hashedPassword.split(':');
    if (!salt || !hash) return false;
    
    const newHash = this.hashPassword(password, salt);
    return newHash === hashedPassword;
  }

  /**
   * Generate a secure API key
   */
  static generateAPIKey(prefix: string = 'bickford'): string {
    const key = randomBytes(32).toString('hex');
    return `${prefix}_${key}`;
  }

  /**
   * Hash an API key for storage
   */
  static hashAPIKey(apiKey: string): string {
    const hash = createHash('sha256');
    hash.update(apiKey);
    return hash.digest('hex');
  }

  /**
   * Generate a secure session token
   */
  static generateSessionToken(): string {
    return randomBytes(48).toString('base64url');
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Generate a secure random string
   */
  static generateSecureRandom(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }
}

/**
 * Rate limiting utility
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; resetAt: number }> = new Map();

  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}

  check(identifier: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);

    if (!attempt || now > attempt.resetAt) {
      this.attempts.set(identifier, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, remaining: this.maxAttempts - 1 };
    }

    if (attempt.count >= this.maxAttempts) {
      return { allowed: false, remaining: 0 };
    }

    attempt.count++;
    return { allowed: true, remaining: this.maxAttempts - attempt.count };
  }

  reset(identifier: string) {
    this.attempts.delete(identifier);
  }
}
