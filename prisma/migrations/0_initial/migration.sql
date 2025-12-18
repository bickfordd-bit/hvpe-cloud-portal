-- CreateTable Ledger (append-only event log for PROMPTS_EQUALS_STORAGE axiom)
CREATE TABLE "Ledger" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "prevHash" TEXT,
    "lockedAt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex for Ledger lookups
CREATE INDEX "Ledger_tenant_idx" ON "Ledger"("tenant");
CREATE INDEX "Ledger_command_idx" ON "Ledger"("command");
CREATE INDEX "Ledger_eventType_idx" ON "Ledger"("eventType");
CREATE INDEX "Ledger_createdAt_idx" ON "Ledger"("createdAt");
CREATE INDEX "Ledger_hash_idx" ON "Ledger"("hash");
CREATE INDEX "Ledger_prevHash_idx" ON "Ledger"("prevHash");

-- Unique constraint on hash (tamper evidence)
CREATE UNIQUE INDEX "Ledger_hash_key" ON "Ledger"("hash");
