export interface T2VDelta {
  id: string;
  accountId: string;
  baselineValue: number;
  improvedValue?: number;
  improvedCapturedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export const t2vStore: T2VDelta[] = [];

// Counter object to allow mutation
export const t2vCounter = { value: 1 };
