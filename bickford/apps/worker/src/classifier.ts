export type BucketName = 'Notes' | 'Code' | 'Decisions' | 'Risks' | 'Metrics' | 'Tasks';

export function classifyChunk(content: string): BucketName {
  const lowerContent = content.toLowerCase();

  // Code: Contains "code" or "```"
  if (lowerContent.includes('code') || content.includes('```')) {
    return 'Code';
  }

  // Decisions: Contains "decision" or "choose"
  if (lowerContent.includes('decision') || lowerContent.includes('choose')) {
    return 'Decisions';
  }

  // Risks: Contains "risk" or "security"
  if (lowerContent.includes('risk') || lowerContent.includes('security')) {
    return 'Risks';
  }

  // Metrics: Contains "metric", "%", or "$"
  if (lowerContent.includes('metric') || content.includes('%') || content.includes('$')) {
    return 'Metrics';
  }

  // Tasks: Contains "todo" or "task"
  if (lowerContent.includes('todo') || lowerContent.includes('task')) {
    return 'Tasks';
  }

  // Default: Notes
  return 'Notes';
}
