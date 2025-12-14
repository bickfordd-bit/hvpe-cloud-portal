# Customer Loyalty — Mathematical Model

**Last Updated**: 2025-12-14  
**Purpose**: Define and quantify customer loyalty, retention drivers, and network effects  
**Use**: Product roadmap, pricing strategy, customer success metrics

---

## I. Customer Loyalty Definition

**Loyalty = f(Value Delivered, Switching Cost, Emotional Connection)**

### Mathematical Model

```
L(t) = α·V(t) + β·S(t) + γ·E(t)

Where:
  L(t) = Loyalty score at time t (0-100)
  V(t) = Value delivered over time
  S(t) = Switching cost (difficulty of leaving)
  E(t) = Emotional connection (brand affinity)
  α, β, γ = Weights (sum to 1)
  
Typical weights for B2B SaaS:
  α = 0.60 (value is primary driver)
  β = 0.30 (switching cost is important)
  γ = 0.10 (emotional connection is nice-to-have)
```

---

## II. Value Delivered Over Time V(t)

### Core Formula

```
V(t) = V_baseline + V_learning(t) + V_network(t)

Where:
  V_baseline = Initial value (time savings from day 1)
  V_learning(t) = Compounding value as system learns user patterns
  V_network(t) = Value from network effects (more users = better data)
```

### V_baseline (Initial Value)

```
For OPTR:
V_baseline = Time_saved_per_proposal × Proposals_per_month × Hourly_rate

Example (Sarah's team):
  Time saved: 39.35 hours/proposal
  Proposals: 4/month
  Hourly rate: $100
  
V_baseline = 39.35 × 4 × $100
           = $15,740 per month
```

### V_learning(t) (Compounding Intelligence)

```
V_learning(t) = V_baseline × (1 + r)^t - V_baseline

Where:
  r = Learning rate (% improvement per period)
  t = Time periods since adoption
  
Example (r = 5% per month):
  Month 1: V_learning = 0 (baseline only)
  Month 3: V_learning = $15,740 × (1.05)^3 - $15,740 = $2,429
  Month 6: V_learning = $15,740 × (1.05)^6 - $15,740 = $5,307
  Month 12: V_learning = $15,740 × (1.05)^12 - $15,740 = $12,641
  
Total value at Month 12:
  V(12) = $15,740 + $12,641 = $28,381/month
```

**What drives learning rate r?**
```
r = f(Usage_frequency, Data_quality, User_feedback)

For OPTR:
- Each proposal run teaches system user preferences
- Which requirements matter most (user clicks/saves)
- Which past performance gets reused (learns value)
- Which teaming partners are preferred
- Writing style preferences (compliance matrix format)

Empirical learning rate:
  Low usage (1-2 runs/month): r = 2%/month
  Medium usage (5-10 runs/month): r = 5%/month
  High usage (20+ runs/month): r = 8%/month
```

### V_network(t) (Network Effects)

```
V_network(t) = k × log(N(t))

Where:
  k = Network effect coefficient
  N(t) = Number of active users at time t
  
Example (k = $1,000):
  N = 10 users:   V_network = $1,000 × log(10) = $2,303
  N = 100 users:  V_network = $1,000 × log(100) = $4,605
  N = 1000 users: V_network = $1,000 × log(1000) = $6,908
```

**What drives network effects?**
```
For OPTR:
1. Shared past performance library (more companies = more data)
2. Competitive intelligence (more users tracking = better insights)
3. Teaming recommendations (more companies = better matches)
4. Requirement patterns (aggregate data improves extraction)

Network value grows logarithmically (not linear):
  10× users = 2× value
  100× users = 3× value
```

---

## III. Switching Cost S(t)

### Core Formula

```
S(t) = Data_lock_in(t) + Process_integration(t) + Skill_investment(t)

Where all components grow over time (harder to leave)
```

### Data Lock-In

```
Data_lock_in(t) = min(100, D(t) × w_d)

Where:
  D(t) = Number of documents indexed at time t
  w_d = Weight per document ($0.50 perceived switching cost)
  
Example (Sarah's team):
  Month 1:  100 documents  → $50 switching cost
  Month 6:  500 documents  → $250 switching cost
  Month 12: 1,200 documents → $600 switching cost (capped at 100 loyalty points)
```

### Process Integration

```
Process_integration(t) = min(100, I(t) × w_i)

Where:
  I(t) = Number of integrated workflows at time t
  w_i = Weight per integration (20 loyalty points each)
  
Example integrations:
- OPTR in weekly BD pipeline review: +20 points
- Compliance matrices auto-exported to proposals: +20 points
- Competitive intel dashboard used by execs: +20 points
- API integration with Salesforce: +40 points (double weight)

Month 6: 3 workflows → 60 loyalty points
Month 12: 4 workflows → 80 loyalty points
```

### Skill Investment

```
Skill_investment(t) = min(100, H(t) × w_h)

Where:
  H(t) = Hours invested in learning/using system
  w_h = Weight per hour (0.5 loyalty points/hour)
  
Example:
  4 hours onboarding + 10 hours/month usage
  Month 1:  14 hours  → 7 loyalty points
  Month 6:  64 hours  → 32 loyalty points
  Month 12: 124 hours → 62 loyalty points
```

**Total Switching Cost**:
```
Month 1:  S(1) = 50 + 20 + 7 = 77
Month 6:  S(6) = 250 + 60 + 32 = 342 (normalized to 0-100 scale = 85)
Month 12: S(12) = 600 + 80 + 62 = 742 (normalized to 0-100 scale = 93)

Normalization: S_norm = 100 × (1 - e^(-S/200))
```

---

## IV. Emotional Connection E(t)

### Core Formula

```
E(t) = Brand_trust(t) + Community(t) + Success_stories(t)

All components grow slowly over time
```

### Components

```
Brand_trust(t) = min(100, 10 × sqrt(t))
  - Grows with time (reliability demonstrated)
  - Month 1: 10 points
  - Month 12: 35 points
  - Month 36: 60 points

Community(t) = min(100, Interactions × 5)
  - User forum posts, webinar attendance, peer connections
  - Low engagement: 5 points
  - Medium engagement: 25 points
  - High engagement: 50 points

Success_stories(t) = Won_contracts_attributed × 10
  - Directly attribute contract wins to OPTR
  - 1 win: 10 points
  - 5 wins: 50 points
  - 10+ wins: 100 points (capped)
```

**Total Emotional Connection**:
```
Month 1:  E(1) = 10 + 5 + 0 = 15 (new user, no wins yet)
Month 6:  E(6) = 24 + 25 + 30 = 79 (3 wins attributed)
Month 12: E(12) = 35 + 25 + 60 = 120 → 100 (normalized, 6 wins)
```

---

## V. Customer Loyalty Score Over Time

### Combined Model

```
L(t) = 0.60 × V(t) + 0.30 × S(t) + 0.10 × E(t)

Example (Sarah's team):

Month 1:
  V(1) = 40 (baseline value vs. manual)
  S(1) = 20 (minimal switching cost)
  E(1) = 15 (new customer)
  L(1) = 0.60(40) + 0.30(20) + 0.10(15)
       = 24 + 6 + 1.5
       = 31.5 (low loyalty, at-risk)

Month 6:
  V(6) = 65 (value growing with learning)
  S(6) = 85 (significant switching cost)
  E(6) = 79 (emotional connection building)
  L(6) = 0.60(65) + 0.30(85) + 0.10(79)
       = 39 + 25.5 + 7.9
       = 72.4 (medium loyalty, stable)

Month 12:
  V(12) = 85 (value compounding with learning + network)
  S(12) = 93 (high switching cost)
  E(12) = 100 (strong emotional connection)
  L(12) = 0.60(85) + 0.30(93) + 0.10(100)
        = 51 + 27.9 + 10
        = 88.9 (high loyalty, sticky)
```

---

## VI. Churn Risk Model

### Churn Probability

```
P_churn(t) = 1 / (1 + e^((L(t) - 50) / 10))

This is a logistic function where:
- L < 30: Very high churn risk (>80%)
- L = 50: Moderate churn risk (50%)
- L > 70: Low churn risk (<20%)
- L > 85: Very low churn risk (<5%)

Example (Sarah's team):
  Month 1:  L = 31.5 → P_churn = 72% (at-risk!)
  Month 6:  L = 72.4 → P_churn = 18% (stable)
  Month 12: L = 88.9 → P_churn = 3% (sticky)
```

### Retention Rate

```
Retention_rate(t) = 1 - P_churn(t)

Cohort analysis:
  Month 1 cohort (100 customers):
    Month 1:  28 retained (72% churned)
    Month 6:  82 retained (18% churned from survivors)
    Month 12: 97 retained (3% churned from survivors)
    
  Cumulative retention: 97% (of those who survive Month 1)
```

**Key Insight**: First 30 days are critical (high churn risk)

---

## VII. Customer Lifetime Value (LTV) with Loyalty

### Basic LTV

```
LTV = ARPU × (1 / Churn_rate) × Gross_margin

Where:
  ARPU = Average Revenue Per User per period
  Churn_rate = Monthly churn probability
  Gross_margin = % of revenue kept after costs
```

### Loyalty-Adjusted LTV

```
LTV(t) = ARPU × Σ(Retention_rate(i) × Discount_factor(i))

Where sum is from i=1 to T (expected lifetime)

Example (Sarah, $7,500/month ARPU):
  Assume L(t) grows linearly from 31.5 to 88.9 over 12 months
  Then stays at 88.9 (97% retention)
  
  LTV = $7,500 × [0.28 + 0.40 + 0.55 + 0.68 + 0.77 + 0.82 + ... + 0.97^36]
      = $7,500 × 28.3 (effective periods)
      = $212,250 (3-year LTV with loyalty growth)
      
  Compare to baseline (no loyalty growth):
    If retention stayed at 28% (Month 1 level):
      LTV = $7,500 × 1.4 periods = $10,500
      
  Loyalty multiplier: 20.2× higher LTV
```

---

## VIII. Loyalty Drivers (Prioritized)

### Ranked by Impact on L(t)

| Driver | Impact on Loyalty | Time to Effect | Cost to Implement |
|--------|-------------------|----------------|-------------------|
| **Time savings (V_baseline)** | 60% weight | Immediate | Core product |
| **Learning/AI (V_learning)** | +50% over 12mo | Gradual | Medium (ML infra) |
| **Data lock-in (S)** | 30% weight | Months 3-6 | Low (storage) |
| **Process integration (S)** | 30% weight | Months 1-3 | Medium (APIs) |
| **Network effects (V_network)** | +20% at scale | Months 6-18 | Low (shared DB) |
| **Success stories (E)** | 10% weight | Months 3-6 | Low (tracking) |
| **Community (E)** | 10% weight | Months 6-12 | Medium (forum) |

### Actionable Recommendations

**Phase 1 (Months 1-3): Focus on V_baseline**
- Ensure time savings are visible (show "39.35 hours saved")
- Send weekly email: "You saved X hours this week"
- Dashboard widget: "Total time saved: 157 hours ($15,700 value)"

**Phase 2 (Months 3-6): Build S (switching cost)**
- Encourage uploading all past proposals (data lock-in)
- Integrate with Salesforce/RFPIO (process integration)
- Automate compliance matrix export to Word (skill investment)

**Phase 3 (Months 6-12): Grow V_learning**
- Implement recommendation engine (learns preferences)
- "You frequently use these past performances → here are similar ones"
- "You tend to skip requirements with 'may' → auto-flag optional"

**Phase 4 (Months 12+): Activate E (emotional connection)**
- Feature customer success stories in app
- Invite to user conference (OPTR Summit)
- Create "Power User" badge (gamification)

---

## IX. Loyalty Metrics Dashboard

### Track These KPIs

```
Monthly Metrics:
1. Loyalty Score: L(t) average across all customers
   - Target: >70 by Month 6
   - Alert if <50 (churn risk)

2. Value Delivered: V(t) per customer
   - Track time saved (hours) → convert to $
   - Show in-app dashboard

3. Switching Cost: S(t) per customer
   - Documents indexed
   - Workflows integrated
   - Hours invested

4. Churn Risk: P_churn(t)
   - Flag customers with >50% risk
   - Trigger CSM intervention

5. Net Promoter Score (NPS): "How likely to recommend?"
   - Target: >50 (world-class)
   - Correlate with L(t) (should be r=0.8+)
```

### Cohort Analysis

```
Track retention by cohort:
  Jan 2024 cohort: 100 customers
    Month 1: 28% retained
    Month 3: 65% retained (of survivors)
    Month 6: 82% retained
    Month 12: 97% retained
    
  Goal: Move Month 1 retention from 28% → 60%
  Tactics:
  - Better onboarding (show value in first 7 days)
  - Weekly check-ins with new customers
  - "Quick win" templates (pre-loaded RFPs)
```

---

## X. Anti-Churn Playbook

### Identify At-Risk Customers

```
Trigger: L(t) < 40 or L(t) declining for 2 consecutive months

Red flags:
- Low usage (<1 OPTR run per month)
- No data uploaded (no switching cost)
- No integrations (easy to leave)
- Complaints in support tickets
- NPS < 6 (detractors)
```

### Intervention Tactics

**Tier 1 (Automated)**:
```
- Email: "We noticed you haven't run OPTR in 2 weeks. Need help?"
- In-app message: "Upload your past proposals to unlock full value"
- Offer: "Free 30-minute training session with our team"
```

**Tier 2 (Human CSM)**:
```
- Call customer: "How's OPTR working for you?"
- Identify blockers: "What's preventing you from using it more?"
- Offer solutions: "Let me set up Salesforce integration for you"
- Quick win: "Here's a template to get started immediately"
```

**Tier 3 (Executive)**:
```
- CEO calls customer (if >$50K ACV)
- Offer: 50% discount for 3 months to prove value
- Custom development: "We'll build the feature you need"
- Last resort: Refund + retain goodwill (better than bad word-of-mouth)
```

---

## XI. Loyalty as Competitive Moat

### Why Loyal Customers Defend Your Business

**1. Word-of-Mouth (Viral Coefficient)**
```
v = Loyal_customers × Invites_per_customer × Conversion_rate

Example:
  1,000 loyal customers (L > 85)
  Each refers 0.5 new customers per year
  Conversion rate: 30%
  
New customers from referrals:
  v = 1,000 × 0.5 × 0.30
    = 150 new customers per year
    = $1.35M ARR (at $9K avg ACV)
    
CAC for referred customers: $500 (vs. $5,000 for cold)
Referral channel ROI: 18:1
```

**2. Expansion Revenue**
```
Loyal customers buy more:
- Upgrade tiers (Solo → Team → Enterprise)
- Add seats (3 users → 10 users)
- Add modules (Competitive Intel, Past Performance Search)

Expansion rate = % of loyal customers who increase spend

Example:
  30% of loyal customers expand by 50% annually
  1,000 loyal customers × $7,500/month × 0.30 × 0.50
  = $1.125M incremental ARR per year
```

**3. Price Insensitivity**
```
Loyal customers tolerate price increases:
- L < 50: 10% price increase → 40% churn
- L > 85: 10% price increase → 5% churn

Revenue impact of 10% price increase:
  Low loyalty base (L=50): 
    +10% revenue - 40% churn = -30% net revenue (bad!)
    
  High loyalty base (L=85):
    +10% revenue - 5% churn = +5% net revenue (good!)
```

**4. Competitive Defense**
```
Loyal customers don't switch even when competitors offer better features:

Switching likelihood when competitor launches:
  L < 50: 60% will evaluate competitor
  L > 85: 10% will evaluate competitor
  
Retention advantage: 6× better at defending against competition
```

---

## XII. Loyalty ROI: Invest in Retention

### CAC vs. Retention Spend

```
Typical SaaS:
  CAC (Customer Acquisition Cost): $5,000
  Retention spend per customer per year: $500
  
ROI of retention investment:
  $500 retention spend → prevent 1 churn
  Saved LTV: $90,000 (3-year value)
  ROI: 180:1

Compare to new acquisition:
  $5,000 CAC → acquire 1 customer
  Expected LTV: $90,000
  ROI: 18:1
  
Conclusion: Retention is 10× better ROI than acquisition
```

### Optimal Budget Allocation

```
Total budget: $1M for growth

Suboptimal (acquisition-heavy):
  $900K → Sales/marketing (CAC)
  $100K → Customer success (retention)
  
  Result: 180 new customers, 20% churn
  Net: 144 customers retained
  
Optimal (balanced):
  $500K → Sales/marketing
  $500K → Customer success
  
  Result: 100 new customers, 5% churn
  Net: 95 customers retained from new + 95% of existing
  
Long-term (3 years):
  Suboptimal: Constant churn treadmill, 150 customers
  Optimal: Compounding growth, 400+ customers
```

---

## XIII. Summary: The Loyalty Flywheel

```
More value delivered (V↑)
  ↓
Higher loyalty score (L↑)
  ↓
Lower churn (P_churn↓)
  ↓
Longer customer lifetime
  ↓
More data collected (network effects)
  ↓
Better AI/learning (V_learning↑)
  ↓
Even more value delivered (V↑↑)
  ↓
[LOOP BACK TO TOP]

Result: Exponential growth in customer value over time
```

### Key Metrics

- **Initial value**: $15,740/month (time savings)
- **Month 12 value**: $28,381/month (2× with learning)
- **Loyalty growth**: 31.5 → 88.9 (2.8× improvement)
- **Churn reduction**: 72% → 3% (24× improvement)
- **LTV increase**: $10,500 → $212,250 (20× improvement)

**The math is clear: Loyalty compounds value exponentially.**

---

**Next Step**: Implement loyalty tracking dashboard and anti-churn playbook

**Last Updated**: 2025-12-14  
**Owner**: @bickfordd-bit
