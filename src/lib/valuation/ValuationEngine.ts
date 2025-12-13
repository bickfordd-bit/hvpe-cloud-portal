import type { BillionairePerson } from "@/lib/hvpeDashboardData";

export interface ValuationInputs {
  ipPortfolio: BillionairePerson[];
  marketPosition: 'emerging' | 'established' | 'leader';
  growthRate: number; // Annual growth rate as decimal
  riskFactor: number; // 0-1, lower is better
  timeHorizon: number; // Years
}

export interface ValuationResult {
  totalIPValue: number;
  discountedCashFlow: number;
  marketMultiples: number;
  riskAdjustedValue: number;
  finalValuation: number;
  confidence: number;
  assumptions: string[];
  breakdown: {
    ipValue: number;
    growthValue: number;
    marketPremium: number;
    riskDiscount: number;
  };
}

export class ValuationEngine {
  /**
   * Run comprehensive valuation of Bickford Technologies
   */
  static async runValuation(inputs: ValuationInputs): Promise<ValuationResult> {
    const totalIPValue = inputs.ipPortfolio
      .filter(p => p.ipCreated)
      .reduce((sum, p) => sum + p.ipValue, 0);

    // DCF Valuation
    const dcfValue = this.calculateDCF(totalIPValue, inputs.growthRate, inputs.timeHorizon, inputs.riskFactor);

    // Market Multiples Approach
    const marketValue = this.calculateMarketMultiples(totalIPValue, inputs.marketPosition);

    // Risk-adjusted final valuation
    const riskAdjustedValue = (dcfValue * 0.6 + marketValue * 0.4) * (1 - inputs.riskFactor * 0.2);

    // Calculate confidence based on data completeness
    const ipCompleteness = inputs.ipPortfolio.filter(p => p.ipCreated).length / inputs.ipPortfolio.length;
    const confidence = Math.min(0.95, ipCompleteness * 0.8 + 0.15); // Max 95% confidence

    const breakdown = {
      ipValue: totalIPValue,
      growthValue: dcfValue - totalIPValue,
      marketPremium: marketValue - totalIPValue,
      riskDiscount: (dcfValue * 0.6 + marketValue * 0.4) * (inputs.riskFactor * 0.2)
    };

    return {
      totalIPValue,
      discountedCashFlow: dcfValue,
      marketMultiples: marketValue,
      riskAdjustedValue,
      finalValuation: riskAdjustedValue,
      confidence,
      assumptions: this.generateAssumptions(inputs),
      breakdown
    };
  }

  /**
   * Calculate Discounted Cash Flow valuation
   */
  private static calculateDCF(
    currentValue: number,
    growthRate: number,
    timeHorizon: number,
    riskFactor: number
  ): number {
    const discountRate = 0.12 + (riskFactor * 0.08); // 12-20% discount rate based on risk
    let dcfValue = 0;
    let cashFlow = currentValue * 0.1; // Assume 10% annual cash flow yield initially

    for (let year = 1; year <= timeHorizon; year++) {
      cashFlow *= (1 + growthRate);
      dcfValue += cashFlow / Math.pow(1 + discountRate, year);
    }

    // Add terminal value
    const terminalValue = cashFlow * (1 + growthRate) / (discountRate - growthRate);
    dcfValue += terminalValue / Math.pow(1 + discountRate, timeHorizon);

    return dcfValue;
  }

  /**
   * Calculate market multiples valuation
   */
  private static calculateMarketMultiples(
    ipValue: number,
    marketPosition: ValuationInputs['marketPosition']
  ): number {
    const multiples = {
      emerging: 8,
      established: 12,
      leader: 18
    };

    return ipValue * multiples[marketPosition];
  }

  /**
   * Generate valuation assumptions
   */
  private static generateAssumptions(inputs: ValuationInputs): string[] {
    return [
      `IP Portfolio Value: $${inputs.ipPortfolio
        .filter(p => p.ipCreated)
        .reduce((sum, p) => sum + p.ipValue, 0)
        .toLocaleString()}`,
      `Annual Growth Rate: ${(inputs.growthRate * 100).toFixed(1)}%`,
      `Market Position: ${inputs.marketPosition.charAt(0).toUpperCase() + inputs.marketPosition.slice(1)}`,
      `Risk Factor: ${(inputs.riskFactor * 100).toFixed(0)}%`,
      `Time Horizon: ${inputs.timeHorizon} years`,
      `Valuation Methodology: 60% DCF + 40% Market Multiples`,
      `Discount Rate Range: 12-20% (based on risk factor)`,
      `Terminal Growth Rate: Assumed equal to long-term growth rate`
    ];
  }

  /**
   * Get default valuation inputs based on current data
   */
  static getDefaultInputs(ipPortfolio: BillionairePerson[]): ValuationInputs {
    const sellableIP = ipPortfolio.filter(p => p.ipCreated);
    const avgTimeline = sellableIP.length > 0
      ? sellableIP.reduce((sum, p) => {
          const days = Math.ceil((new Date(p.saleTimeline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return sum + Math.max(0, days / 365);
        }, 0) / sellableIP.length
      : 3;

    return {
      ipPortfolio,
      marketPosition: 'emerging', // Can be upgraded based on achievements
      growthRate: 0.25, // 25% annual growth
      riskFactor: 0.3, // 30% risk factor
      timeHorizon: Math.max(5, Math.ceil(avgTimeline))
    };
  }

  /**
   * Run sensitivity analysis
   */
  static runSensitivityAnalysis(baseInputs: ValuationInputs): ValuationResult[] {
    const scenarios = [
      { ...baseInputs, growthRate: baseInputs.growthRate * 0.8, label: 'Conservative Growth' },
      { ...baseInputs, growthRate: baseInputs.growthRate * 1.2, label: 'Optimistic Growth' },
      { ...baseInputs, riskFactor: Math.min(0.9, baseInputs.riskFactor * 1.5), label: 'High Risk' },
      { ...baseInputs, riskFactor: baseInputs.riskFactor * 0.5, label: 'Low Risk' }
    ];

    return scenarios.map(scenario => ({
      ...this.runValuationSync(scenario),
      scenarioLabel: scenario.label
    })) as ValuationResult[];
  }

  /**
   * Synchronous version for sensitivity analysis
   */
  private static runValuationSync(inputs: ValuationInputs): Omit<ValuationResult, 'scenarioLabel'> {
    const totalIPValue = inputs.ipPortfolio
      .filter(p => p.ipCreated)
      .reduce((sum, p) => sum + p.ipValue, 0);

    const dcfValue = this.calculateDCF(totalIPValue, inputs.growthRate, inputs.timeHorizon, inputs.riskFactor);
    const marketValue = this.calculateMarketMultiples(totalIPValue, inputs.marketPosition);
    const riskAdjustedValue = (dcfValue * 0.6 + marketValue * 0.4) * (1 - inputs.riskFactor * 0.2);

    return {
      totalIPValue,
      discountedCashFlow: dcfValue,
      marketMultiples: marketValue,
      riskAdjustedValue,
      finalValuation: riskAdjustedValue,
      confidence: 0.85,
      assumptions: this.generateAssumptions(inputs),
      breakdown: {
        ipValue: totalIPValue,
        growthValue: dcfValue - totalIPValue,
        marketPremium: marketValue - totalIPValue,
        riskDiscount: (dcfValue * 0.6 + marketValue * 0.4) * (inputs.riskFactor * 0.2)
      }
    };
  }
}