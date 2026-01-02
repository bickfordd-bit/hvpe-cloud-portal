# @bickfordd-bit/bickford

Bickford Intelligence Engine - Intent-to-Reality acceleration framework with unified AI agent system.

## 🚀 Features

- **Proprietary Bickford Formula** - Patent-protected intent-to-reality calculation
- **Unified Agent System** - Single AI agent for all modes (trader, OPTR, bickford)
- **Knowledge Package** - Core Bickford identity, principles, and language
- **OpenAI Integration** - Enhanced responses with GPT-4
- **TypeScript Support** - Full type definitions included

## 📦 Installation

```bash
npm install @bickfordd-bit/bickford
```

## 🔑 Quick Start

### Basic Usage (No OpenAI)

```typescript
import { createBickfordEngine } from '@bickfordd-bit/bickford';

const engine = createBickfordEngine();

const result = await engine.processIntent(
  'I want to build a trading system that generates $10k/month'
);

console.log(result.response);
console.log('Reality Acceleration:', result.analysis.realityAcceleration);
console.log('Manifestation Probability:', result.analysis.manifestationProbability);
```

### With OpenAI Enhancement

```typescript
import { createBickfordEngine } from '@bickfordd-bit/bickford';

const engine = createBickfordEngine({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4-turbo-preview',
  temperature: 0.3,
});

const result = await engine.processIntent(
  'How do I accelerate revenue from my software product?',
  'Context: SaaS product, $5k MRR currently'
);
```

### Unified Agent System

```typescript
import { buildUnifiedAgentPrompt, buildModePrompt } from '@bickfordd-bit/bickford';

// Build prompt for any mode
const traderPrompt = buildModePrompt('trader');
const optrPrompt = buildModePrompt('optr');
const bickfordPrompt = buildModePrompt('bickford');

// Custom agent prompt
const customPrompt = buildUnifiedAgentPrompt({
  specialization: 'You are a financial analyst',
  capabilities: ['Portfolio analysis', 'Risk assessment'],
  constraints: ['Never provide financial advice'],
  context: 'User portfolio: $100k',
});
```

### Knowledge Package

```typescript
import {
  BICKFORD_KNOWLEDGE_PACKAGE,
  formatBickfordKnowledgePackage,
} from '@bickfordd-bit/bickford';

// Access raw knowledge
console.log(BICKFORD_KNOWLEDGE_PACKAGE.identity);
console.log(BICKFORD_KNOWLEDGE_PACKAGE.operatingPrinciples);

// Format for display
const formattedKnowledge = formatBickfordKnowledgePackage();
console.log(formattedKnowledge);
```

## 📚 API Reference

### `BickfordIntelligenceEngine`

```typescript
class BickfordIntelligenceEngine {
  constructor(options?: BickfordOptions);
  processIntent(message: string, context?: string): Promise<BickfordResponse>;
}
```

**Options:**
- `apiKey?: string` - OpenAI API key
- `model?: string` - OpenAI model (default: 'gpt-4-turbo-preview')
- `temperature?: number` - Response creativity (default: 0.3)
- `maxTokens?: number` - Max response length (default: 2000)

**Response:**
```typescript
interface BickfordResponse {
  response: string;
  analysis: {
    intention: string;
    realityAcceleration: number;      // 0-100
    manifestationProbability: number; // 0-100
    valueMultiplier: number;          // 1.0+
    protectionHash: string;
  };
  usageId: string;
  protection: {
    formulaVersion: string;
    patentStatus: string;
    integrityHash: string;
  };
}
```

### `buildUnifiedAgentPrompt(options)`

Build system prompts with Bickford context:

```typescript
interface UnifiedAgentOptions {
  specialization?: string;  // Role-specific instructions
  context?: string;         // Runtime context
  capabilities?: string[];  // What the agent can do
  constraints?: string[];   // What the agent cannot do
  mode?: string;           // Operating mode
  bickfordMode?: BickfordMode | null;
}
```

### `buildModePrompt(mode, context?, bickfordMode?)`

Pre-built prompts for specific modes:
- `'trader'` - Trading and risk analysis
- `'optr'` - Opportunity targeting
- `'bickford'` - Strategic planning
- `'general'` - Default mode

## 🎯 Use Cases

### 1. Intent Analysis

```typescript
const engine = createBickfordEngine();
const result = await engine.processIntent('Launch product in 30 days');

if (result.analysis.manifestationProbability > 70) {
  console.log('High probability - proceed with execution');
} else {
  console.log('Need more clarity - refine intent');
}
```

### 2. AI Chat Integration

```typescript
import OpenAI from 'openai';
import { buildUnifiedAgentPrompt, UNIFIED_AGENT_ID } from '@bickfordd-bit/bickford';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const systemPrompt = buildUnifiedAgentPrompt({
  specialization: 'Trading assistant',
  context: 'User portfolio: Tech stocks',
});

const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: 'Should I sell my AAPL position?' },
  ],
});
```

### 3. Knowledge Embedding

```typescript
import { formatBickfordKnowledgePackage } from '@bickfordd-bit/bickford';

const knowledge = formatBickfordKnowledgePackage();

// Add to your system prompts
const enhancedPrompt = `
${baseSystemPrompt}

${knowledge}

Now respond to user queries with Bickford context.
`;
```

## 🔒 IP Protection

This package contains proprietary technology protected by:
- **US Provisional Patent Application** (Filed 2025)
- **Trade Secret Protection** - Core formula not exposed in source
- **Copyright** - All rights reserved by Bickford Technologies LLC

**Usage Terms:**
- Commercial use requires license
- Do not reverse engineer the Bickford Formula
- Do not expose protected calculations
- Respect watermarking and attribution

## 📄 License

PROPRIETARY - See LICENSE file for details.

## 🤝 Support

- **Issues:** https://github.com/bickfordd-bit/hvpe-cloud-portal/issues
- **Email:** bickfordd@gmail.com
- **Docs:** https://bickford.tech

## 🚀 Roadmap

- [ ] Multi-language support
- [ ] Streaming responses
- [ ] Enhanced reality acceleration metrics
- [ ] Integration with HVPE trading engine
- [ ] OPTR opportunity scoring
- [ ] Bickford mode runtime configuration

---

**Built by Bickford Technologies** 🚀  
_Intent → Reality, Accelerated._
