# HVPE Cloud Portal — 10 New Sales Cycle Scenarios

**Last Updated**: 2025-12-14  
**Purpose**: Additional real-world sales scenarios to train team and refine process  
**Use**: Role-playing, objection handling, deal structure optimization

---

## Scenario 1: "Skeptical Sam" — CIO Wants Proof of Security

### Customer Profile
- **Name**: Sam Chen
- **Title**: CIO
- **Company**: SecureGov Contractors Inc.
- **Revenue**: $75M annually
- **Pain**: Burned by previous AI tool (data breach in 2023)
- **Objection**: "How do I know our RFPs won't leak to competitors?"

### Timeline: 60 Days (Discovery → Close)

---

### Day 1: Cold Email (LinkedIn)

**From**: Your SDR  
**Subject**: Question about SecureGov's data security approach

```
Hi Sam,

I noticed SecureGov's CMMC Level 2 certification announcement - congrats!

Quick question: How do you currently ensure RFP data stays secure when 
your team analyzes proposals?

Most contractors we work with worry about cloud AI tools potentially 
exposing sensitive contract information.

OPTR addresses this with SOC2 Type II + optional on-premise deployment 
for classified work.

Worth a 20-minute conversation?

Best,
[Your SDR]
```

**Sam's Response** (3 days later):
```
We don't use cloud tools for RFPs. Everything stays on-premise.

What's your security model? Need full details before I'll consider.
```

---

### Day 5: Technical Deep-Dive Call (45 minutes)

**Attendees**: Sam (CIO), Your Security Engineer, You (AE)

**Sam**: "Walk me through your data flow. Where does our RFP data go?"

**Your Security Engineer**: 
```
Great question. Let me show you our architecture:

1. Data ingestion: Your RFP uploads are encrypted in transit (TLS 1.3)
2. Storage: Encrypted at rest (AES-256) in your dedicated database partition
3. Processing: Embeddings generated in isolated containers (no data sharing between customers)
4. Vector DB: Your data is logically separated (tenant isolation)
5. Access control: Role-based (only your team sees your data)

We're SOC2 Type II certified. Here's our security whitepaper.
```

**Sam**: "What about OpenAI? You send our data to OpenAI for embeddings?"

**Your Security Engineer**:
```
Yes, but with safeguards:
- We use OpenAI's API with BAA (Business Associate Agreement)
- OpenAI doesn't train models on customer data (contractually prohibited)
- We can deploy on-premise if you prefer (no external API calls)

For classified work, we offer air-gapped deployment:
- Docker container runs on your infrastructure
- Embeddings model runs locally (no internet connection)
- Vector DB on-premise (pgvector on your Postgres)
- Zero telemetry / phone-home
```

**Sam**: "How much for on-premise?"

**You**: "One-time setup: $100K. Annual support: $30K. Your data never leaves your network."

**Sam**: "Too expensive. What about FedRAMP?"

**You**: 
```
We're in the FedRAMP authorization process (JAB P-ATO expected Q2 2026).

For now, we offer FedRAMP-equivalent controls:
- Deploy in AWS GovCloud (IL4/IL5)
- FIPS 140-2 validated encryption
- Continuous monitoring (ConMon)
- Annual penetration testing (results shared)

Price: $15K/month (2× premium over standard SaaS)
```

**Sam**: "Let me review your security docs and get back to you."

**Result**: ✅ Security review scheduled (Day 15)

---

### Day 15: Security Review Meeting (90 minutes)

**Attendees**: Sam (CIO), Sam's Security Architect, Your CISO, You

**Sam's Architect**: "I reviewed your SOC2 report. Few questions..."

**Q1**: "What's your incident response time SLA?"
**A**: "Critical incidents: 1 hour acknowledgment, 4 hours resolution. We'll add this to your contract."

**Q2**: "What happens if there's a breach?"
**A**: "We carry $10M cyber insurance. Plus, contractual liability for breach notification within 24 hours."

**Q3**: "Can we audit your code?"
**A**: "For enterprise customers, yes. We provide source code escrow + annual security code review."

**Sam's Architect**: "Impressed. I'll recommend approval."

**Sam**: "Okay. Send me a pilot proposal. 90 days, 5 users, full security features."

**Result**: ✅ Pilot proposal sent (Day 20)

---

### Day 30: Pilot Kickoff

**Pilot Terms**:
- Duration: 90 days
- Users: 5 proposal writers
- Pricing: $5,000 for pilot (applied to annual contract if they convert)
- Success criteria: 
  - Zero security incidents
  - 30%+ time savings validated
  - Pass internal security audit

---

### Day 60: Mid-Pilot Check-In

**Usage Stats**:
- 12 OPTR runs completed
- 0 security incidents
- Average time savings: 37.2 hours per proposal (93% reduction)
- User satisfaction: 4.8/5

**Sam**: "Team loves it. Security audit passed. What's the annual price?"

**You**: 
```
Based on your usage:
- Mid-Market tier: $7,500/month × 12 = $90,000/year
- Includes: Unlimited runs, 20 user seats, priority support
- Less $5K pilot credit = $85,000 first year

Add-ons available:
- FedRAMP deployment: +$180K/year (+$15K/month)
- On-premise option: +$130K/year ($100K setup + $30K support)

Which deployment model do you prefer?
```

**Sam**: "Standard SaaS is fine. We'll add FedRAMP next year when you have the authorization."

---

### Day 90: Pilot Complete → Contract Signed

**Final Terms**:
- Standard SaaS: $85,000/year (first year with credit)
- Year 2+: $90,000/year
- Contract: 3-year commitment
- SLA: 99.9% uptime, 4-hour critical incident response
- Security: SOC2 Type II annual audit (reports shared)
- Expansion option: FedRAMP upgrade available when authorized

**Sam**: "Approved. Let's get the contract signed."

**Deal Metrics**:
- Sales cycle: 90 days (discovery → close)
- ACV: $85,000 (Year 1), $90,000 (Year 2+)
- CAC: $12,000 (security review + pilot)
- LTV: $270,000 (3-year contract)
- LTV:CAC: 22.5:1

**Key Lesson**: Security-conscious customers need deep technical validation. Invest in security docs upfront.

---

## Scenario 2: "Frugal Fran" — Startup on Tight Budget

### Customer Profile
- **Name**: Fran Martinez
- **Title**: Founder/CEO
- **Company**: AgileDefense (startup, 2 years old)
- **Revenue**: $2M annually
- **Employees**: 8 (no dedicated proposal staff)
- **Pain**: Can't afford $800/month ("That's 10% of our OpEx!")
- **Objection**: "Too expensive for a startup"

### Timeline: 15 Days (Discovery → Close with Discount)

---

### Day 1: Inbound Demo Request (Website)

**Fran's Form Submission**:
```
Company: AgileDefense
Revenue: $2M
Employees: 8
Use case: "Need to bid on more contracts but don't have time"
Budget: $200-500/month
```

**Your SDR Response** (same day):
```
Hi Fran,

Thanks for your interest! I see you're looking for proposal acceleration.

Quick clarification: How many proposals do you bid on per year?

Our pricing starts at $800/month, but we have startup programs for 
companies under $5M revenue.

Available for a 20-minute call tomorrow?

Best,
[Your SDR]
```

**Fran's Reply**:
```
We bid on ~6-8 proposals/year. $800/month is 48% of our target profit margin!

Can you do $300/month? I can't justify more.
```

---

### Day 2: Discovery Call (30 minutes)

**You**: "Fran, walk me through your proposal process today."

**Fran**: 
```
It's chaos. I'm the CEO but I also write proposals (no budget for writers).

Each RFP takes me 40-50 hours. I bill at $200/hour as a consultant, 
so every proposal costs me $8-10K in opportunity cost.

I turned down 10 opportunities last year because I didn't have time.
```

**You**: "Let's do the math together..."

**ROI Calculation** (live on screen):
```
Your current state:
- Proposals: 6/year
- Time per proposal: 40 hours
- Opportunity cost: $200/hour
- Total annual cost: 6 × 40 × $200 = $48,000

With OPTR:
- Time per proposal: 5 hours (saving 35 hours)
- Annual time saved: 6 × 35 = 210 hours
- Value: 210 × $200 = $42,000

OPTR cost: $800/month × 12 = $9,600
Net benefit: $42,000 - $9,600 = $32,400

Plus, you can bid on those 10 missed opportunities:
- Additional proposals: 10
- Win rate (conservative): 20%
- Expected wins: 2 contracts
- Avg contract value: $500K
- Profit margin: 20%
- Additional profit: 2 × $500K × 20% = $200,000

Total benefit: $32,400 + $200,000 = $232,400
ROI: 2,421%
```

**Fran**: "Okay, the math works. But I still can't afford $9,600 upfront. Cash flow is tight."

**You**: "What if we structured it differently?"

---

### Day 3: Creative Deal Structure

**Proposal**:
```
Startup Accelerator Program:

Year 1 Pricing (discounted):
- $300/month × 12 = $3,600/year
- Conditions:
  1. You must be <$5M revenue (verified annually)
  2. You give us a testimonial + case study after 6 months
  3. Logo on our website as customer
  4. You graduate to standard pricing ($800/month) at $5M revenue

Year 2+ Pricing:
- If revenue <$5M: $400/month ($4,800/year)
- If revenue >$5M: $800/month ($9,600/year)

Why we offer this:
- We want startups to grow with OPTR
- Your success = our success (you'll buy more seats as you scale)
- Your testimonial helps us sign more startups
```

**Fran**: "This is perfect. Can I start immediately?"

**You**: "Yes. I'll send the contract today. Welcome to OPTR!"

---

### Day 5: Contract Signed

**Final Terms**:
- Year 1: $3,600 ($300/month)
- Includes: 10 OPTR runs/month, 3 user seats, email support
- Testimonial due: Month 6
- Auto-upgrade to $800/month when revenue >$5M

**Deal Metrics**:
- Sales cycle: 5 days (fastest!)
- ACV: $3,600 (Year 1)
- CAC: $500 (mostly self-service)
- Expected LTV: $50,000 (assumes growth to $5M+ in Year 3)
- LTV:CAC: 100:1

**Key Lesson**: Don't lose deals over price. Create tiered programs for budget-conscious customers. Land & expand strategy.

---

## Scenario 3: "Demanding Donna" — Wants Custom Features

### Customer Profile
- **Name**: Donna Williams
- **Title**: VP of Proposals
- **Company**: MegaCorp Defense
- **Revenue**: $1.2B annually
- **Employees**: 2,000 (50 proposal writers)
- **Pain**: "Your product is 80% of what we need. Missing 20% is a dealbreaker."
- **Objection**: "We need custom workflows. Can you build them?"

### Timeline: 120 Days (Discovery → Custom Dev → Close)

---

### Day 1: Inbound Referral (From Investor)

**Investor Email**:
```
[Your name],

Meet Donna from MegaCorp. They're looking for proposal automation.

$1.2B revenue, 50 proposal writers. Could be a $500K+ deal.

Donna - meet [Your name] from OPTR. They're building AI for proposals.

[Investor]
```

**Your Response**:
```
Hi Donna,

Thanks for the intro, [Investor]!

Donna, I'd love to learn about MegaCorp's proposal process. 

What's your biggest pain point today?

Available for a call next week?

Best,
[Your name]
```

---

### Day 10: Discovery Call (60 minutes)

**Donna**: 
```
We've looked at Loopio, RFPIO, Qvidian. None fit our workflow.

Here's what we need:
1. Integration with our custom CRM (not Salesforce)
2. Approval workflows (5-level approval chain)
3. Custom compliance templates (we have 50+ templates)
4. Multi-language support (proposals in English, German, Japanese)
5. Audit trail (SOX compliance required)

Can OPTR do this?
```

**You**: "Great requirements. Let me break this down..."

**Response**:
```
Out-of-the-box today:
✓ Compliance templates (we have 10 standard templates, can add yours)
✓ Audit trail (all actions logged with timestamps)
✓ Multi-language (our embeddings support 30+ languages)

Requires custom development:
- CRM integration (need API docs)
- 5-level approval workflow (need workflow diagram)

Estimated custom dev: 6-8 weeks, $150K one-time

Would you be open to a pilot with standard features + custom dev roadmap?
```

**Donna**: "Maybe. Show me a demo first."

---

### Day 20: Demo (Live with Donna's Team)

**Attendees**: Donna, 3 proposal managers, 2 IT architects, You

**Demo**: (using MegaCorp's real RFP from 2023)
```
1. Upload 200-page DoD RFP
2. Run OPTR → extract 150 requirements in 3 minutes
3. Show compliance matrix (auto-generated)
4. Export to their custom Word template
```

**Proposal Manager**: "This would save us 20 hours per proposal. We do 200/year. That's 4,000 hours."

**IT Architect**: "What about the CRM integration? We can't adopt without it."

**You**: "Let's scope the integration. Can you share your CRM API docs?"

---

### Day 40: Custom Development Proposal

**Scope**:
```
Phase 1 (Standard Features): 2 weeks
- Deploy OPTR for 10 pilot users
- Load 50 compliance templates
- Configure audit logging

Phase 2 (Custom Integration): 6 weeks
- CRM API integration (bi-directional sync)
- 5-level approval workflow (configurable)
- Custom Word template export
- Multi-language UI (English, German, Japanese)

Phase 3 (Testing & Training): 2 weeks
- UAT with Donna's team
- Training for 50 users (4-hour workshop × 10 sessions)
- Documentation

Total timeline: 10 weeks
```

**Pricing**:
```
Custom Development:
- Phase 1: $0 (included in pilot)
- Phase 2: $150,000 (one-time)
- Phase 3: $20,000 (training)
Total custom dev: $170,000

Annual Subscription:
- Enterprise tier: $50,000/month × 12 = $600,000/year
- Includes:
  - Unlimited users (50 proposal writers)
  - Unlimited OPTR runs
  - Priority support (1-hour SLA)
  - Dedicated CSM
  - Quarterly business reviews
  - Custom feature development (20 hours/quarter included)

Year 1 total: $170,000 (custom dev) + $600,000 (subscription) = $770,000
Year 2+: $600,000/year
```

**Donna**: "Let me get CFO approval. If approved, when can you start?"

---

### Day 60: CFO Approval (with negotiation)

**CFO**: "Too expensive. Can you do $500K total for Year 1?"

**You**: "Let's restructure..."

**Revised Proposal**:
```
Year 1:
- Custom dev: $150,000 (reduced from $170K, training now self-service)
- Subscription: $350,000 (50% discount, first 6 months)
- Total Year 1: $500,000

Year 2:
- Subscription: $600,000 (full price)

Rationale:
- You get 6 months at 50% off to prove value
- We get enterprise reference customer
- Both win

Deal?
```

**CFO**: "Deal. Send the contract."

---

### Day 120: Contract Signed (After Custom Dev Complete)

**Final Terms**:
- Year 1: $500,000
- Year 2+: $600,000/year
- 3-year commitment
- Custom features delivered
- 50 users trained

**Deal Metrics**:
- Sales cycle: 120 days
- ACV: $500,000 (Year 1), $600,000 (Year 2+)
- CAC: $50,000 (custom dev scoping + demos)
- LTV: $1,800,000 (3-year contract)
- LTV:CAC: 36:1

**Key Lesson**: Enterprise deals require custom work. Price it separately. Use discounts strategically to close.

---

## Scenario 4: "Tire-Kicker Tim" — Endless Meetings, No Decision

### Customer Profile
- **Name**: Tim Johnson
- **Title**: Director of Business Development
- **Company**: SlowGov Contractors
- **Revenue**: $30M annually
- **Pain**: Analysis paralysis (been "evaluating tools" for 18 months)
- **Objection**: "Need to see 5 more demos before deciding"

### Timeline: 90+ Days (Still No Decision - Disqualified)

---

### Day 1: Inbound Demo Request

**Tim's Form**:
```
Company: SlowGov
Use case: Proposal automation
Timeline: Evaluating options
Budget: TBD
```

**Red Flag**: No urgency, vague budget

---

### Day 5: Initial Call (30 minutes)

**You**: "Tim, what's driving your search for a proposal tool?"

**Tim**: "We've been looking for 18 months. Evaluated Loopio, RFPIO, PandaDoc. None are perfect."

**You**: "What's your decision criteria?"

**Tim**: "Need to compare features side-by-side. Can you send a detailed feature list?"

**Red Flag**: Shopping, not buying. No clear decision process.

**You**: "Happy to. Before I send that, who else is involved in the decision?"

**Tim**: "Me, my boss (VP), CFO, IT, and our proposal team (5 people). Everyone needs to sign off."

**Red Flag**: 8+ stakeholders, no champion.

**You**: "Got it. What's your timeline to make a decision?"

**Tim**: "No rush. Maybe Q2 2026."

**Red Flag**: 6+ months out, no urgency.

**Decision**: Qualify out or nurture long-term?

---

### Day 10: Send Feature Comparison (but lower priority)

**Email**:
```
Hi Tim,

Here's the feature comparison you requested: [PDF attached]

When you're ready to move forward, I'm happy to do a live demo with your team.

In the meantime, here are some resources:
- Case study: How MidSizeCorp saved 4,000 hours/year
- ROI calculator: See your potential savings
- Video demo: 5-minute walkthrough

Let me know when you're ready for next steps.

Best,
[Your name]
```

**Tim's Response** (2 weeks later):
```
Thanks. Can we schedule a demo for next month? Need to coordinate 
with my boss, CFO, IT lead, and 5 proposal writers.
```

**You**: "Sure. Does everyone have availability on [date]?"

---

### Day 40: Demo #1 (with 8 people)

**Demo goes well. Everyone loves it.**

**VP**: "This looks great. Tim, schedule a follow-up to discuss pricing."

**Tim**: "Will do."

---

### Day 60: Follow-up Call (Pricing Discussion)

**You**: "Based on your team size, Mid-Market tier is $7,500/month."

**Tim**: "Let me check with CFO and get back to you."

---

### Day 75: CFO Says "Need to see 2 more vendors"

**Tim**: "CFO wants us to evaluate Loopio and RFPIO before deciding. Can you send a comparison?"

**You**: "Happy to. What's your decision timeline now?"

**Tim**: "Probably Q3 2026."

**Decision**: Disqualify. Too much effort, no urgency.

---

### Day 90: Final Email (Disqualify)

**Your Email**:
```
Hi Tim,

I appreciate your time over the past 90 days. It sounds like you're 
still in evaluation mode and don't have urgency to make a decision.

I'm going to pause our conversations for now. When you're ready to 
move forward (with a clear timeline and decision process), I'm happy 
to re-engage.

In the meantime, here's our self-service trial: [link]

You can sign up and test OPTR on your own. If it works, we can fast-track 
a contract.

Best,
[Your name]
```

**Outcome**: Tim never responds. Deal lost.

**Lesson**: Qualify hard. Don't spend 90 days on tire-kickers. BANT (Budget, Authority, Need, Timeline) must be clear.

---

## Scenario 5: "Expansion Emily" — Existing Customer Wants More

### Customer Profile
- **Name**: Emily Rodriguez
- **Title**: Proposal Manager
- **Company**: GrowthCo (existing OPTR customer, 6 months)
- **Current Plan**: Small Team ($2,500/month, 5 seats)
- **Pain**: "Team loves OPTR. Need 10 more seats + competitive intelligence add-on."
- **Opportunity**: Upsell + cross-sell

### Timeline: 7 Days (Request → Close)

---

### Day 1: Inbound Email from Emily

**Email**:
```
Hi [Your name],

OPTR has been a game-changer for our team. We're bidding on 2× more 
contracts and our win rate is up 12%.

I need to add 10 more seats (we hired 5 proposal writers + 5 capture managers).

Also, I saw you have a Competitive Intelligence add-on. Can we add that too?

What's the pricing?

Thanks,
Emily
```

**Your Response** (same day):
```
Hi Emily,

Thrilled to hear OPTR is working! 12% win rate improvement is fantastic.

For 10 additional seats:
- Current: 5 seats @ $2,500/month (Small Team)
- Upgrade to Mid-Market: 20 seats @ $7,500/month
- Net increase: $5,000/month

Competitive Intelligence add-on:
- Track up to 20 competitors: $10,000/month
- Includes: SAM.gov monitoring, win rate analysis, alerts

Total new monthly cost: $17,500/month
Annual: $210,000

OR, we can bundle:
- Enterprise tier (unlimited seats): $25,000/month
- Includes: Competitive Intel (50 competitors), dedicated CSM, custom features

Which works better for your budget?

Available for a call tomorrow to discuss?

Best,
[Your name]
```

---

### Day 2: Upsell Call (20 minutes)

**Emily**: "I love the Enterprise tier. But $25K/month is 10× our current spend. Need CFO approval."

**You**: "Totally understand. Let me show you the ROI..."

**ROI Calculation**:
```
Your current results (6 months with OPTR):
- Win rate increase: 12% (from baseline)
- Additional contract wins: ~3 contracts (estimated)
- Avg contract value: $5M
- Profit margin: 15%
- Additional profit: 3 × $5M × 15% = $2.25M

Your investment:
- Current: $2,500/month × 6 = $15,000
- ROI: $2.25M / $15K = 150:1

With Enterprise tier:
- Expected: 10 more competitive bids/year (better intel)
- Additional wins: 10 × 25% = 2-3 more contracts
- Additional profit: $2.25M - $3.75M
- New investment: $25K/month × 12 = $300K/year
- ROI: $3M / $300K = 10:1

CFO will approve a 10:1 ROI.
```

**Emily**: "You're right. Let me present this to CFO."

---

### Day 5: CFO Approval

**Emily**: "CFO approved! Let's do Enterprise tier. When can we start?"

**You**: "Immediately. I'll send the contract today. Welcome to Enterprise!"

---

### Day 7: Contract Amendment Signed

**New Terms**:
- Plan: Enterprise tier
- Price: $25,000/month ($300,000/year)
- Users: Unlimited (currently 15, can grow to 50+)
- Add-ons: Competitive Intel (50 competitors), Dedicated CSM
- Contract: Amend existing contract (add 2.5 years to align with original term)

**Deal Metrics**:
- Upsell cycle: 7 days (request → close)
- Old ACV: $30,000
- New ACV: $300,000
- Expansion revenue: $270,000
- CAC: $500 (mostly self-service, existing relationship)
- LTV:CAC: 540:1 (expansion deals are gold!)

**Key Lesson**: Expansion deals are fastest and highest ROI. Nurture existing customers. Make upsells easy.

---

## Scenario 6: "Competitive Charlie" — Switching from Competitor

### Customer Profile
- **Name**: Charlie Brown
- **Title**: VP of Business Development
- **Company**: SwitchCo
- **Revenue**: $60M annually
- **Current Tool**: Loopio (paying $60K/year, unhappy)
- **Pain**: "Loopio is too manual. AI features don't work. Support is terrible."
- **Objection**: "We just signed a 2-year contract with Loopio. Can't switch yet."

### Timeline: 45 Days (Discovery → Competitive Displacement)

---

### Day 1: Conference Booth Meeting (APMP)

**Charlie approaches your booth**:

**Charlie**: "I'm using Loopio. Not happy. What makes OPTR different?"

**You**: "What's not working with Loopio?"

**Charlie**: 
```
1. Their "AI" is just keyword search (not semantic)
2. Manual tagging takes forever (100+ hours to set up library)
3. Support is slow (3-day response times)
4. No competitive intelligence (we build it manually)
```

**You**: "OPTR solves all of those. Want to see a side-by-side?"

**Charlie**: "Yes, but I'm stuck in a Loopio contract until Q4 2025. Can't switch now."

**You**: "What if we made switching painless? Here's what we offer..."

**Switching Incentive**:
```
1. We'll pay your Loopio early termination fee (up to $30K)
2. Free migration (we'll import your Loopio library)
3. First 3 months at 50% off
4. If you're not happy after 90 days, we refund everything

Total risk: $0
```

**Charlie**: "Interesting. Can you show me a demo with our data?"

---

### Day 5: Proof-of-Concept (with Charlie's Data)

**Setup**:
- Export Charlie's Loopio library (500 past proposals)
- Import into OPTR (takes 4 hours)
- Run side-by-side test: Loopio vs. OPTR

**Test**: "Find past performance for cloud migration projects"

**Loopio**:
- Manual tagging required (Charlie's team spent 20 hours tagging)
- Keyword search: "cloud" + "migration"
- Results: 12 documents (50% false positives)
- Time: 5 minutes to run search, 30 minutes to review results

**OPTR**:
- No manual tagging (semantic search)
- Query: "Find past performance for cloud migration projects"
- Results: 18 documents (95% precision)
- Time: 30 seconds to run search, 5 minutes to review results

**Charlie**: "Wow. This is 6× faster. How much does OPTR cost?"

---

### Day 10: Pricing Discussion

**You**: "Based on your team size (10 proposal writers), Mid-Market tier is $7,500/month."

**Charlie**: "That's $30K more per year than Loopio. Why should I pay more?"

**You**: "Let's compare total cost of ownership..."

**TCO Comparison**:
```
Loopio (Annual):
- Subscription: $60,000
- Setup/tagging: 100 hours @ $100/hour = $10,000
- Manual competitive intel: 200 hours @ $100/hour = $20,000
- Total: $90,000

OPTR (Annual):
- Subscription: $90,000 ($7,500 × 12)
- Setup: $0 (we migrate your library for free)
- Competitive intel: Included (automated)
- Total: $90,000

Same price, but OPTR saves you:
- 100 hours (no tagging)
- 200 hours (no manual competitive intel)
- Total: 300 hours @ $100/hour = $30,000 additional savings

Net benefit: $30,000/year
```

**Charlie**: "Okay, but I still have 9 months left on Loopio contract. $30K early termination fee."

**You**: "We'll cover it. Here's the deal..."

**Final Offer**:
```
Year 1:
- OPTR subscription: $90,000
- Less: First 3 months 50% off: -$22,500
- Less: Loopio termination fee (we pay): -$30,000
- Your net cost: $37,500 (first year)

Year 2+:
- Full price: $90,000/year

Why we do this:
- We get a competitive win (reference customer)
- You get immediate value (no waiting for Loopio contract to expire)
```

**Charlie**: "Deal. When can I start?"

---

### Day 15: Contract Signed

**Terms**:
- Year 1: $37,500 (after credits)
- Year 2+: $90,000/year
- 2-year commitment
- Migration: Completed within 2 weeks
- Loopio termination: OPTR pays directly to Loopio

**Deal Metrics**:
- Sales cycle: 15 days (conference → close)
- ACV: $37,500 (Year 1), $90,000 (Year 2+)
- CAC: $35,000 (termination fee + credits)
- LTV: $270,000 (3-year expected retention)
- LTV:CAC: 7.7:1

**Key Lesson**: Competitive displacement requires incentives. Pay early termination fees. De-risk switching.

---

## Scenario 7: "Referral Rachel" — Warm Intro from Existing Customer

### Customer Profile
- **Name**: Rachel Kim
- **Title**: Director of Proposals
- **Company**: NewCorp
- **Revenue**: $40M annually
- **Referrer**: Emily (from Scenario 5, existing customer)
- **Pain**: "Emily says OPTR is amazing. I need to see it."

### Timeline: 10 Days (Intro → Close)

---

### Day 1: Warm Email Intro (from Emily)

**Emily's Email**:
```
Rachel,

Meet [Your name] from OPTR. Their tool has been a game-changer for us.

We're bidding on 2× more contracts and our win rate is up 12% since using OPTR.

[Your name] - Rachel runs proposals at NewCorp. They have similar challenges to us.

I'll let you two connect!

Emily
```

**Your Response** (same day):
```
Hi Rachel,

Thanks for the intro, Emily!

Rachel, Emily mentioned you're looking to accelerate your proposal process. 

I'd love to show you what's working for Emily's team.

Available for a 20-minute call this week?

Best,
[Your name]
```

**Rachel** (responds same day):
```
Yes! Emily raves about OPTR. Can we do tomorrow at 2pm?
```

**Key Advantage**: Referral = pre-sold. Trust already established.

---

### Day 2: Discovery Call (20 minutes)

**You**: "Rachel, Emily mentioned you have similar challenges. What's your biggest pain point?"

**Rachel**: "Same as Emily. Proposals take too long. We're at capacity (can't bid on more without hiring)."

**You**: "How many proposals per year?"

**Rachel**: "~30. But we turn down 20 because we don't have time."

**You**: "With OPTR, Emily's team went from 30 to 60 proposals. Want to see how?"

**Rachel**: "Yes, show me!"

---

### Day 2: Live Demo (same call, 15 minutes)

**Demo** (using NewCorp's real RFP):
```
1. Upload RFP (2 minutes)
2. Run OPTR (3 minutes)
3. Show results (compliance matrix, gap analysis)
```

**Rachel**: "This is exactly what Emily described. How much?"

**You**: "For your team size (5 writers), Small Team tier is $2,500/month."

**Rachel**: "That's what Emily pays. Can I start today?"

**You**: "Yes! I'll send the contract in 10 minutes."

---

### Day 2: Contract Sent (same day)

**Terms**:
- Small Team: $2,500/month ($30,000/year)
- 5 user seats
- Email support
- 14-day free trial (to test before committing)

**Rachel**: "Approved. Sending signed contract back."

---

### Day 3: Contract Signed

**Deal Metrics**:
- Sales cycle: 2 days (intro → close!)
- ACV: $30,000
- CAC: $0 (referral from existing customer)
- LTV: $90,000 (3-year expected retention)
- LTV:CAC: ∞ (infinite ROI!)

**Referral Incentive**:
- Emily gets $500 credit (1 month free)
- Rachel gets 14-day free trial
- Both win

**Key Lesson**: Referrals are gold. Incentivize existing customers to refer. Close deals in days, not months.

---

## Scenario 8: "Multi-Threaded Mike" — Complex Enterprise Sale

### Customer Profile
- **Name**: Mike Thompson (Champion)
- **Title**: Director of Capture
- **Company**: BigDefense Corp
- **Revenue**: $800M annually
- **Stakeholders**: 
  - VP of BD (Economic Buyer)
  - CIO (Technical Buyer)
  - CFO (Financial Approver)
  - 3 Capture Managers (Users)
- **Pain**: "Capture process is chaotic. Need centralized system."

### Timeline: 120 Days (Discovery → Multi-Stakeholder Approval)

---

### Day 1: Initial Meeting (with Mike - Champion)

**Mike**: "We need a capture management system. Current process is manual (emails, Excel, SharePoint)."

**You**: "Walk me through your current capture process."

**Mike** (describes 10-step process with 8 handoffs):
```
1. BD identifies opportunity (SAM.gov)
2. Capture manager assigned (manual)
3. Customer research (3 weeks)
4. Competitive analysis (2 weeks)
5. Solutioning (4 weeks)
6. Teaming (3 weeks)
7. Price-to-win (1 week)
8. Executive review (1 week)
9. Go/no-go decision (1 week)
10. RFP response (6 weeks)

Total: 21 weeks per capture
```

**You**: "OPTR can automate steps 2-7. Reduce 15 weeks to 2 weeks."

**Mike**: "Show me."

---

### Day 10: Demo (with Mike + 3 Capture Managers)

**Demo goes well. Capture Managers love it.**

**Mike**: "I'm sold. But I need buy-in from VP of BD, CIO, and CFO."

**You**: "Let's map the decision process..."

**Stakeholder Map**:
```
Champion: Mike (Director of Capture)
- Role: Drive internal adoption
- Concern: Will team actually use it?
- Need: User testimonials, training plan

Economic Buyer: VP of BD (Sarah)
- Role: Approve budget
- Concern: ROI justification
- Need: Revenue impact model

Technical Buyer: CIO (James)
- Role: Approve technical architecture
- Concern: Security, integration with existing systems
- Need: Technical deep-dive, security docs

Financial Approver: CFO (Lisa)
- Role: Final sign-off on budget
- Concern: Total cost of ownership
- Need: Multi-year cost projection

Users: 3 Capture Managers
- Role: Provide input (already on board from demo)
```

**You**: "Okay, I'll schedule separate meetings with each stakeholder. Let's start with VP of BD."

---

### Day 20: Meeting with VP of BD (Economic Buyer)

**Sarah (VP of BD)**: "Mike says OPTR will help us win more contracts. Prove it."

**You**: "Here's the data from other defense contractors..."

**ROI Model** (using Sarah's numbers):
```
Current state:
- Captures per year: 20
- Win rate: 15%
- Avg contract value: $50M
- Revenue: 20 × 0.15 × $50M = $150M

With OPTR (10% win rate improvement):
- Win rate: 25%
- Revenue: 20 × 0.25 × $50M = $250M
- Incremental revenue: $100M
- Profit margin: 15%
- Incremental profit: $15M

OPTR investment: $300K/year
ROI: $15M / $300K = 50:1
```

**Sarah**: "Impressive. If CIO and CFO approve, I'm in."

---

### Day 30: Meeting with CIO (Technical Buyer)

**James (CIO)**: "Integration requirements? Security model?"

**Your Solution Architect** (on call):
```
Integration:
- API: REST + GraphQL
- Auth: OAuth 2.0 / SAML SSO
- CRM: Salesforce, Dynamics (pre-built connectors)
- ERP: Deltek CostPoint (custom connector available)

Security:
- SOC2 Type II
- ISO 27001
- FedRAMP Moderate (in progress)
- On-premise deployment option (for classified data)

Data residency: AWS US East (GovCloud available)
```

**James**: "Good. Send me your security docs for review."

**Result**: Security review passed (Day 45)

---

### Day 60: Meeting with CFO (Financial Approver)

**Lisa (CFO)**: "What's the total cost?"

**You**: "Let me break it down..."

**3-Year TCO**:
```
Year 1:
- OPTR subscription: $300,000
- Implementation: $50,000 (data migration, training)
- Total: $350,000

Year 2:
- Subscription: $300,000

Year 3:
- Subscription: $300,000

3-Year Total: $950,000

Alternative (continue manual process):
- Labor cost: 20 captures × 15 weeks × $150/hour × 40 hours = $1,800,000/year
- 3-Year Total: $5,400,000

Net savings with OPTR: $5,400,000 - $950,000 = $4,450,000 over 3 years
```

**Lisa**: "Approved. Mike, coordinate with procurement to get the PO."

---

### Day 90: Procurement / Legal Review

**Procurement**: "We need to add standard terms (indemnification, liability caps, etc.)."

**You**: "Happy to negotiate. Here's our standard MSA..."

**(30 days of back-and-forth on contract terms)**

---

### Day 120: Contract Signed

**Final Terms**:
- Enterprise tier: $300,000/year
- 3-year commitment ($900,000 total)
- Unlimited users
- Dedicated CSM
- Custom integrations included

**Deal Metrics**:
- Sales cycle: 120 days
- ACV: $300,000
- CAC: $40,000 (demos, travel, SE time)
- LTV: $900,000 (3-year contract)
- LTV:CAC: 22.5:1

**Key Lesson**: Enterprise sales require multi-threading. Map all stakeholders. Address each stakeholder's concerns separately.

---

## Scenario 9: "Lost Deal Larry" — Competitor Won, Trying to Win Back

### Customer Profile
- **Name**: Larry Davis
- **Title**: Proposal Manager
- **Company**: LostCo
- **Revenue**: $50M annually
- **History**: Evaluated OPTR 6 months ago, chose Loopio instead
- **Pain**: "Loopio isn't working. We made a mistake."

### Timeline: 30 Days (Re-Engagement → Close)

---

### Day 1: Larry Reaches Out (Email)

**Larry's Email**:
```
Hi [Your name],

Remember me? We evaluated OPTR 6 months ago but went with Loopio.

Big mistake. Loopio is terrible. Support is slow, features don't work.

Are you still willing to work with us? Or did we burn that bridge?

Thanks,
Larry
```

**Your Response** (same day):
```
Hi Larry,

Good to hear from you! No bridge burned - we'd love to work together.

What's not working with Loopio?

Available for a call tomorrow?

Best,
[Your name]
```

---

### Day 2: Re-Discovery Call (30 minutes)

**You**: "Larry, walk me through what happened with Loopio."

**Larry**: 
```
We signed a 2-year contract. $60K/year.

Problems:
1. Setup took 3 months (they said 2 weeks)
2. Manual tagging is a nightmare (100+ hours)
3. Their AI doesn't work (just keyword search)
4. Support tickets take 1 week to resolve

We've wasted 6 months and $30K. I'm ready to switch.
```

**You**: "What's your Loopio contract situation?"

**Larry**: "18 months left. $30K early termination fee."

**You**: "Let's make switching easy..."

**Switching Offer**:
```
1. We'll pay Loopio termination fee: $30,000
2. We'll migrate your Loopio library: Free (normally $10K)
3. First 6 months at 50% off: Save $22,500
4. If unhappy after 90 days, full refund

Your net cost Year 1: $22,500 (vs. $60K with Loopio)
Savings: $37,500
```

**Larry**: "Yes! When can we start?"

---

### Day 5: Proposal Sent

**Terms**:
- Mid-Market tier: $7,500/month
- Year 1 credits:
  - Loopio termination: -$30,000 (we pay directly)
  - 50% off first 6 months: -$22,500
  - Net Year 1 cost: $67,500 - $52,500 = $15,000 (vs. $60K with Loopio)
- Year 2+: $90,000/year

**Larry**: "Approved. Send the contract."

---

### Day 30: Contract Signed (after Loopio terminated)

**Deal Metrics**:
- Re-engagement cycle: 30 days
- ACV: $15,000 (Year 1), $90,000 (Year 2+)
- CAC: $32,500 (termination fee + credits)
- LTV: $270,000 (3-year expected retention)
- LTV:CAC: 8.3:1

**Key Lesson**: Lost deals aren't dead. Stay in touch. Make switching easy (pay termination fees). Win-back customers are loyal (they won't make same mistake twice).

---

## Scenario 10: "Partnership Paul" — Channel Partner Opportunity

### Customer Profile
- **Name**: Paul Martinez
- **Title**: Partner Development Manager
- **Company**: Shipley Associates (proposal consulting firm)
- **Revenue**: $50M annually (consulting services)
- **Clients**: 200+ government contractors
- **Opportunity**: White-label OPTR for Shipley's clients

### Timeline: 90 Days (Discovery → Partnership Agreement)

---

### Day 1: Conference Introduction (APMP)

**Paul**: "I'm from Shipley. We train 500+ companies per year on proposal writing. Many ask us for software tools. We don't build software. Could we partner?"

**You**: "Absolutely. What does a partnership look like for you?"

**Paul**: 
```
Model:
- We white-label your product (Shipley branding)
- We sell to our consulting clients ($200+ companies/year)
- We provide Level 1 support (you handle Level 2)
- Revenue share: 30% to us, 70% to you

Deal size:
- Avg client: $50K-200M revenue
- Avg OPTR price: $7,500/month ($90K/year)
- Expected conversions: 20-30 clients in Year 1

Revenue potential for you:
- 25 clients × $90K × 70% = $1.575M in Year 1
```

**You**: "Interesting. Let's explore this..."

---

### Day 10: Partnership Discovery Call (60 minutes)

**You**: "Paul, walk me through Shipley's sales process."

**Paul**:
```
1. Client hires Shipley for training ($50-100K engagement)
2. We assess their proposal process
3. We recommend tools (currently: Loopio, RFPIO, PandaDoc)
4. Client buys tools separately (we don't make money on tool sales)

With OPTR partnership:
1. We recommend OPTR (branded as "Shipley ProposalOS powered by OPTR")
2. Client buys through Shipley (we invoice, you fulfill)
3. We get 30% revenue share
4. Client gets integrated solution (training + software)
```

**You**: "What's the client benefit?"

**Paul**: "Single vendor (Shipley for training + tools). Plus, our training is pre-configured in OPTR (templates, workflows)."

**You**: "Love it. What do you need from us?"

---

### Day 20: Partnership Requirements

**Paul's Requirements**:
```
1. White-label branding:
   - Logo: Shipley ProposalOS
   - Domain: optr.shipleywins.com
   - Custom welcome emails

2. Integration:
   - Shipley training content embedded in OPTR
   - Shipley templates pre-loaded
   - Shipley capture methodology built into workflows

3. Revenue share:
   - 30% to Shipley
   - Paid monthly (NET 30)

4. Support:
   - Shipley handles Level 1 (basic questions)
   - OPTR handles Level 2 (technical issues)

5. Co-marketing:
   - Joint case studies
   - Co-branded webinars
   - Shipley conference booth presence
```

**You**: "Let me build a proposal..."

---

### Day 30: Partnership Proposal

**Terms**:
```
Partnership Structure:
- Type: Reseller / white-label
- Territory: US & Canada (Shipley's markets)
- Revenue share: 70% OPTR, 30% Shipley
- Contract: 3-year exclusive (proposal consulting space)

Pricing:
- OPTR standard pricing applies
- Example: $7,500/month → Shipley earns $2,250/month per client

Onboarding:
- OPTR provides: White-label setup, Shipley template integration, training
- Timeline: 6 weeks
- Cost: $50,000 one-time (paid by Shipley)

Support:
- Tier 1 (Shipley): Email, chat (response: 24 hours)
- Tier 2 (OPTR): Technical support (response: 4 hours)

Targets (Year 1):
- Minimum: 10 clients ($900K revenue, $630K to OPTR, $270K to Shipley)
- Stretch: 30 clients ($2.7M revenue, $1.89M to OPTR, $810K to Shipley)
```

**Paul**: "Let me review with Shipley leadership."

---

### Day 60: Shipley Leadership Review

**Shipley CEO**: "We're in. Let's start with a pilot: 5 clients in Q1 2026."

**Revised Terms**:
```
Pilot (Q1 2026):
- 5 clients
- If successful (defined as: 4+ clients renew after 6 months), 
  we proceed with full partnership

Full Partnership (Q2 2026+):
- Target: 30 clients by end of Year 1
- Revenue share: 70/30 (OPTR/Shipley)
```

---

### Day 90: Partnership Agreement Signed

**Deal Metrics**:
- Partnership cycle: 90 days
- Pilot: 5 clients ($450K revenue, $315K to OPTR)
- Year 1 target: 30 clients ($2.7M revenue, $1.89M to OPTR)
- CAC per client: $500 (Shipley handles sales)
- LTV per client: $270,000 (3-year retention)
- LTV:CAC: 540:1

**Key Lesson**: Partnerships are force multipliers. Find complementary businesses (consulting firms, training companies). White-label your product. Let partners sell for you.

---

## Summary: 10 New Sales Scenarios

| Scenario | Customer | Pain | Objection | Cycle | ACV | Outcome |
|----------|----------|------|-----------|-------|-----|---------|
| 1. Skeptical Sam | CIO | Data security | "How do I know data won't leak?" | 90d | $85K | Won (after security review) |
| 2. Frugal Fran | Startup CEO | Too expensive | "$800/month is 48% of profit!" | 5d | $3.6K | Won (startup discount) |
| 3. Demanding Donna | VP Proposals | Need custom features | "Missing 20% of requirements" | 120d | $500K | Won (custom dev) |
| 4. Tire-Kicker Tim | BD Director | Analysis paralysis | "Need 5 more demos" | 90d+ | - | Lost (disqualified) |
| 5. Expansion Emily | Proposal Mgr | Need more seats | Want to upsell | 7d | $300K | Won (upsell) |
| 6. Competitive Charlie | VP BD | Unhappy with Loopio | "Stuck in contract" | 45d | $90K | Won (paid termination fee) |
| 7. Referral Rachel | Dir Proposals | Same as referrer | None | 2d | $30K | Won (referral) |
| 8. Multi-Threaded Mike | Dir Capture | Complex enterprise | Multiple stakeholders | 120d | $300K | Won (multi-threading) |
| 9. Lost Deal Larry | Proposal Mgr | Chose competitor | "Made a mistake" | 30d | $90K | Won (win-back) |
| 10. Partnership Paul | Partner Dev | Channel opportunity | Revenue share model | 90d | $1.89M | Won (partnership) |

---

## Key Lessons Learned

### Lesson 1: Security Objections
- **Tactic**: Provide detailed security docs upfront (SOC2, penetration tests)
- **ROI**: Security-conscious customers have high LTV (long retention)
- **Pricing**: Premium pricing for FedRAMP/on-premise ($15-50K/month)

### Lesson 2: Budget Objections
- **Tactic**: Create tiered pricing (startup discounts, enterprise bundles)
- **ROI**: Land & expand (start small, grow with customer)
- **Pricing**: Be flexible on Year 1, capture value in Year 2+

### Lesson 3: Feature Objections
- **Tactic**: Offer custom development (price separately)
- **ROI**: Enterprise customers pay for customization ($150K+ one-time)
- **Pricing**: Bundle custom dev into Year 1, recover in Year 2-3

### Lesson 4: Qualification
- **Tactic**: Use BANT (Budget, Authority, Need, Timeline)
- **ROI**: Disqualify tire-kickers early (save 90+ days)
- **Pricing**: Don't discount for unqualified prospects

### Lesson 5: Expansion
- **Tactic**: Make upselling easy (self-service, automated)
- **ROI**: Expansion deals have 540:1 LTV:CAC (vs. 18:1 new customers)
- **Pricing**: Bundle add-ons (competitive intel, additional seats)

### Lesson 6: Competitive Displacement
- **Tactic**: Pay early termination fees (de-risk switching)
- **ROI**: Win competitive deals by removing friction
- **Pricing**: Invest $30K to win $270K LTV (9:1 ROI)

### Lesson 7: Referrals
- **Tactic**: Incentivize referrals ($500 credit per referral)
- **ROI**: Referrals close in 2 days (vs. 45+ days cold)
- **Pricing**: Give referrer 1 month free (cost: $2,500, value: $30K ACV)

### Lesson 8: Multi-Threading
- **Tactic**: Map all stakeholders, address concerns separately
- **ROI**: Enterprise deals require 4+ stakeholders (VP, CIO, CFO, Users)
- **Pricing**: Justify ROI differently for each stakeholder

### Lesson 9: Win-Backs
- **Tactic**: Stay in touch with lost deals (quarterly check-ins)
- **ROI**: Win-back customers are loyal (won't switch again)
- **Pricing**: Offer aggressive incentives (50% off first 6 months)

### Lesson 10: Partnerships
- **Tactic**: Find complementary businesses (consulting firms, trainers)
- **ROI**: Partners bring 30+ clients/year at $500 CAC (vs. $5K CAC)
- **Pricing**: Revenue share (70/30 split) = win-win

---

## Next Steps: Sales Playbook Implementation

1. **Create role-play scripts** (use scenarios 1-10 for training)
2. **Build objection-handling library** (FAQ for each objection type)
3. **Develop stakeholder mapping tool** (for enterprise deals)
4. **Implement partnership program** (recruit 5 partners by Q2 2026)
5. **Track win/loss reasons** (improve process based on data)

---

**Last Updated**: 2025-12-14  
**Owner**: @bickfordd-bit  
**Status**: Ready for sales team training
