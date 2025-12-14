/**
 * Mathematical representation of the DE Features workbook
 * Based on the formula: 𝒲 = ⟨ℱ,𝒥,D,C,L,S,M⟩
 */

/**
 * Feature Set ℱ = {f₁,...,f₂₀}
 * The 20 key DE features from the workbook
 */
export type FeatureId = `f${number}`;

export interface DEFeature {
  id: FeatureId;
  index: number; // 1-20
  description: string; // D(f): Feature → Description
}

/**
 * Choice Index Set 𝒥 = {1,2,...,13}
 * The 13 feature-choice columns
 */
export type ChoiceIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

/**
 * Feature Choice Function C: ℱ × 𝒥 → Σ* ∪ {∅}
 * Returns feature choice text for (feature, choice) pair
 */
export type FeatureChoiceMap = Map<string, string | null>; // Key: "f{i}_c{j}"

/**
 * SOW/PWS Language Function L: ℱ × 𝒥 → Σ* ∪ {∅}
 * Returns example contract language for (feature, choice) pair
 */
export type ContractLanguageMap = Map<string, string | null>; // Key: "f{i}_c{j}"

/**
 * Standards Relation S ⊆ ℱ × Σ* × Σ* × Σ*
 * Tuple: (feature, description, standard, notes)
 */
export interface StandardsTuple {
  feature: FeatureId;
  description: string;
  standard: string;
  notes: string;
}

/**
 * Metrics Mapping Relation M ⊆ Σ* × Σ* × Σ* × ℱ
 * Tuple: (thread, subthread, metric, feature)
 */
export interface MetricsTuple {
  thread: string;
  subthread: string;
  metric: string;
  feature: FeatureId;
}

/**
 * Complete Workbook Structure 𝒲 = ⟨ℱ,𝒥,D,C,L,S,M⟩
 */
export interface DEFeaturesWorkbook {
  // Feature set ℱ
  features: DEFeature[]; // |ℱ| = 20
  
  // Choice index set 𝒥
  choiceIndices: ChoiceIndex[]; // [1,2,...,13]
  
  // Description function D: ℱ → Σ*
  descriptions: Map<FeatureId, string>;
  
  // Feature choice function C: ℱ × 𝒥 → Σ* ∪ {∅}
  choices: FeatureChoiceMap;
  
  // Contract language function L: ℱ × 𝒥 → Σ* ∪ {∅}
  contractLanguage: ContractLanguageMap;
  
  // Standards relation S
  standards: StandardsTuple[]; // |S| = 20
  
  // Metrics mapping relation M
  metrics: MetricsTuple[]; // |M| = 18
  
  // Metadata
  version: string;
  lastUpdated: string;
}

/**
 * Cell-based representation (lossless)
 * 𝒲 = ⋃_{s∈𝒮} {(s,r,c,v_{s,r,c})}
 */
export type SheetName = 'Step1' | 'Step2' | 'Standards' | 'Metrics';

export interface WorkbookCell {
  sheet: SheetName;
  row: number;
  col: number;
  value: string | number | null;
}

export type WorkbookCellSet = WorkbookCell[];

/**
 * Query result for feature matching
 */
export interface FeatureMatchResult {
  feature: DEFeature;
  relevanceScore: number; // 0-1
  matchedChoices: Array<{
    choiceIndex: ChoiceIndex;
    choiceText: string;
    contractLanguage: string | null;
    score: number;
  }>;
  applicableStandards: StandardsTuple[];
  relatedMetrics: MetricsTuple[];
}

/**
 * OPTR integration result
 */
export interface DEFeatureAnalysisResult {
  opportunityId: string;
  extractedRequirements: string[];
  matchedFeatures: FeatureMatchResult[];
  coverageScore: number; // 0-100
  gaps: Array<{
    requirement: string;
    reason: string;
    suggestedFeatures: FeatureId[];
  }>;
  timestamp: string;
}
