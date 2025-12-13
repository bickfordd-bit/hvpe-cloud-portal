export type Phase = "I" | "D" | "M" | "V" | "O" | "S" | "HALT";

export type Blocker = { code: string; detail: string };

export type OPTRState = {
  phase: Phase;
  blocked: boolean;
  blockers: Blocker[];
  coverage: number; // 0..1
  win_prob: number; // 0..1
  ecv: number; // $
};

export type DocumentRef = {
  id: string;
  type: "pdf" | "docx" | "html" | "text";
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

export type Requirement = {
  id: string;
  section: string;
  text: string;
  kind: "shall" | "must" | "should" | "may";
  priority: number;
};

export type Trace = {
  req_id: string;
  response_id: string;
  evidence_doc_ids: string[];
  evidence_snippets?: string[];
  confidence: number; // 0..1
  gaps: string[];
};

export type RunResult = {
  state: OPTRState;
  requirements: Requirement[];
  traces: Trace[];
  package: { id: string; url: string; filename: string };
};
