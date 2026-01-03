'use client';

import { useState, useEffect } from 'react';
import SearchKnowledge from '@/components/knowledge/SearchKnowledge';
import ActionTimeline from '@/components/knowledge/ActionTimeline';
import RecurringPatterns from '@/components/knowledge/RecurringPatterns';
import KnowledgeGraph from '@/components/knowledge/KnowledgeGraph';

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
  depends_on?: Array<{ action: string; why: string }>;
  unlocks?: Array<{ action: string; why: string }>;
}

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState<'search' | 'timeline' | 'graph' | 'patterns'>('search');
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load knowledge entries
    fetch('/api/knowledge?limit=100')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.entries) {
          setEntries(data.data.entries);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load knowledge entries:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Knowledge Base</h1>
          <p className="text-gray-400">
            Explore coaching-style knowledge captured from every action
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="text-3xl font-bold text-blue-400">{entries.length}</div>
            <div className="text-sm text-gray-400">Total Entries</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="text-3xl font-bold text-green-400">
              {entries.filter(e => e.action.type === 'feature').length}
            </div>
            <div className="text-sm text-gray-400">Features</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="text-3xl font-bold text-yellow-400">
              {entries.filter(e => e.action.type === 'bug_fix' || e.action.type === 'build_fix').length}
            </div>
            <div className="text-sm text-gray-400">Fixes</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="text-3xl font-bold text-purple-400">
              {entries.filter(e => e.action.type === 'refactor').length}
            </div>
            <div className="text-sm text-gray-400">Refactors</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'search'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🔍 Search
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'timeline'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📅 Timeline
          </button>
          <button
            onClick={() => setActiveTab('graph')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'graph'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🕸️ Dependencies
          </button>
          <button
            onClick={() => setActiveTab('patterns')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'patterns'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📊 Patterns
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading knowledge base...</p>
          </div>
        ) : (
          <>
            {activeTab === 'search' && <SearchKnowledge entries={entries} />}
            {activeTab === 'timeline' && <ActionTimeline entries={entries} />}
            {activeTab === 'graph' && <KnowledgeGraph entries={entries} />}
            {activeTab === 'patterns' && <RecurringPatterns />}
          </>
        )}
      </div>
    </div>
  );
}
