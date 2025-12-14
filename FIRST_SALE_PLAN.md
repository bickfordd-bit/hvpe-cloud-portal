# HVPE Cloud Portal — First Sale Readiness Plan

**Target**: Close first sale within 2-3 weeks
**Strategy**: Deliver working demo + basic production deployment

## MVP Scope (First Sale)

### ✅ Must Have (Week 1-2)
1. **Working OPTR Pipeline**
   - ✅ Document ingestion from Opportunity records
   - ✅ OpenAI embeddings generation
   - ✅ Simple vector matching (cosine similarity)
   - ✅ Requirement scoring (0-100 scale)
   - ✅ Trace logging for transparency

2. **Demo-Ready UI**
   - ✅ Upload opportunity (title, description, requirements)
   - ✅ Run analysis button
   - ✅ Real-time progress display
   - ✅ Results with scored requirements
   - ✅ Export results (PDF/JSON)

3. **Minimal Infrastructure**
   - ✅ Deployed to Vercel/AWS with HTTPS
   - ✅ Basic error handling (user-friendly messages)
   - ✅ Structured logging (Winston to file/console)
   - ✅ Environment validation on startup

### 🟡 Should Have (Week 2-3)
4. **Authentication**
   - ✅ Basic JWT auth (NextAuth.js)
   - ✅ User signup/login flow
   - ✅ API route protection

5. **Monitoring Basics**
   - ✅ /api/health endpoint
   - ✅ Error tracking (Sentry free tier)
   - ✅ Basic usage metrics (runs per day)

6. **Documentation**
   - ✅ README with setup instructions
   - ✅ API endpoint documentation
   - ✅ Sales demo script

### 🟢 Nice to Have (Post-Sale)
7. Vector database (start with in-memory, migrate to Pinecone later)
8. Caching layer (Redis)
9. Rate limiting
10. Comprehensive test suite

---

## Week 1: Core Pipeline (5 days)

### Day 1-2: Processor Foundation
- [ ] Create `src/lib/optr/processor.ts` with pipeline stages
- [ ] Create `src/lib/optr/embeddings.ts` for OpenAI integration
- [ ] Create `src/lib/optr/scoring.ts` for requirement matching
- [ ] Wire into `/api/optr/opportunities/[id]/run/route.ts`

### Day 3: Vector Matching
- [ ] Implement in-memory vector store (start simple)
- [ ] Add cosine similarity calculation
- [ ] Test with sample opportunities

### Day 4: Logging & Error Handling
- [ ] Install Winston for structured logging
- [ ] Add trace logging to each pipeline stage
- [ ] Add user-friendly error messages
- [ ] Create `/api/health` endpoint

### Day 5: Integration Testing
- [ ] Test full pipeline with real data
- [ ] Fix bugs and edge cases
- [ ] Optimize for demo scenarios

---

## Week 2: Production Deploy (5 days)

### Day 6-7: Authentication
- [ ] Install NextAuth.js
- [ ] Configure JWT provider
- [ ] Protect `/api/optr/*` routes
- [ ] Add login/signup UI

### Day 8: Monitoring
- [ ] Install Sentry (free tier)
- [ ] Add error tracking to API routes
- [ ] Create basic Grafana dashboard (optional)

### Day 9: Deployment
- [ ] Optimize Dockerfile
- [ ] Deploy to Vercel or AWS
- [ ] Configure environment variables
- [ ] Test production deployment

### Day 10: Documentation & Demo Prep
- [ ] Update README with deployment instructions
- [ ] Create sales demo script
- [ ] Record demo video
- [ ] Prepare sample opportunities

---

## Week 3: Sales Support (5 days)

### Day 11-12: Polish & Bug Fixes
- [ ] UI refinements based on feedback
- [ ] Performance optimization
- [ ] Add export functionality (PDF/JSON)

### Day 13-14: Sales Materials
- [ ] Create pitch deck with screenshots
- [ ] Document pricing model
- [ ] Prepare onboarding guide

### Day 15: First Demo
- [ ] Schedule demo with prospect
- [ ] Run through demo script
- [ ] Gather feedback
- [ ] Close sale 🎉

---

## Technical Shortcuts (For Speed)

### In-Memory Vector Store
Instead of Pinecone/pgvector, use simple in-memory storage:

```typescript
// src/lib/optr/vectorStore.ts
const vectors = new Map<string, { embedding: number[], metadata: any }>();

export function storeVector(id: string, embedding: number[], metadata: any) {
  vectors.set(id, { embedding, metadata });
}

export function searchVectors(query: number[], topK: number) {
  const results = Array.from(vectors.entries()).map(([id, data]) => ({
    id,
    score: cosineSimilarity(query, data.embedding),
    metadata: data.metadata,
  }));
  return results.sort((a, b) => b.score - a.score).slice(0, topK);
}
```

### Simplified Scoring
Start with basic keyword matching + embedding similarity:

```typescript
export function scoreRequirement(
  requirement: string,
  documents: Document[]
): number {
  const keywordScore = documents.some(d => d.text.includes(requirement)) ? 50 : 0;
  const embeddingScore = maxSimilarity(requirement, documents); // 0-50
  return Math.min(100, keywordScore + embeddingScore);
}
```

### Mock Background Processing
For demo, run synchronously (add async later):

```typescript
export async function runOPTR(opportunityId: string): Promise<RunResult> {
  // No queues/workers needed for first sale
  return await processOpportunitySync(opportunityId);
}
```

---

## Demo Script

### Setup (Before Demo)
1. Pre-create 2-3 sample opportunities with known good results
2. Have one "upload new opportunity" ready to show live
3. Test internet connection and API keys

### Demo Flow (15 minutes)
1. **Login** (30 seconds)
   - Show secure authentication

2. **Dashboard** (1 minute)
   - Show list of existing opportunities
   - Highlight status (analyzed, pending)

3. **Upload New Opportunity** (3 minutes)
   - Paste RFP text (pre-prepared)
   - Show requirement extraction
   - Click "Run Analysis"

4. **Real-Time Progress** (2 minutes)
   - Show trace logs updating
   - Explain each stage (ingestion → embeddings → matching → scoring)

5. **Results** (5 minutes)
   - Show scored requirements (green/yellow/red)
   - Highlight coverage % (e.g., "87% match")
   - Show top matching documents
   - Export to PDF

6. **Q&A** (3 minutes)
   - Answer technical questions
   - Discuss pricing/timeline

### Key Talking Points
- "Reduces RFP analysis time from 4 hours to 4 minutes"
- "AI-powered matching finds hidden opportunities"
- "Transparent scoring — see why each requirement matches"
- "Enterprise-ready: secure, scalable, SOC2 compliant" (roadmap)

---

## Success Metrics

### Technical KPIs
- Pipeline execution time: <60 seconds for typical opportunity
- Accuracy: >80% match rate on test cases
- Uptime: >99% during demo period
- Error rate: <1% of runs

### Business KPIs
- First demo scheduled: Week 3
- First sale closed: Within 30 days
- Contract value: $5k-25k (annual)

---

## Post-Sale Priorities

### Immediate (Month 1)
1. Migrate to Pinecone for vector storage
2. Add proper background job processing
3. Implement rate limiting
4. Write integration tests (80% coverage)

### Near-Term (Month 2-3)
5. Add caching layer (Redis)
6. Database optimization (indexes, pooling)
7. Comprehensive monitoring (DataDog/New Relic)
8. API documentation (OpenAPI)

### Long-Term (Month 4+)
9. Multi-tenant support
10. Advanced analytics dashboard
11. Custom model fine-tuning
12. Enterprise SSO integration

---

## Risk Mitigation

### Technical Risks
| Risk | Mitigation | Owner |
|------|-----------|-------|
| OpenAI API fails during demo | Cache sample responses, fallback mode | Dev |
| Slow embedding generation | Pre-compute demo embeddings | Dev |
| UI bug during demo | Test demo script 3x before | Dev |
| Production deployment issues | Deploy 48h before demo | DevOps |

### Business Risks
| Risk | Mitigation | Owner |
|------|-----------|-------|
| Prospect has different requirements | Gather requirements before demo | Sales |
| Pricing concerns | Prepare 3 tier options | Sales |
| Security/compliance questions | Prepare FAQ document | Sales/Legal |

---

## Next Steps

1. **Today**: Scaffold `src/lib/optr/processor.ts` and wire into run route
2. **Tomorrow**: Integrate OpenAI embeddings API
3. **Day 3**: Implement scoring and vector matching
4. **Day 4**: Add logging and error handling
5. **Day 5**: End-to-end testing with real data

**Command to start**:
```bash
npm install winston openai zod
git checkout -b feature/optr-mvp
# Then scaffold the processor (see next commit)
```

---

## Budget

### Development (Week 1-3)
- **Engineering time**: 120 hours × $100/hr = $12,000
- **Testing**: 20 hours × $75/hr = $1,500
- **Total labor**: $13,500

### Infrastructure (First Month)
- **Vercel Pro**: $20/month
- **OpenAI API**: $50-200/month (usage-based)
- **Sentry**: $0 (free tier, <5k events)
- **Domain/SSL**: $15/month
- **Total**: $85-235/month

### Sales & Marketing
- **Demo prep**: $500 (materials, video recording)
- **Travel** (if needed): $1,000-2,000
- **Total**: $1,500-2,500

**Grand Total**: $15,000-16,000 to first sale

---

## Conclusion

This plan focuses on **delivering value fast** rather than building everything. The goal is to:
1. Prove the OPTR concept works (functional demo)
2. Close the first sale (revenue validation)
3. Use customer feedback to prioritize Phase 2 features

**Key principle**: Ship fast, iterate based on real customer needs.

**Target close date**: 3 weeks from today 🎯
