import * as XLSX from 'xlsx';
import type {
  DEFeaturesWorkbook,
  DEFeature,
  FeatureId,
  ChoiceIndex,
  StandardsTuple,
  MetricsTuple,
  WorkbookCellSet,
  WorkbookCell,
  SheetName,
} from './types';
import { logger } from '@/lib/logger';

/**
 * Parse Excel workbook into mathematical object 𝒲
 */
export class DEFeaturesParser {
  /**
   * Parse Excel file buffer into structured workbook object
   */
  static parseWorkbook(buffer: Buffer): DEFeaturesWorkbook {
    logger.info('Parsing DE Features workbook');

    const workbook = XLSX.read(buffer, { type: 'buffer' });

    // Extract each sheet
    const step1Sheet = workbook.Sheets['Step 1 DE Feature Selection'];
    const step2Sheet = workbook.Sheets['Step 2 Example SOW,PWS Language'];
    const standardsSheet = workbook.Sheets['Standards'];
    const metricsSheet = workbook.Sheets['Metrics Map'];

    if (!step1Sheet || !step2Sheet || !standardsSheet || !metricsSheet) {
      throw new Error('Missing required sheets in workbook');
    }

    // Parse features ℱ (20 features)
    const features = this.parseFeatures(step1Sheet);

    // Parse choices C: ℱ × 𝒥 → Σ*
    const choices = this.parseChoices(step1Sheet, features);

    // Parse contract language L: ℱ × 𝒥 → Σ*
    const contractLanguage = this.parseContractLanguage(step2Sheet, features);

    // Parse standards relation S
    const standards = this.parseStandards(standardsSheet, features);

    // Parse metrics mapping M
    const metrics = this.parseMetrics(metricsSheet, features);

    // Build description function D: ℱ → Σ*
    const descriptions = new Map<FeatureId, string>(features.map((f) => [f.id, f.description]));

    const result: DEFeaturesWorkbook = {
      features,
      choiceIndices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      descriptions,
      choices,
      contractLanguage,
      standards,
      metrics,
      version: '25Oct2021_003',
      lastUpdated: new Date().toISOString(),
    };

    logger.info('Workbook parsed successfully', {
      featureCount: features.length,
      choiceCount: choices.size,
      standardsCount: standards.length,
      metricsCount: metrics.length,
    });

    return result;
  }

  /**
   * Parse feature set ℱ from Step 1 sheet
   */
  private static parseFeatures(sheet: XLSX.WorkSheet): DEFeature[] {
    const features: DEFeature[] = [];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

    // Assuming features are in rows 2-21 (after header)
    for (let i = 1; i <= 20; i++) {
      const row = json[i];
      if (!row) continue;

      const description = String(row[0] || '').trim(); // Column A
      if (!description) continue;

      features.push({
        id: `f${i}` as FeatureId,
        index: i,
        description,
      });
    }

    return features;
  }

  /**
   * Parse feature choices C: ℱ × 𝒥 → Σ*
   */
  private static parseChoices(
    sheet: XLSX.WorkSheet,
    features: DEFeature[]
  ): Map<string, string | null> {
    const choices = new Map<string, string | null>();
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

    // Choices are in columns B-N (indices 1-13)
    for (let i = 0; i < features.length; i++) {
      const row = json[i + 1]; // +1 for header
      if (!row) continue;

      const feature = features[i];

      for (let j = 1; j <= 13; j++) {
        const value = row[j]; // Column B=1, C=2, etc.
        const key = `${feature.id}_c${j}`;
        choices.set(key, value ? String(value).trim() : null);
      }
    }

    return choices;
  }

  /**
   * Parse contract language L: ℱ × 𝒥 → Σ*
   */
  private static parseContractLanguage(
    sheet: XLSX.WorkSheet,
    features: DEFeature[]
  ): Map<string, string | null> {
    const language = new Map<string, string | null>();
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

    // Same structure as choices sheet
    for (let i = 0; i < features.length; i++) {
      const row = json[i + 1];
      if (!row) continue;

      const feature = features[i];

      for (let j = 1; j <= 13; j++) {
        const value = row[j];
        const key = `${feature.id}_c${j}`;
        language.set(key, value ? String(value).trim() : null);
      }
    }

    return language;
  }

  /**
   * Parse standards relation S ⊆ ℱ × Σ* × Σ* × Σ*
   */
  private static parseStandards(sheet: XLSX.WorkSheet, features: DEFeature[]): StandardsTuple[] {
    const standards: StandardsTuple[] = [];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

    // Assuming columns: Feature | Description | Standard | Notes
    for (let i = 1; i < json.length; i++) {
      const row = json[i];
      if (!row || !row[0]) continue;

      const featureIdx = Number(row[0]);
      if (isNaN(featureIdx) || featureIdx < 1 || featureIdx > 20) continue;

      standards.push({
        feature: `f${featureIdx}` as FeatureId,
        description: String(row[1] || '').trim(),
        standard: String(row[2] || '').trim(),
        notes: String(row[3] || '').trim(),
      });
    }

    return standards;
  }

  /**
   * Parse metrics mapping M ⊆ Σ* × Σ* × Σ* × ℱ
   */
  private static parseMetrics(sheet: XLSX.WorkSheet, features: DEFeature[]): MetricsTuple[] {
    const metrics: MetricsTuple[] = [];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

    // Assuming columns: Thread | Subthread | Metric | Key DE Feature
    for (let i = 1; i < json.length; i++) {
      const row = json[i];
      if (!row || !row[3]) continue; // Skip if no feature mapping

      const featureIdx = Number(row[3]);
      if (isNaN(featureIdx) || featureIdx < 1 || featureIdx > 20) continue;

      metrics.push({
        thread: String(row[0] || '').trim(),
        subthread: String(row[1] || '').trim(),
        metric: String(row[2] || '').trim(),
        feature: `f${featureIdx}` as FeatureId,
      });
    }

    return metrics;
  }

  /**
   * Convert to lossless cell-set representation
   * 𝒲 = ⋃_{s∈𝒮} {(s,r,c,v_{s,r,c})}
   */
  static toWorkbookCellSet(buffer: Buffer): WorkbookCellSet {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const cells: WorkbookCell[] = [];

    const sheetMappings: Record<string, SheetName> = {
      'Step 1 DE Feature Selection': 'Step1',
      'Step 2 Example SOW,PWS Language': 'Step2',
      Standards: 'Standards',
      'Metrics Map': 'Metrics',
    };

    for (const [sheetName, mappedName] of Object.entries(sheetMappings)) {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) continue;

      const json = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null }) as unknown[][];

      for (let r = 0; r < json.length; r++) {
        const row = json[r];
        for (let c = 0; c < row.length; c++) {
          cells.push({
            sheet: mappedName,
            row: r,
            col: c,
            value: row[c] as string | number | null,
          });
        }
      }
    }

    return cells;
  }

  /**
   * Query functions for mathematical operations
   */

  // C(f, j): Get feature choice
  static getChoice(
    workbook: DEFeaturesWorkbook,
    featureId: FeatureId,
    choiceIndex: ChoiceIndex
  ): string | null {
    return workbook.choices.get(`${featureId}_c${choiceIndex}`) || null;
  }

  // L(f, j): Get contract language
  static getContractLanguage(
    workbook: DEFeaturesWorkbook,
    featureId: FeatureId,
    choiceIndex: ChoiceIndex
  ): string | null {
    return workbook.contractLanguage.get(`${featureId}_c${choiceIndex}`) || null;
  }

  // D(f): Get feature description
  static getDescription(workbook: DEFeaturesWorkbook, featureId: FeatureId): string | null {
    return workbook.descriptions.get(featureId) || null;
  }

  // Get standards for feature
  static getStandards(workbook: DEFeaturesWorkbook, featureId: FeatureId): StandardsTuple[] {
    return workbook.standards.filter((s) => s.feature === featureId);
  }

  // Get metrics for feature
  static getMetrics(workbook: DEFeaturesWorkbook, featureId: FeatureId): MetricsTuple[] {
    return workbook.metrics.filter((m) => m.feature === featureId);
  }
}
