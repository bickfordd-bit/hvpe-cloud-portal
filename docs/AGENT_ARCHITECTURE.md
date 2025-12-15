# Agent Architecture Guide

## Overview

This guide explains how to build intelligent agents for the HVPE Cloud Portal. Agents are autonomous AI-powered modules that can process data, make decisions, and execute actions within specific domains (OPTR analysis, trading, content generation, etc.).

## Agent Design Principles

### 1. Domain-Specific Intelligence
Each agent focuses on a specific domain:
- **OPTR Agent**: Opportunity analysis and requirement scoring
- **Trading Agent**: Market analysis and trade execution
- **Bickford Agent**: Conversational AI and context management
- **Penelope Agent**: Content generation and optimization

### 2. Core Components

Every agent should implement these components:

```typescript
// src/lib/agents/types.ts
export interface Agent<TInput, TOutput> {
  name: string;
  version: string;
  process(input: TInput): Promise<TOutput>;
  validate(input: TInput): boolean;
  getMetadata(): AgentMetadata;
}

export interface AgentMetadata {
  name: string;
  version: string;
  description: string;
  capabilities: string[];
  dependencies: string[];
}

export interface AgentContext {
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  trace?: TraceEvent[];
}

export interface AgentResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  trace: TraceEvent[];
  metadata: Record<string, any>;
}
```

### 3. Agent Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                      Agent Lifecycle                         │
└─────────────────────────────────────────────────────────────┘

    Input
      │
      ▼
┌──────────────┐
│  Validation  │  ← Validate input, check prerequisites
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Preprocessing│  ← Normalize data, fetch context
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Processing  │  ← Core AI logic, decision making
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Postprocessing│  ← Format results, generate traces
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Storage    │  ← Log results, update state
└──────┬───────┘
       │
       ▼
    Output
```

## Building an Agent: Step-by-Step

### Step 1: Define Agent Type and Interface

```typescript
// src/lib/agents/myAgent/types.ts
export interface MyAgentInput {
  prompt: string;
  context?: Record<string, any>;
  options?: MyAgentOptions;
}

export interface MyAgentOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface MyAgentOutput {
  result: string;
  confidence: number;
  reasoning: string[];
  metadata: {
    tokensUsed: number;
    processingTime: number;
  };
}
```

### Step 2: Implement Agent Class

```typescript
// src/lib/agents/myAgent/agent.ts
import { Agent, AgentContext, AgentResult } from '../types';
import { logger } from '@/lib/logger';
import { runChat } from '@/lib/ai/openaiClient';

export class MyAgent implements Agent<MyAgentInput, MyAgentOutput> {
  name = 'MyAgent';
  version = '1.0.0';

  async process(
    input: MyAgentInput,
    context?: AgentContext
  ): Promise<AgentResult<MyAgentOutput>> {
    const trace: TraceEvent[] = [];
    const startTime = Date.now();

    try {
      // 1. Validate input
      if (!this.validate(input)) {
        throw new Error('Invalid input');
      }
      
      trace.push({
        stage: 'validation',
        timestamp: Date.now(),
        status: 'success'
      });

      // 2. Preprocess
      const preprocessed = await this.preprocess(input, context);
      trace.push({
        stage: 'preprocessing',
        timestamp: Date.now(),
        status: 'success'
      });

      // 3. Execute AI logic
      const aiResult = await this.executeAI(preprocessed);
      trace.push({
        stage: 'ai-execution',
        timestamp: Date.now(),
        status: 'success',
        data: { tokensUsed: aiResult.tokensUsed }
      });

      // 4. Postprocess
      const output = await this.postprocess(aiResult);
      trace.push({
        stage: 'postprocessing',
        timestamp: Date.now(),
        status: 'success'
      });

      // 5. Store results
      await this.store(output, context);

      return {
        success: true,
        data: output,
        trace,
        metadata: {
          processingTime: Date.now() - startTime,
          version: this.version
        }
      };
    } catch (error: any) {
      logger.error('Agent processing failed', {
        agent: this.name,
        error: error.message,
        trace
      });

      return {
        success: false,
        error: error.message,
        trace,
        metadata: {
          processingTime: Date.now() - startTime
        }
      };
    }
  }

  validate(input: MyAgentInput): boolean {
    return !!input.prompt && input.prompt.length > 0;
  }

  private async preprocess(
    input: MyAgentInput,
    context?: AgentContext
  ): Promise<any> {
    // Normalize input, fetch additional context
    return {
      prompt: input.prompt.trim(),
      context: {
        ...input.context,
        userId: context?.userId,
        sessionId: context?.sessionId
      },
      options: {
        temperature: input.options?.temperature ?? 0.7,
        maxTokens: input.options?.maxTokens ?? 2000,
        model: input.options?.model ?? 'gpt-4-turbo-preview'
      }
    };
  }

  private async executeAI(preprocessed: any): Promise<any> {
    const messages = [
      {
        role: 'system' as const,
        content: 'You are a helpful AI assistant.'
      },
      {
        role: 'user' as const,
        content: preprocessed.prompt
      }
    ];

    const result = await runChat({
      messages,
      temperature: preprocessed.options.temperature,
      max_tokens: preprocessed.options.maxTokens,
      model: preprocessed.options.model
    });

    return {
      content: result.content,
      tokensUsed: result.usage?.total_tokens ?? 0
    };
  }

  private async postprocess(aiResult: any): Promise<MyAgentOutput> {
    return {
      result: aiResult.content,
      confidence: 0.85, // Calculate based on AI response
      reasoning: this.extractReasoning(aiResult.content),
      metadata: {
        tokensUsed: aiResult.tokensUsed,
        processingTime: 0 // Set in main process method
      }
    };
  }

  private extractReasoning(content: string): string[] {
    // Extract reasoning steps from AI response
    const lines = content.split('\n').filter(l => l.trim());
    return lines.slice(0, 5); // First 5 lines as reasoning
  }

  private async store(
    output: MyAgentOutput,
    context?: AgentContext
  ): Promise<void> {
    // Store results in database if needed
    logger.info('Agent result stored', {
      agent: this.name,
      userId: context?.userId,
      confidence: output.confidence
    });
  }

  getMetadata(): AgentMetadata {
    return {
      name: this.name,
      version: this.version,
      description: 'My custom AI agent',
      capabilities: ['text-processing', 'reasoning'],
      dependencies: ['openai']
    };
  }
}
```

### Step 3: Create API Endpoint

```typescript
// src/app/api/agents/myagent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MyAgent } from '@/lib/agents/myAgent/agent';
import { apiSuccess, apiError } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const agent = new MyAgent();
    const result = await agent.process(body, {
      userId: req.headers.get('x-user-id') || undefined,
      sessionId: req.headers.get('x-session-id') || undefined
    });

    if (!result.success) {
      return NextResponse.json(
        apiError(new Error(result.error)),
        { status: 500 }
      );
    }

    return NextResponse.json(apiSuccess(result));
  } catch (error: any) {
    logger.error('API error', { error: error.message });
    return NextResponse.json(apiError(error), { status: 500 });
  }
}
```

### Step 4: Create Client Wrapper

```typescript
// src/lib/agents/myAgent/client.ts
import { MyAgentInput, MyAgentOutput } from './types';
import { AgentResult } from '../types';

async function fetchJSON<T>(
  url: string,
  init: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {})
    }
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}${text ? ` — ${text}` : ''}`);
  }

  return await res.json() as T;
}

export const myAgentClient = {
  async run(
    input: MyAgentInput
  ): Promise<AgentResult<MyAgentOutput>> {
    const response = await fetchJSON<{ data: AgentResult<MyAgentOutput> }>(
      '/api/agents/myagent',
      {
        method: 'POST',
        body: JSON.stringify(input)
      }
    );
    return response.data;
  }
};
```

### Step 5: Add Tests

```typescript
// src/lib/agents/myAgent/__tests__/agent.test.ts
import { MyAgent } from '../agent';
import { MyAgentInput } from '../types';

describe('MyAgent', () => {
  let agent: MyAgent;

  beforeEach(() => {
    agent = new MyAgent();
  });

  it('should validate valid input', () => {
    const input: MyAgentInput = {
      prompt: 'Test prompt'
    };
    expect(agent.validate(input)).toBe(true);
  });

  it('should reject invalid input', () => {
    const input: MyAgentInput = {
      prompt: ''
    };
    expect(agent.validate(input)).toBe(false);
  });

  it('should process input successfully', async () => {
    const input: MyAgentInput = {
      prompt: 'Analyze this data'
    };

    const result = await agent.process(input);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.trace.length).toBeGreaterThan(0);
  });

  it('should return metadata', () => {
    const metadata = agent.getMetadata();
    
    expect(metadata.name).toBe('MyAgent');
    expect(metadata.version).toBe('1.0.0');
    expect(metadata.capabilities).toContain('text-processing');
  });
});
```

## Agent Patterns

### Pattern 1: Multi-Step Agent (OPTR-style)

For complex workflows with multiple stages:

```typescript
class MultiStepAgent implements Agent<Input, Output> {
  async process(input: Input): Promise<AgentResult<Output>> {
    const trace: TraceEvent[] = [];

    // Step 1: Embeddings
    const embeddings = await this.generateEmbeddings(input.documents);
    trace.push({ stage: 'embeddings', status: 'success' });

    // Step 2: Retrieval
    const relevant = await this.retrieve(embeddings, input.query);
    trace.push({ stage: 'retrieval', status: 'success' });

    // Step 3: Scoring
    const scored = await this.score(relevant, input.requirements);
    trace.push({ stage: 'scoring', status: 'success' });

    // Step 4: Synthesis
    const output = await this.synthesize(scored);
    trace.push({ stage: 'synthesis', status: 'success' });

    return { success: true, data: output, trace, metadata: {} };
  }

  private async generateEmbeddings(docs: Document[]) { /* ... */ }
  private async retrieve(embeddings: Embedding[], query: string) { /* ... */ }
  private async score(docs: Document[], requirements: string[]) { /* ... */ }
  private async synthesize(scored: ScoredDocument[]) { /* ... */ }
}
```

### Pattern 2: Conversational Agent (Bickford-style)

For maintaining conversation context:

```typescript
class ConversationalAgent implements Agent<Message, Response> {
  private contextWindow = 10;

  async process(
    input: Message,
    context?: AgentContext
  ): Promise<AgentResult<Response>> {
    // Retrieve conversation history
    const history = await this.getHistory(context?.sessionId);

    // Build messages with context
    const messages = [
      { role: 'system', content: this.getSystemPrompt() },
      ...history.slice(-this.contextWindow),
      { role: 'user', content: input.text }
    ];

    // Get AI response
    const response = await runChat({ messages });

    // Store in history
    await this.storeMessage(context?.sessionId, input, response);

    return {
      success: true,
      data: { text: response.content },
      trace: [],
      metadata: {}
    };
  }

  private async getHistory(sessionId?: string): Promise<Message[]> { /* ... */ }
  private async storeMessage(sessionId?: string, input: Message, response: any) { /* ... */ }
}
```

### Pattern 3: Decision Agent (Trading-style)

For making decisions based on data analysis:

```typescript
class DecisionAgent implements Agent<MarketData, TradeDecision> {
  async process(input: MarketData): Promise<AgentResult<TradeDecision>> {
    // Analyze market conditions
    const analysis = await this.analyze(input);

    // Evaluate risk
    const risk = await this.assessRisk(analysis);

    // Generate decision
    const decision = await this.decide(analysis, risk);

    // Validate decision against safety checks
    const validated = await this.validateDecision(decision);

    return {
      success: true,
      data: validated,
      trace: [
        { stage: 'analysis', status: 'success' },
        { stage: 'risk-assessment', status: 'success' },
        { stage: 'decision', status: 'success' },
        { stage: 'validation', status: 'success' }
      ],
      metadata: {
        confidence: analysis.confidence,
        riskScore: risk.score
      }
    };
  }

  private async analyze(data: MarketData) { /* ... */ }
  private async assessRisk(analysis: Analysis) { /* ... */ }
  private async decide(analysis: Analysis, risk: Risk) { /* ... */ }
  private async validateDecision(decision: TradeDecision) { /* ... */ }
}
```

## Agent Best Practices

### 1. Error Handling

Always wrap agent logic in try-catch and return structured errors:

```typescript
async process(input: Input): Promise<AgentResult<Output>> {
  try {
    // Agent logic
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      trace: [...],
      metadata: { errorType: error.constructor.name }
    };
  }
}
```

### 2. Tracing

Add trace events at each major stage for debugging:

```typescript
trace.push({
  stage: 'stage-name',
  timestamp: Date.now(),
  status: 'success' | 'failure',
  data: { relevant: 'metadata' }
});
```

### 3. Validation

Validate input before processing:

```typescript
validate(input: Input): boolean {
  if (!input.required_field) return false;
  if (input.number_field < 0) return false;
  if (input.array_field.length === 0) return false;
  return true;
}
```

### 4. Logging

Use structured logging for observability:

```typescript
logger.info('Agent processing started', {
  agent: this.name,
  inputSize: input.length,
  userId: context?.userId
});
```

### 5. Caching

Cache expensive operations:

```typescript
private embeddingCache = new Map<string, Embedding>();

async getEmbedding(text: string): Promise<Embedding> {
  const cached = this.embeddingCache.get(text);
  if (cached) return cached;

  const embedding = await generateEmbedding(text);
  this.embeddingCache.set(text, embedding);
  return embedding;
}
```

### 6. Rate Limiting

Protect external API calls:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30 // 30 requests per minute
});

export async function POST(req: NextRequest) {
  // Apply rate limiting
  await limiter(req);
  // ... process request
}
```

## Agent Deployment

### Environment Variables

```bash
# .env.local
MY_AGENT_ENABLED=true
MY_AGENT_MODEL=gpt-4-turbo-preview
MY_AGENT_TEMPERATURE=0.7
MY_AGENT_MAX_TOKENS=2000
MY_AGENT_CACHE_TTL=3600
```

### Branch-Specific Agents

Each branch can have specialized agents:

- **bickford branch**: ConversationalAgent with enhanced context
- **hvpetrader branch**: TradingAgent with market data integration
- **bickford-for-defense branch**: SecureAgent with audit logging
- **penelope branch**: ContentAgent with template management

### Monitoring

Add monitoring for agent performance:

```typescript
import { trackMetric } from '@/lib/metrics';

async process(input: Input): Promise<AgentResult<Output>> {
  const startTime = Date.now();
  
  try {
    const result = await this.executeLogic(input);
    
    trackMetric('agent.success', 1, {
      agent: this.name,
      duration: Date.now() - startTime
    });
    
    return result;
  } catch (error) {
    trackMetric('agent.failure', 1, {
      agent: this.name,
      error: error.message
    });
    throw error;
  }
}
```

## Example: Complete Trading Agent

See implementation in:
- `src/lib/agents/trading/agent.ts`
- `src/lib/agents/trading/types.ts`
- `src/app/api/agents/trading/route.ts`

## Example: Complete OPTR Agent

The OPTR processor is a complex multi-step agent:
- `src/lib/optr/processor.ts` - Main agent logic
- `src/lib/optr/types.ts` - Type definitions
- `src/app/api/optr/opportunities/[id]/run/route.ts` - API endpoint

## Resources

- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Agent Design Patterns](https://www.anthropic.com/agent-patterns)
- [LangChain Agents](https://js.langchain.com/docs/modules/agents/)

## Next Steps

1. **Choose agent type** - Conversational, decision-making, or multi-step
2. **Define interfaces** - Input/output types, options
3. **Implement agent class** - Follow patterns above
4. **Add API endpoint** - Make agent accessible
5. **Create client wrapper** - Type-safe API calls
6. **Write tests** - Unit tests for all methods
7. **Add to branch** - Deploy in appropriate branch
8. **Monitor** - Track performance and errors

---

**Last Updated**: December 2025  
**See Also**: [BRANCH_ARCHITECTURE.md](../BRANCH_ARCHITECTURE.md), [AI Core Documentation](../README.md)
