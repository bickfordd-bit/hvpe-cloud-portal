/**
 * OPTR Trade API Endpoint Tests
 */

import { POST } from '../route';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('POST /api/optr/trade', () => {
  const mockWorkerUrl = 'http://localhost:8787';
  const mockAdminKey = 'test-admin-key';
  
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OPTR_ADMIN_KEY = mockAdminKey;
    process.env.OPTR_WORKER_URL = mockWorkerUrl;
    process.env.OPTR_MAX_NOTIONAL = '50';
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    delete process.env.OPTR_ADMIN_KEY;
    delete process.env.OPTR_WORKER_URL;
    delete process.env.OPTR_MAX_NOTIONAL;
  });

  function createMockRequest(body: any, headers: Record<string, string> = {}, includeAdminKey = true) {
    const allHeaders: Record<string, string> = {
      ...(includeAdminKey ? { 'x-optr-admin-key': mockAdminKey } : {}),
      ...headers
    };
    return {
      json: async () => body,
      headers: {
        get: (key: string) => allHeaders[key.toLowerCase()] || null,
        has: (key: string) => key.toLowerCase() in allHeaders,
      },
    } as unknown as NextRequest;
  }

  describe('Authentication', () => {
    it('should reject requests without admin key', async () => {
      const req = createMockRequest({ symbol: 'AAPL' }, {}, false);
      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error?.code).toBe('UNAUTHORIZED');
    });

    it('should reject requests with invalid admin key', async () => {
      const req = createMockRequest({ symbol: 'AAPL' }, {
        'x-optr-admin-key': 'wrong-key'
      });
      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('should return error when OPTR_ADMIN_KEY not configured', async () => {
      delete process.env.OPTR_ADMIN_KEY;
      const req = createMockRequest({ symbol: 'AAPL' });
      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error?.code).toBe('server_misconfigured');
    });
  });

  describe('Validation', () => {
    it('should reject missing symbol', async () => {
      const req = createMockRequest({ side: 'buy' });
      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error?.code).toBe('invalid_body');
    });

    it('should reject invalid symbol length', async () => {
      const req = createMockRequest({ symbol: 'VERYLONGSYMBOL' });
      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject invalid side', async () => {
      const req = createMockRequest({ symbol: 'AAPL', side: 'invalid' });
      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject invalid mode', async () => {
      const req = createMockRequest({ symbol: 'AAPL', mode: 'invalid' });
      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject negative dollars', async () => {
      const req = createMockRequest({ symbol: 'AAPL', dollars: -10 });
      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject negative shares', async () => {
      const req = createMockRequest({ symbol: 'AAPL', shares: -5 });
      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject shares mode without shares', async () => {
      const req = createMockRequest({ symbol: 'AAPL', mode: 'shares', shares: 0 });
      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error?.message).toContain('shares > 0');
    });

    it('should reject dollars mode without dollars', async () => {
      const req = createMockRequest({ symbol: 'AAPL', mode: 'dollars', dollars: 0 });
      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error?.message).toContain('dollars > 0');
    });

    it('should enforce notional cap', async () => {
      const req = createMockRequest({ symbol: 'AAPL', mode: 'dollars', dollars: 100 });
      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error?.message).toContain('max notional cap');
    });

    it('should uppercase symbol', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      });

      const req = createMockRequest({ symbol: 'aapl', mode: 'dollars', dollars: 10 });
      await POST(req);

      expect(global.fetch).toHaveBeenCalledWith(
        mockWorkerUrl,
        expect.objectContaining({
          body: expect.stringContaining('"symbol":"AAPL"')
        })
      );
    });
  });

  describe('Worker Communication', () => {
    it('should return error when worker URL not configured', async () => {
      delete process.env.OPTR_WORKER_URL;
      const req = createMockRequest({ symbol: 'AAPL', mode: 'dollars', dollars: 10 });
      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error?.code).toBe('server_misconfigured');
    });

    it('should forward valid request to worker', async () => {
      const mockWorkerResponse = {
        success: true,
        symbol: 'AAPL',
        side: 'buy',
        mode: 'dollars',
        shares_executed: 0.05,
        dollars_executed: 10,
        order_id: 'order-123',
        filled_price: 200
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockWorkerResponse
      });

      const req = createMockRequest({ symbol: 'AAPL', mode: 'dollars', dollars: 10 });
      const response = await POST(req);
      const data = await response.json();

      expect(global.fetch).toHaveBeenCalledWith(
        mockWorkerUrl,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-optr-admin-key': mockAdminKey
          })
        })
      );

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockWorkerResponse);
      expect(data.rid).toBeDefined();
    });

    it('should handle worker errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid symbol' })
      });

      const req = createMockRequest({ symbol: 'INVALID', mode: 'dollars', dollars: 10 });
      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should handle worker unreachable', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Connection refused'));

      const req = createMockRequest({ symbol: 'AAPL', mode: 'dollars', dollars: 10 });
      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error?.code).toBe('worker_unreachable');
    });
  });

  describe('Request ID Handling', () => {
    it('should use x-request-id header if provided', async () => {
      const requestId = 'custom-req-id';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      });

      const req = createMockRequest(
        { symbol: 'AAPL', mode: 'dollars', dollars: 10 },
        { 'x-request-id': requestId }
      );
      const response = await POST(req);
      const data = await response.json();

      expect(data.rid).toBe(requestId);
      expect(global.fetch).toHaveBeenCalledWith(
        mockWorkerUrl,
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-request-id': requestId
          })
        })
      );
    });

    it('should generate request ID if not provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      });

      const req = createMockRequest({ symbol: 'AAPL', mode: 'dollars', dollars: 10 });
      const response = await POST(req);
      const data = await response.json();

      expect(data.rid).toBeDefined();
      expect(typeof data.rid).toBe('string');
    });
  });

  describe('Defaults', () => {
    it('should apply default values', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      });

      const req = createMockRequest({ symbol: 'AAPL', dollars: 10 });
      await POST(req);

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.side).toBe('buy');
      expect(callBody.mode).toBe('auto');
      expect(callBody.min_dollars).toBe(1);
    });
  });
});
