'use client';

import { useState } from 'react';

interface KnowledgeEntry {
  action: {
    id: string;
    timestamp: string;
    type: string;
  };
  intent: {
    description: string;
    context?: string;
  };
  enables?: string[];
  lessons?: string[];
  coaching_notes?: string;
}

interface SearchKnowledgeProps {
  entries: KnowledgeEntry[];
}

export default function SearchKnowledge({ entries }: SearchKnowledgeProps) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredEntries = entries.filter(entry => {
    const matchesType = typeFilter === 'all' || entry.action.type === typeFilter;
    
    if (!query) return matchesType;

    const searchLower = query.toLowerCase();
    const description = (entry.intent?.description || '').toLowerCase();
    const context = (entry.intent?.context || '').toLowerCase();
    const enables = (entry.enables || []).join(' ').toLowerCase();
    const lessons = (entry.lessons || []).join(' ').toLowerCase();
    const coaching = (entry.coaching_notes || '').toLowerCase();

    return matchesType && (
      description.includes(searchLower) ||
      context.includes(searchLower) ||
      enables.includes(searchLower) ||
      lessons.includes(searchLower) ||
      coaching.includes(searchLower)
    );
  });

  const types = ['all', 'feature', 'bug_fix', 'build_fix', 'refactor', 'deployment', 'configuration'];

  return (
    <div className="space-y-6">
      {/* Search controls */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search knowledge base..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
        >
          {types.map(type => (
            <option key={type} value={type}>
              {type === 'all' ? 'All Types' : type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      {/* Results */}
      <div className="text-sm text-gray-400 mb-4">
        {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'} found
      </div>

      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No entries match your search criteria
          </div>
        ) : (
          filteredEntries.map(entry => (
            <div
              key={entry.action.id}
              className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {entry.intent.description}
                  </h3>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="px-2 py-1 bg-blue-900/50 text-blue-400 rounded">
                      {entry.action.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-gray-500">
                      {new Date(entry.action.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {entry.intent.context && (
                <p className="text-gray-300 mb-3">{entry.intent.context}</p>
              )}

              {entry.enables && entry.enables.length > 0 && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-400 mb-2">Enables:</div>
                  <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                    {entry.enables.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {entry.lessons && entry.lessons.length > 0 && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-400 mb-2">Lessons:</div>
                  <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                    {entry.lessons.map((lesson, idx) => (
                      <li key={idx}>{lesson}</li>
                    ))}
                  </ul>
                </div>
              )}

              {entry.coaching_notes && (
                <details className="mt-3">
                  <summary className="text-sm font-medium text-blue-400 cursor-pointer hover:text-blue-300">
                    View coaching notes
                  </summary>
                  <pre className="mt-2 text-sm text-gray-300 whitespace-pre-wrap bg-gray-950 p-4 rounded border border-gray-800">
                    {entry.coaching_notes}
                  </pre>
                </details>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
