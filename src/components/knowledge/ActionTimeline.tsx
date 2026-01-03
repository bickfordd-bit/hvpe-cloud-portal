'use client';

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
}

interface ActionTimelineProps {
  entries: KnowledgeEntry[];
}

export default function ActionTimeline({ entries }: ActionTimelineProps) {
  // Sort entries by timestamp (newest first)
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.action.timestamp).getTime() - new Date(a.action.timestamp).getTime()
  );

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      feature: 'bg-green-500',
      bug_fix: 'bg-red-500',
      build_fix: 'bg-yellow-500',
      refactor: 'bg-purple-500',
      deployment: 'bg-blue-500',
      configuration: 'bg-cyan-500',
      documentation: 'bg-gray-500',
      test: 'bg-pink-500',
      security: 'bg-orange-500',
      performance: 'bg-indigo-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-400 mb-4">
        {sortedEntries.length} actions in chronological order
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-800"></div>

        {/* Timeline items */}
        <div className="space-y-6">
          {sortedEntries.map((entry, idx) => (
            <div key={entry.action.id} className="relative pl-20">
              {/* Timeline dot */}
              <div
                className={`absolute left-6 w-4 h-4 rounded-full ${getTypeColor(entry.action.type)} ring-4 ring-black`}
              ></div>

              {/* Content card */}
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium text-white rounded ${getTypeColor(entry.action.type)}`}>
                        {entry.action.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(entry.action.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {entry.intent.description}
                    </h3>
                    {entry.intent.context && (
                      <p className="text-sm text-gray-400">{entry.intent.context}</p>
                    )}
                  </div>
                </div>

                {entry.enables && entry.enables.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <div className="text-xs font-medium text-gray-500 mb-2">Enables:</div>
                    <div className="flex flex-wrap gap-2">
                      {entry.enables.slice(0, 3).map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded"
                        >
                          {item}
                        </span>
                      ))}
                      {entry.enables.length > 3 && (
                        <span className="px-2 py-1 text-gray-500 text-xs">
                          +{entry.enables.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {sortedEntries.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No timeline entries available
        </div>
      )}
    </div>
  );
}
