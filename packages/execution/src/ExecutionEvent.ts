import { ExecutionState } from "./ExecutionState";
import { ExecutionPhase } from "./ExecutionPhase";
import { TransitionAuthority } from "./TransitionAuthority";

export interface ExecutionEvent {
  executionId: string;
  tenantId: string;
  timestamp: string;

  phase: ExecutionPhase;
  previousState: ExecutionState | null;
  currentState: ExecutionState;

  authority: TransitionAuthority;

  message: string;
  metadata?: Record<string, any>;

  progress?: {
    current: number;
    total: number;
    unit: string;
  };

  policyReason?: string;
  policyRule?: string;

  capabilityGap?: {
    missing: string;
    setupUrl: string;
  };

  humanApproval?: {
    required: boolean;
    grantedBy?: string;
    grantedAt?: string;
  };

  artifacts?: Array<{
    type: string;
    url: string;
    metadata?: Record<string, any>;
  }>;
}
