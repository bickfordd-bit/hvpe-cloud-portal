export type Phase = 'I' | 'D' | 'M' | 'V' | 'O' | 'S' | 'HALT';

export type Blocker = { code: string; detail: string };

export interface OPTRState {
  stage: 'idle' | 'ingestion' | 'embeddings' | 'retrieval' | 'scoring' | 'completed' | 'error';
  progress: number;
  message?: string;
}

export type DocumentRef = {
  id: string;
  type: 'pdf' | 'docx' | 'html' | 'text';
  sha256: string;
  filename: string;
};

export type Opportunity = {
  id: string;
  source: string;
  title: string;
  agency: string;
  naics?: string;
  psc?: string;
  deadline_iso: string;
  links: string[];
  documents: DocumentRef[];
};

export interface Trace {
  timestamp: string;
  stage: string;
  status: 'started' | 'completed' | 'failed';
  message: string;
  metadata?: Record<string, unknown>;
}

export interface Requirement {
  id: string;
  text: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ScoredRequirement extends Requirement {
  score: number;
  status: 'met' | 'partial' | 'gap';
  matchedDocuments: string[];
  explanation?: string;
}

export type RunResult = {
  success: boolean;
  opportunityId: string;
  traces: Trace[];
  summary: {
    totalRequirements: number;
    averageScore: number;
    coverage: number;
    executionTimeMs: number;
  };
  requirements: ScoredRequirement[];
  error?: string;
};

export interface ScoredDocument {
  id: string;
  text: string;
  score: number;
  metadata?: Record<string, unknown>;
}
