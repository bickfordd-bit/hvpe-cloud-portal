export interface DefensibilitySnapshot {
  id: string;
  accountId: string;
  dataExclusivity: number;
  workflowLockIn: number;
  autonomousExecution: number;
  switchingCost: number;
  score: number;
  multiple: number;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export const defensibilityStore: DefensibilitySnapshot[] = [];

// Counter object to allow mutation
export const defensibilityCounter = { value: 1 };
