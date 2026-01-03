'use client';

import { useState, useEffect } from 'react';

interface Pattern {
  pattern: {
    name: string;
    frequency: number;
    type: string;
    detected_at: string;
    common_keywords?: string[];
  };
  instances: string[];
  common_root_causes?: string[];
  recommended_prevention?: string[];
  example_entry?: string;
}

export default function RecurringPatterns() {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/knowledge/patterns')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.patterns) {
          setPatterns(data.data.patterns);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load patterns:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-400">Loading patterns...</p>
      </div>
    );
  }

  if (patterns.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-white mb-2">No Patterns Detected Yet</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Patterns emerge when similar issues occur multiple times. Keep adding knowledge entries
          to build pattern recognition.
        </p>
        <div className="mt-6 text-sm text-gray-500">
          <p>Patterns require at least 2 instances of the same action type.</p>
        </div>
      </div>
    );
  }

  const getFrequencyColor = (frequency: number) => {
    if (frequency >= 5) return 'text-red-400';
    if (frequency >= 3) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-400 mb-4">
        {patterns.length} {patterns.length === 1 ? 'pattern' : 'patterns'} detected
      </div>

      <div className="grid grid-cols-1 gap-6">
        {patterns.map((pattern, idx) => (
          <div
            key={idx}
            className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gray-800 p-4 border-b border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {pattern.pattern.name}
                  </h3>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded">
                      {pattern.pattern.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-gray-500">
                      Detected: {new Date(pattern.pattern.detected_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getFrequencyColor(pattern.pattern.frequency)}`}>
                    {pattern.pattern.frequency}
                  </div>
                  <div className="text-xs text-gray-500">occurrences</div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Instances */}
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Instances:</h4>
                <div className="flex flex-wrap gap-2">
                  {pattern.instances.map((instance, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded"
                    >
                      {instance}
                    </span>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              {pattern.pattern.common_keywords && pattern.pattern.common_keywords.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Common Keywords:</h4>
                  <div className="flex flex-wrap gap-2">
                    {pattern.pattern.common_keywords.map((keyword, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Root causes */}
              {pattern.common_root_causes && pattern.common_root_causes.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Common Root Causes:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                    {pattern.common_root_causes.slice(0, 3).map((cause, i) => (
                      <li key={i}>{cause}</li>
                    ))}
                    {pattern.common_root_causes.length > 3 && (
                      <li className="text-gray-500">
                        +{pattern.common_root_causes.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Prevention */}
              {pattern.recommended_prevention && pattern.recommended_prevention.length > 0 && (
                <div className="bg-green-900/10 border border-green-900/30 rounded p-4">
                  <h4 className="text-sm font-semibold text-green-400 mb-2">
                    💡 Prevention Strategies:
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                    {pattern.recommended_prevention.map((strategy, i) => (
                      <li key={i}>{strategy}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Example entry */}
              {pattern.example_entry && (
                <div className="text-xs text-gray-500">
                  Example: {pattern.example_entry}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
