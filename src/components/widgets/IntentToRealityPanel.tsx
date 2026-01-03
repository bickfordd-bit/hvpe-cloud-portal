'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';

/**
 * Intent to Reality Valuation Panel
 *
 * Copyright (c) 2025 Bickford Technologies LLC
 * All Rights Reserved. Patent Pending.
 *
 * This software and the methodologies contained herein are proprietary
 * intellectual property of Bickford Technologies LLC. Unauthorized use,
 * reproduction, distribution, or reverse engineering is strictly prohibited.
 *
 * CONFIDENTIAL AND PROPRIETARY
 * Protected under US Patent Law and International Copyright Conventions
 */

interface TrillionScenario {
  scenario: string;
  value: number;
  description: string;
  probability: number;
}

interface IntentToRealityData {
  valuation: {
    traditional: {
      finalValuation: number;
      dcfValue: number;
      marketValue: number;
      sensitivity: Array<{
        scenario: string;
        value: number;
      }>;
    };
    intentToReality: {
      baseValue: number;
      intentPremium: number;
      realityAcceleration: number;
      marketDominance: number;
      finalIntentValue: number;
      trillionPotential: number;
      breakdown: {
        speedValue: number;
        complexityValue: number;
        disruptionValue: number;
        velocityValue: number;
      };
    };
    enhanced: {
      traditionalValue: number;
      intentValue: number;
      enhancedValue: number;
      trillionScenarios: TrillionScenario[];
      expectedValue: number;
    };
    timestamp: string;
    company: string;
  };
}

export function IntentToRealityPanel() {
  const [data, setData] = useState<IntentToRealityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessGranted, setAccessGranted] = useState(false);
  const [usageId] = useState(() => crypto.randomUUID()); // Unique usage tracking ID

  // IP Protection: Access Control
  useEffect(() => {
    checkAccessPermissions();
  }, []);

  const checkAccessPermissions = async () => {
    try {
      // Check user authentication and permissions
      const response = await fetch('/api/auth/check-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: 'intent-to-reality-valuation',
          usageId,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setAccessGranted(result.granted);
      } else {
        setAccessGranted(false);
        setError('Access denied. This feature requires proper licensing.');
      }
    } catch (_err: unknown) {
      setAccessGranted(false);
      setError('Authentication required for valuation access.');
    }
  };

  useEffect(() => {
    if (accessGranted) {
      fetchValuation();
    }
  }, [accessGranted]);

  const fetchValuation = async () => {
    try {
      // IP Protection: Usage Tracking
      const response = await fetch('/api/valuation/intent-reality', {
        method: 'GET',
        headers: {
          'X-Usage-ID': usageId,
          'X-Feature-Access': 'intent-to-reality-valuation',
          'X-Timestamp': new Date().toISOString(),
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error('Failed to fetch valuation');
      }

      const result = await response.json();

      // IP Protection: Digital Watermarking
      const watermarkedResult = addDigitalWatermark(result, usageId);

      setData(watermarkedResult);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // IP Protection: Digital Watermarking Function
  const addDigitalWatermark = (data: IntentToRealityData, usageId: string) => {
    const watermark = {
      generatedBy: 'Bickford Technologies Intent-to-Reality Engine',
      license: 'Proprietary - All Rights Reserved',
      usageId,
      timestamp: new Date().toISOString(),
      patent: 'Patent Pending - US Provisional Patent Application Filed',
      confidentiality: 'CONFIDENTIAL - DO NOT DISTRIBUTE',
    };

    // Embed watermark in data structure
    return {
      ...data,
      _watermark: watermark,
      _integrity: generateIntegrityHash(data, watermark),
    };
  };

  // IP Protection: Integrity Verification
  const generateIntegrityHash = (
    data: IntentToRealityData,
    watermark: Record<string, string>
  ): string => {
    const payload = JSON.stringify({ data, watermark });
    // Simple hash for demonstration - in production use crypto.subtle
    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
      const char = payload.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000000) {
      return `$${(value / 1000000000000).toFixed(2)}T`;
    } else if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (!accessGranted) {
    return (
      <Card>
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="text-red-400 mb-2">Access Restricted</div>
            <div className="text-sm text-neutral-400">
              This feature requires proper licensing and authentication.
            </div>
            <div className="text-xs text-neutral-500 mt-2">
              Contact licensing@bickfordtechnologies.com for access.
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-48">
          <div className="text-neutral-400">Calculating intent-to-reality value...</div>
        </div>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <div className="flex items-center justify-center h-48">
          <div className="text-red-400">Error: {error || 'Failed to load valuation'}</div>
        </div>
      </Card>
    );
  }

  const { traditional, intentToReality, enhanced } = data.valuation;

  return (
    <Card>
      <div className="mb-6">
        <div className="text-xs uppercase tracking-[0.16em] text-neutral-500 mb-1">
          Intent to Reality Engine
        </div>
        <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">
          &ldquo;I Say It, It Appears&rdquo;
        </div>
        <div className="text-sm text-neutral-400 mt-1">
          Quantifying the power of accelerated manifestation
        </div>
      </div>

      {/* Main Value Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-lg border border-purple-500/30">
          <div className="text-xs text-purple-300 uppercase tracking-wide mb-2">
            Traditional Value
          </div>
          <div className="text-2xl font-bold text-purple-200">
            {formatCurrency(traditional.finalValuation)}
          </div>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-pink-900/50 to-pink-800/30 rounded-lg border border-pink-500/30">
          <div className="text-xs text-pink-300 uppercase tracking-wide mb-2">Intent Premium</div>
          <div className="text-2xl font-bold text-pink-200">
            +{formatCurrency(intentToReality.intentPremium)}
          </div>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-red-900/50 to-red-800/30 rounded-lg border border-red-500/30">
          <div className="text-xs text-red-300 uppercase tracking-wide mb-2">Reality Value</div>
          <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-400">
            {formatCurrency(intentToReality.trillionPotential)}
          </div>
        </div>
      </div>

      {/* Trillion Scenarios */}
      <div className="mb-6">
        <div className="text-sm font-medium text-neutral-200 mb-3">Trillion-Dollar Scenarios</div>
        <div className="space-y-3">
          {enhanced.trillionScenarios.map((scenario: TrillionScenario, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-neutral-900/50 rounded-lg"
            >
              <div className="flex-1">
                <div className="font-medium text-neutral-200">{scenario.scenario}</div>
                <div className="text-xs text-neutral-400 mt-1">{scenario.description}</div>
              </div>
              <div className="text-right ml-4">
                <div className="text-lg font-bold text-emerald-400">
                  {formatCurrency(scenario.value)}
                </div>
                <div className="text-xs text-neutral-500">
                  {(scenario.probability * 100).toFixed(0)}% probability
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Value Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-neutral-900/30 rounded-lg">
          <div className="text-sm font-medium text-neutral-200 mb-3">Intent Value Breakdown</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-400">Speed Value:</span>
              <span className="text-blue-400">
                {formatCurrency(intentToReality.breakdown.speedValue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Complexity Value:</span>
              <span className="text-purple-400">
                {formatCurrency(intentToReality.breakdown.complexityValue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Disruption Value:</span>
              <span className="text-red-400">
                {formatCurrency(intentToReality.breakdown.disruptionValue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Velocity Value:</span>
              <span className="text-emerald-400">
                {formatCurrency(intentToReality.breakdown.velocityValue)}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-neutral-900/30 rounded-lg">
          <div className="text-sm font-medium text-neutral-200 mb-3">Reality Acceleration</div>
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400 mb-1">
                {intentToReality.realityAcceleration.toFixed(1)}x
              </div>
              <div className="text-xs text-neutral-400">Reality Acceleration Factor</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Implementation Speed:</span>
                <span className="text-neutral-200">1 day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Success Rate:</span>
                <span className="text-emerald-400">95%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Thought Velocity:</span>
                <span className="text-yellow-400">50/day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Reality Gap:</span>
                <span className="text-cyan-400">2 hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expected Value */}
      <div className="mt-6 p-4 bg-gradient-to-r from-emerald-900/30 to-blue-900/30 rounded-lg border border-emerald-500/30">
        <div className="text-center">
          <div className="text-sm text-neutral-400 mb-2">Expected Value Across All Scenarios</div>
          <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
            {formatCurrency(enhanced.expectedValue)}
          </div>
          <div className="text-xs text-neutral-500 mt-2">
            Weighted average based on scenario probabilities
          </div>
        </div>
      </div>

      {/* IP Protection: Legal Disclaimer and Watermarking */}
      <div className="mt-6 pt-4 border-t border-neutral-700">
        <div className="text-xs text-neutral-500 text-center space-y-1">
          <div className="font-medium text-neutral-400">
            © 2025 Bickford Technologies LLC - All Rights Reserved
          </div>
          <div>Patent Pending - US Provisional Patent Application Filed</div>
          <div>CONFIDENTIAL AND PROPRIETARY - Protected by US Patent Law</div>
          <div className="text-neutral-600">
            Usage ID: {usageId.slice(0, 8)}... | Generated: {new Date().toLocaleDateString()}
          </div>
          <div className="text-neutral-600 mt-2">
            This valuation contains proprietary methodologies and algorithms. Unauthorized use,
            reproduction, or distribution is strictly prohibited.
          </div>
        </div>
      </div>
    </Card>
  );
}
