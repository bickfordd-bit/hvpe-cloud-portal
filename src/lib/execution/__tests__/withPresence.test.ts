/**
 * Execution Presence Wrapper Tests
 */

import { executeWithPresence } from "../withPresence";

// Mock uuid
jest.mock("uuid", () => ({
  v4: jest.fn(() => "test-uuid-123"),
}));

// Mock console.log to capture ledger entries
const originalLog = console.log;
let mockLogs: any[] = [];

beforeEach(() => {
  mockLogs = [];
  console.log = jest.fn((...args) => {
    if (args[0] === "[LEDGER]") {
      mockLogs.push(JSON.parse(args[1]));
    }
  });
  // @ts-ignore - Allow setting NODE_ENV in tests
  process.env.NODE_ENV = "development";
});

afterEach(() => {
  console.log = originalLog;
});

describe("executeWithPresence", () => {
  it("should generate execution_id and log start/success", async () => {
    const mockAction = jest.fn().mockResolvedValue("success");

    const result = await executeWithPresence({
      tenant_id: "test-tenant",
      intent: "test_action",
      action: mockAction,
    });

    expect(result).toBe("success");
    expect(mockAction).toHaveBeenCalledTimes(1);
    expect(mockLogs).toHaveLength(2);

    // Check started entry
    const startEntry = mockLogs[0];
    expect(startEntry.type).toBe("execution.started");
    expect(startEntry.tenant_id).toBe("test-tenant");
    expect(startEntry.data.intent).toBe("test_action");
    expect(startEntry.execution_id).toBeDefined();
    expect(startEntry.data.started_at).toBeDefined();

    // Check succeeded entry
    const successEntry = mockLogs[1];
    expect(successEntry.type).toBe("execution.succeeded");
    expect(successEntry.tenant_id).toBe("test-tenant");
    expect(successEntry.data.intent).toBe("test_action");
    expect(successEntry.execution_id).toBe(startEntry.execution_id);
    expect(successEntry.data.completed_at).toBeDefined();
  });

  it("should log failure and re-throw errors", async () => {
    const mockError = new Error("Test error");
    const mockAction = jest.fn().mockRejectedValue(mockError);

    await expect(
      executeWithPresence({
        tenant_id: "test-tenant",
        intent: "test_action_fail",
        action: mockAction,
      })
    ).rejects.toThrow("Test error");

    expect(mockAction).toHaveBeenCalledTimes(1);
    expect(mockLogs).toHaveLength(2);

    // Check started entry
    const startEntry = mockLogs[0];
    expect(startEntry.type).toBe("execution.started");
    expect(startEntry.tenant_id).toBe("test-tenant");
    expect(startEntry.data.intent).toBe("test_action_fail");

    // Check failed entry
    const failedEntry = mockLogs[1];
    expect(failedEntry.type).toBe("execution.failed");
    expect(failedEntry.tenant_id).toBe("test-tenant");
    expect(failedEntry.data.intent).toBe("test_action_fail");
    expect(failedEntry.data.error).toBe("Test error");
    expect(failedEntry.data.failed_at).toBeDefined();
    expect(failedEntry.execution_id).toBe(startEntry.execution_id);
  });

  it("should use same execution_id across all log entries", async () => {
    const mockAction = jest.fn().mockResolvedValue("data");

    await executeWithPresence({
      tenant_id: "tenant-123",
      intent: "fetch_data",
      action: mockAction,
    });

    expect(mockLogs).toHaveLength(2);
    const executionId = mockLogs[0].execution_id;
    expect(executionId).toBeDefined();
    expect(typeof executionId).toBe("string");
    expect(executionId.length).toBeGreaterThan(0);

    // All entries should share the same execution_id
    expect(mockLogs[1].execution_id).toBe(executionId);
  });

  it("should not log in production mode", async () => {
    // @ts-ignore - Allow setting NODE_ENV in tests
    process.env.NODE_ENV = "production";
    const mockAction = jest.fn().mockResolvedValue("result");

    await executeWithPresence({
      tenant_id: "prod-tenant",
      intent: "prod_action",
      action: mockAction,
    });

    // console.log should not be called for ledger entries in production
    expect(mockLogs).toHaveLength(0);
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it("should preserve return type of wrapped action", async () => {
    const complexResult = {
      data: { id: 1, name: "Test" },
      meta: { count: 100 },
    };
    const mockAction = jest.fn().mockResolvedValue(complexResult);

    const result = await executeWithPresence({
      tenant_id: "tenant",
      intent: "fetch_complex",
      action: mockAction,
    });

    expect(result).toEqual(complexResult);
    expect((result as any).data.id).toBe(1);
    expect((result as any).meta.count).toBe(100);
  });

  it("should handle multiple concurrent executions with unique IDs", async () => {
    // Reset uuid mock to generate different IDs
    const { v4 } = require("uuid");
    let callCount = 0;
    (v4 as jest.Mock).mockImplementation(() => `test-uuid-${++callCount}`);

    const action1 = jest.fn().mockResolvedValue("result1");
    const action2 = jest.fn().mockResolvedValue("result2");

    const [result1, result2] = await Promise.all([
      executeWithPresence({
        tenant_id: "tenant1",
        intent: "action1",
        action: action1,
      }),
      executeWithPresence({
        tenant_id: "tenant2",
        intent: "action2",
        action: action2,
      }),
    ]);

    expect(result1).toBe("result1");
    expect(result2).toBe("result2");
    expect(mockLogs).toHaveLength(4); // 2 starts + 2 successes

    // Extract all execution_ids
    const executionIds = mockLogs.map((log) => log.execution_id);
    const uniqueIds = new Set(executionIds);
    
    // Should have exactly 2 unique execution IDs (one per execution)
    expect(uniqueIds.size).toBe(2);
    
    // Restore mock for other tests
    (v4 as jest.Mock).mockImplementation(() => "test-uuid-123");
  });
});
