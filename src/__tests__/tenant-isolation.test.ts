import { describe, it, expect, beforeAll } from "@jest/globals";
import { prisma } from "@/lib/prisma";

/**
 * Tenant Isolation Security Tests
 *
 * These tests prove that tenant boundaries are enforced at API boundaries.
 * If any of these tests fail, it indicates a SECURITY VULNERABILITY.
 */

describe("Tenant Isolation (Security)", () => {
  let billyArtifactId: string;
  let penelopeArtifactId: string;
  let billyExecutionId: string;
  let penelopeExecutionId: string;

  beforeAll(async () => {
    // Seed test data with tenant boundaries
    const billyEntry = await prisma.ledgerEntry.create({
      data: {
        data: {
          tenantId: "billy",
          executionId: "exec-billy-001",
          artifacts: [{ type: "pr", url: "https://github.com/billy/pr/1" }],
        },
      },
    });
    billyArtifactId = billyEntry.id;
    billyExecutionId = "exec-billy-001";

    const penelopeEntry = await prisma.ledgerEntry.create({
      data: {
        data: {
          tenantId: "penelope",
          executionId: "exec-penelope-001",
          artifacts: [
            {
              type: "movie",
              url: "https://cdn.example.com/penelope/movie.mp4",
            },
          ],
        },
      },
    });
    penelopeArtifactId = penelopeEntry.id;
    penelopeExecutionId = "exec-penelope-001";
  });

  describe("Artifact Route Isolation", () => {
    it("denies cross-tenant artifact access (billy → penelope)", async () => {
      const response = await fetch(
        `http://localhost:3000/api/artifacts/${penelopeArtifactId}`,
        {
          headers: { "x-bickford-tenant": "billy" },
        },
      );

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.error).toContain("Forbidden");
    });

    it("denies cross-tenant artifact access (penelope → billy)", async () => {
      const response = await fetch(
        `http://localhost:3000/api/artifacts/${billyArtifactId}`,
        {
          headers: { "x-bickford-tenant": "penelope" },
        },
      );

      expect(response.status).toBe(403);
    });

    it("allows same-tenant artifact access", async () => {
      const response = await fetch(
        `http://localhost:3000/api/artifacts/${billyArtifactId}`,
        {
          headers: { "x-bickford-tenant": "billy" },
        },
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.tenantId).toBe("billy");
    });
  });

  describe("Missing Tenant Hard-Fail", () => {
    it("rejects artifact requests without tenant header", async () => {
      const response = await fetch(
        `http://localhost:3000/api/artifacts/${billyArtifactId}`,
        // No x-bickford-tenant header
      );

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("rejects ledger requests without tenant header", async () => {
      const response = await fetch(`http://localhost:3000/api/ledger`);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("Ledger Listing Isolation", () => {
    it("returns only billy's entries when tenant=billy", async () => {
      const response = await fetch(`http://localhost:3000/api/ledger`, {
        headers: { "x-bickford-tenant": "billy" },
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.tenantId).toBe("billy");

      // All returned entries must belong to billy
      const allBilly = body.entries.every(
        (e: any) => e.data?.tenantId === "billy",
      );
      expect(allBilly).toBe(true);
    });

    it("returns only penelope's entries when tenant=penelope", async () => {
      const response = await fetch(`http://localhost:3000/api/ledger`, {
        headers: { "x-bickford-tenant": "penelope" },
      });

      expect(response.status).toBe(200);
      const body = await response.json();

      const allPenelope = body.entries.every(
        (e: any) => e.data?.tenantId === "penelope",
      );
      expect(allPenelope).toBe(true);
    });
  });

  describe("SSE Stream Isolation", () => {
    it("denies cross-tenant execution stream access", async () => {
      const response = await fetch(
        `http://localhost:3000/api/executions/${penelopeExecutionId}/stream`,
        {
          headers: { "x-bickford-tenant": "billy" },
        },
      );

      expect(response.status).toBe(403);
    });

    it("allows same-tenant execution stream access", async () => {
      const response = await fetch(
        `http://localhost:3000/api/executions/${billyExecutionId}/stream`,
        {
          headers: { "x-bickford-tenant": "billy" },
        },
      );

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toBe("text/event-stream");
    });
  });
});
