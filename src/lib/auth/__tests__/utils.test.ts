/**
 * Auth Utils Tests
 */

import { AuthUtils } from '../utils';

describe('AuthUtils', () => {
  describe('password hashing', () => {
    it('should hash passwords consistently with same salt', () => {
      const password = 'testPassword123';
      const hash1 = AuthUtils.hashPassword(password);
      const [salt] = hash1.split(':');
      const hash2 = AuthUtils.hashPassword(password, salt);
      
      expect(hash1).toBe(hash2);
    });

    it('should verify correct passwords', () => {
      const password = 'correctPassword';
      const hash = AuthUtils.hashPassword(password);
      
      expect(AuthUtils.verifyPassword(password, hash)).toBe(true);
    });

    it('should reject incorrect passwords', () => {
      const password = 'correctPassword';
      const hash = AuthUtils.hashPassword(password);
      
      expect(AuthUtils.verifyPassword('wrongPassword', hash)).toBe(false);
    });
  });

  describe('API key generation', () => {
    it('should generate keys with correct prefix', () => {
      const key = AuthUtils.generateAPIKey('test');
      expect(key).toMatch(/^test_[a-f0-9]{64}$/);
    });

    it('should generate unique keys', () => {
      const key1 = AuthUtils.generateAPIKey();
      const key2 = AuthUtils.generateAPIKey();
      expect(key1).not.toBe(key2);
    });
  });

  describe('email validation', () => {
    it('should validate correct email addresses', () => {
      expect(AuthUtils.isValidEmail('test@example.com')).toBe(true);
      expect(AuthUtils.isValidEmail('user.name+tag@example.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(AuthUtils.isValidEmail('invalid')).toBe(false);
      expect(AuthUtils.isValidEmail('invalid@')).toBe(false);
      expect(AuthUtils.isValidEmail('@example.com')).toBe(false);
      expect(AuthUtils.isValidEmail('test@')).toBe(false);
    });
  });

  describe('API key hashing', () => {
    it('should hash keys consistently', () => {
      const apiKey = 'test_1234567890abcdef';
      const hash1 = AuthUtils.hashAPIKey(apiKey);
      const hash2 = AuthUtils.hashAPIKey(apiKey);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 produces 64 hex characters
    });
  });
});
