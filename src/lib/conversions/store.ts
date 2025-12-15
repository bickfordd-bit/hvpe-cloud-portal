export interface ConversionEvent {
  id: string;
  accountId: string;
  eventType: string;
  value: number;
  notes?: string;
  confidence?: number;
  metadata?: Record<string, unknown>;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export const conversionStore: ConversionEvent[] = [];

// Counter object to allow mutation
export const conversionCounter = { value: 1 };
