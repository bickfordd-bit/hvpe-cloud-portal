'use client';

import { useEffect, useRef, useState } from 'react';

interface KnowledgeEntry {
  action: {
    id: string;
    timestamp: string;
    type: string;
  };
  intent: {
    description: string;
  };
  depends_on?: Array<{ action: string; why: string }>;
  unlocks?: Array<{ action: string; why: string }>;
}

interface KnowledgeGraphProps {
  entries: KnowledgeEntry[];
}

export default function KnowledgeGraph({ entries }: KnowledgeGraphProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Build adjacency list for graph visualization
  const buildGraph = () => {
    const nodes: Record<string, KnowledgeEntry> = {};
    const edges: Array<{ from: string; to: string; why: string; type: 'depends' | 'unlocks' }> = [];

    entries.forEach(entry => {
      nodes[entry.action.id] = entry;

      // Add dependency edges
      if (entry.depends_on) {
        entry.depends_on.forEach(dep => {
          edges.push({
            from: entry.action.id,
            to: dep.action,
            why: dep.why,
            type: 'depends'
          });
        });
      }

      // Add unlock edges
      if (entry.unlocks) {
        entry.unlocks.forEach(unlock => {
          edges.push({
            from: entry.action.id,
            to: unlock.action,
            why: unlock.why,
            type: 'unlocks'
          });
        });
      }
    });

    return { nodes, edges };
  };

  const { nodes, edges } = buildGraph();
  const selectedEntry = selectedNode ? nodes[selectedNode] : null;

  const getNodeConnections = (nodeId: string) => {
    const dependencies = edges.filter(e => e.from === nodeId && e.type === 'depends');
    const unlocks = edges.filter(e => e.from === nodeId && e.type === 'unlocks');
    return { dependencies, unlocks };
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-400 mb-4">
        {Object.keys(nodes).length} nodes, {edges.length} edges
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Node list */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <h3 className="font-semibold text-white">Actions</h3>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {Object.values(nodes).map(entry => (
                <button
                  key={entry.action.id}
                  onClick={() => setSelectedNode(entry.action.id)}
                  className={`w-full text-left p-4 border-b border-gray-800 hover:bg-gray-800 transition-colors ${
                    selectedNode === entry.action.id ? 'bg-gray-800' : ''
                  }`}
                >
                  <div className="text-sm font-medium text-white mb-1 truncate">
                    {entry.intent.description}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="px-2 py-0.5 bg-gray-700 rounded">
                      {entry.action.type.replace(/_/g, ' ')}
                    </span>
                    <span>{new Date(entry.action.timestamp).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Details panel */}
        <div className="lg:col-span-2">
          {selectedEntry ? (
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                {selectedEntry.intent.description}
              </h3>

              <div className="space-y-4">
                <div>
                  <span className="inline-block px-3 py-1 bg-blue-900/50 text-blue-400 rounded text-sm">
                    {selectedEntry.action.type.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Dependencies */}
                {(() => {
                  const { dependencies, unlocks } = getNodeConnections(selectedEntry.action.id);
                  
                  return (
                    <>
                      {dependencies.length > 0 && (
                        <div className="border-t border-gray-800 pt-4">
                          <h4 className="text-sm font-semibold text-gray-400 mb-3">
                            Depends on:
                          </h4>
                          <div className="space-y-2">
                            {dependencies.map((edge, idx) => (
                              <div
                                key={idx}
                                className="bg-gray-800 rounded p-3 border-l-4 border-yellow-500"
                              >
                                <div className="text-sm font-medium text-white mb-1">
                                  {edge.to}
                                </div>
                                <div className="text-xs text-gray-400">{edge.why}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {unlocks.length > 0 && (
                        <div className="border-t border-gray-800 pt-4">
                          <h4 className="text-sm font-semibold text-gray-400 mb-3">
                            Unlocks:
                          </h4>
                          <div className="space-y-2">
                            {unlocks.map((edge, idx) => (
                              <div
                                key={idx}
                                className="bg-gray-800 rounded p-3 border-l-4 border-green-500"
                              >
                                <div className="text-sm font-medium text-white mb-1">
                                  {edge.to}
                                </div>
                                <div className="text-xs text-gray-400">{edge.why}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {dependencies.length === 0 && unlocks.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No dependencies or unlocks for this action
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
              <div className="text-gray-500 mb-2">Select an action to view dependencies</div>
              <div className="text-sm text-gray-600">
                Click on any action in the list to see what it depends on and what it unlocks
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
