/**
 * Statistical utilities for OPTR scoring confidence intervals
 * Inspired by quantitative finance risk models
 */

export interface ConfidenceInterval {
  mean: number;
  stdDev: number;
  lower: number;
  upper: number;
  confidence: number;
}

/**
 * Calculate 95% confidence interval using Student's t-distribution
 * Used to express uncertainty in requirement scores
 */
export function calculateConfidenceInterval(
  scores: number[],
  confidenceLevel = 0.95
): ConfidenceInterval {
  if (scores.length === 0) {
    throw new Error('Cannot calculate confidence interval for empty array');
  }

  const n = scores.length;
  const mean = scores.reduce((sum, x) => sum + x, 0) / n;
  
  const variance = scores.reduce((sum, x) => sum + (x - mean) ** 2, 0) / (n - 1);
  const stdDev = Math.sqrt(variance);
  
  // t-value for 95% confidence (approximation for n > 30)
  const tValue = n > 30 ? 1.96 : getTValue(n, confidenceLevel);
  const marginOfError = tValue * (stdDev / Math.sqrt(n));

  return {
    mean,
    stdDev,
    lower: Math.max(0, mean - marginOfError),
    upper: Math.min(100, mean + marginOfError),
    confidence: confidenceLevel,
  };
}

/**
 * Approximate t-values for small samples
 */
function getTValue(n: number, confidence: number): number {
  // Simplified lookup table for common confidence levels
  if (confidence === 0.95) {
    if (n <= 5) return 2.776;
    if (n <= 10) return 2.262;
    if (n <= 20) return 2.093;
    return 2.042;
  }
  return 1.96; // Default to z-score
}

/**
 * Calculate Sharpe-like ratio for requirement quality
 * Higher = more confident prediction
 */
export function calculateQualityScore(scores: number[]): number {
  if (scores.length < 2) return 0;
  
  const mean = scores.reduce((sum, x) => sum + x, 0) / scores.length;
  const variance = scores.reduce((sum, x) => sum + (x - mean) ** 2, 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  
  // Return mean/stdDev (like Sharpe ratio: return/volatility)
  return stdDev === 0 ? mean : mean / stdDev;
}

/**
 * Detect outliers using Interquartile Range (IQR) method
 * Used to flag suspiciously high/low scores
 */
export function detectOutliers(scores: number[]): {
  outliers: number[];
  threshold: { lower: number; upper: number };
} {
  const sorted = [...scores].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  const outliers = scores.filter(x => x < lowerBound || x > upperBound);
  
  return {
    outliers,
    threshold: { lower: lowerBound, upper: upperBound },
  };
}
