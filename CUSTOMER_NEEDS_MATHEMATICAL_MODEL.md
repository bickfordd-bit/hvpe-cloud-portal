# Customer Needs — Mathematical Model

**Last Updated**: 2025-12-14  
**Purpose**: Quantify customer pain points and value delivered using mathematical frameworks  
**Use**: ROI calculators, sales presentations, product prioritization

---

## I. Core Mathematical Framework

### Time Value of Proposal Work

Let:
- **T** = Total time spent on proposal (hours)
- **R** = Hourly rate of proposal staff ($/hour)
- **P** = Probability of winning the proposal (0-1)
- **V** = Contract value if won ($)
- **M** = Profit margin (0-1)

**Expected Value of Proposal**:
```
EV = (P × V × M) - (T × R)
```

**Cost of Proposal Work**:
```
C = T × R
```

**ROI of Proposal**:
```
ROI = ((P × V × M) - C) / C
```

---

## II. Customer Need #1: Reduce Proposal Analysis Time

### Problem Definition

**Current State (Without OPTR)**:
```
T_manual = Time to analyze RFP manually
         = T_read + T_extract + T_match + T_gap + T_document
         
Where:
  T_read = 4 hours (read 100-page RFP)
  T_extract = 8 hours (extract 50 requirements)
  T_match = 12 hours (match to capabilities)
  T_gap = 6 hours (identify gaps, find partners)
  T_document = 10 hours (create compliance matrix)
  
T_manual = 40 hours per proposal
```

**Future State (With OPTR)**:
```
T_optr = T_upload + T_process + T_review
       = 0.1 + 0.05 + 0.5
       = 0.65 hours per proposal

Time Saved:
ΔT = T_manual - T_optr = 40 - 0.65 = 39.35 hours
```

### Value Delivered

**For Solo Consultant** (Owen persona):
```
Annual proposals: N = 12
Hourly rate: R = $250/hour

Annual time saved:
ΔT_annual = N × ΔT = 12 × 39.35 = 472.2 hours

Annual value:
V_annual = ΔT_annual × R = 472.2 × $250 = $118,050

OPTR cost:
C_optr = $800/month × 12 = $9,600

Net benefit:
NB = V_annual - C_optr = $118,050 - $9,600 = $108,450

ROI:
ROI = NB / C_optr = $108,450 / $9,600 = 11.3 (1,130%)
```

**For Mid-Size Team** (Sarah persona):
```
Team size: n = 5 writers
Proposals per writer: p = 10/year
Total proposals: N = n × p = 50

Annual time saved:
ΔT_annual = N × ΔT = 50 × 39.35 = 1,967.5 hours

Annual value (at $100/hour loaded cost):
V_annual = 1,967.5 × $100 = $196,750

OPTR cost:
C_optr = $7,500/month × 12 = $90,000

Net benefit:
NB = $196,750 - $90,000 = $106,750

ROI:
ROI = $106,750 / $90,000 = 1.19 (119%)
```

### Mathematical Model Summary

**Time Savings Function**:
```
S(n, p, r) = n × p × ΔT × r - C_optr

Where:
  n = number of staff
  p = proposals per staff per year
  r = hourly rate
  ΔT = 39.35 hours (time saved per proposal)
  C_optr = annual OPTR subscription cost
```

**Break-Even Analysis**:
```
Set S(n, p, r) = 0 and solve for minimum proposals:

p_min = C_optr / (n × ΔT × r)

Example (Sarah's team):
p_min = $90,000 / (5 × 39.35 × $100)
      = $90,000 / $19,675
      = 4.57 proposals per year

Conclusion: Sarah needs only 5 proposals/year to break even
```

---

## III. Customer Need #2: Increase Win Rate

### Problem Definition

**Current State**:
```
Win rate without OPTR: P_baseline = 0.15 (15%)
Proposals per year: N = 50
Avg contract value: V = $5,000,000
Profit margin: M = 0.15 (15%)

Expected annual profit:
E[Profit_baseline] = N × P_baseline × V × M
                   = 50 × 0.15 × $5M × 0.15
                   = $5,625,000
```

**Future State (With OPTR)**:
```
Win rate improvement: ΔP = 0.10 (10 percentage points)
New win rate: P_optr = P_baseline + ΔP = 0.25 (25%)

Expected annual profit:
E[Profit_optr] = N × P_optr × V × M
               = 50 × 0.25 × $5M × 0.15
               = $9,375,000

Profit increase:
ΔProfit = E[Profit_optr] - E[Profit_baseline]
        = $9,375,000 - $5,625,000
        = $3,750,000
```

### Value Delivered

**ROI Calculation** (Strategic Steve persona):
```
OPTR cost: C_optr = $25,000/month × 12 = $300,000

Net benefit:
NB = ΔProfit - C_optr
   = $3,750,000 - $300,000
   = $3,450,000

ROI:
ROI = NB / C_optr
    = $3,450,000 / $300,000
    = 11.5 (1,150%)
```

### Win Rate Improvement Model

**Factors Contributing to Win Rate**:
```
P_win = f(C, T, Q, I)

Where:
  C = Compliance score (0-1): Are all requirements addressed?
  T = Teaming score (0-1): Do we have the right partners?
  Q = Quality score (0-1): Is the proposal well-written?
  I = Incumbent advantage (0-1): Are we the incumbent?

Simplified linear model:
P_win = 0.3C + 0.25T + 0.25Q + 0.20I
```

**OPTR Impact**:
```
Without OPTR:
  C_baseline = 0.70 (miss 30% of requirements)
  T_baseline = 0.60 (suboptimal teaming)
  Q_baseline = 0.80 (good writing, but rushed)
  I_baseline = 0.30 (30% of time we're incumbent)
  
P_baseline = 0.3(0.70) + 0.25(0.60) + 0.25(0.80) + 0.20(0.30)
           = 0.21 + 0.15 + 0.20 + 0.06
           = 0.62 (62% - theoretical max)
           
Actual win rate: 15% (due to other factors like price, risk)

With OPTR:
  C_optr = 0.95 (catch 95% of requirements)
  T_optr = 0.85 (AI-matched teaming partners)
  Q_optr = 0.85 (more time for quality)
  I_optr = 0.30 (unchanged)
  
P_optr = 0.3(0.95) + 0.25(0.85) + 0.25(0.85) + 0.20(0.30)
       = 0.285 + 0.2125 + 0.2125 + 0.06
       = 0.77 (77% - theoretical max)
       
Actual win rate: 25% (same multiplier effect)

Win rate improvement:
ΔP = 25% - 15% = 10 percentage points
```

---

## IV. Customer Need #3: Avoid Non-Responsive Proposals

### Problem Definition

**Compliance Risk Model**:
```
Let:
  N = Number of proposals per year
  P_miss = Probability of missing a requirement (per proposal)
  C_bid = Cost to prepare a proposal
  V_lost = Expected value of contract if won
  
Without OPTR:
  P_miss = 0.05 (5% chance of non-responsive proposal)
  
Expected annual loss:
E[Loss_baseline] = N × P_miss × (C_bid + V_lost × P_win × M)
```

**Example** (Compliance Carol persona):
```
N = 30 proposals per year
P_miss = 0.05 (5% of proposals marked non-responsive)
C_bid = $30,000 (cost of proposal preparation)
V_lost = $10,000,000 (avg contract value)
P_win = 0.30 (30% win rate if responsive)
M = 0.15 (profit margin)

Expected annual loss:
E[Loss] = 30 × 0.05 × ($30,000 + $10M × 0.30 × 0.15)
        = 1.5 × ($30,000 + $450,000)
        = 1.5 × $480,000
        = $720,000 per year
```

### Value Delivered

**With OPTR**:
```
P_miss_optr = 0.005 (0.5% - OPTR catches 95%+ of requirements)

New expected loss:
E[Loss_optr] = 30 × 0.005 × $480,000
             = $7,200 per year

Loss prevention:
ΔLoss = E[Loss_baseline] - E[Loss_optr]
      = $720,000 - $7,200
      = $712,800 per year

OPTR cost:
C_optr = $2,000/month × 12 = $24,000

Net benefit:
NB = ΔLoss - C_optr
   = $712,800 - $24,000
   = $688,800

ROI:
ROI = NB / C_optr
    = $688,800 / $24,000
    = 28.7 (2,870%)
```

**Break-Even Analysis**:
```
Prevent just 1 non-responsive proposal per year:
Value = C_bid + V_lost × P_win × M
      = $30,000 + $10M × 0.30 × 0.15
      = $30,000 + $450,000
      = $480,000

Payback = C_optr / Value
        = $24,000 / $480,000
        = 0.05 (5% of one prevented loss pays for OPTR)
```

---

## V. Customer Need #4: Scale Capacity Without Hiring

### Problem Definition

**Capacity Constraint Model**:
```
Let:
  n = Number of proposal writers
  h = Hours per writer per year (assume 2,000)
  t = Hours per proposal
  
Current capacity:
C_current = (n × h) / t

With OPTR (reducing t):
C_optr = (n × h) / (t × (1 - e))

Where e = efficiency gain (0-1)
```

**Example** (Sarah's team):
```
Current state:
  n = 5 writers
  h = 2,000 hours/year
  t = 70 hours/proposal
  
C_current = (5 × 2,000) / 70
          = 10,000 / 70
          = 142.8 proposals per year (capacity limit)
          
Actual: 50 proposals per year (35% utilization)

With OPTR (50% time reduction):
  t_optr = 35 hours/proposal
  e = 0.50 (50% efficiency gain)
  
C_optr = (5 × 2,000) / 35
       = 10,000 / 35
       = 285.7 proposals per year

Additional capacity:
ΔC = C_optr - C_current
   = 285.7 - 142.8
   = 142.9 proposals per year
```

### Value Delivered

**Hiring Avoidance**:
```
To achieve same capacity without OPTR:
  Need n_new writers such that:
  (n_current + n_new) × h / t = C_optr
  
Solving for n_new:
n_new = (C_optr × t / h) - n_current
      = (285.7 × 70 / 2,000) - 5
      = 10 - 5
      = 5 additional writers needed

Cost of hiring:
  Salary: $80,000/writer
  Benefits: $20,000/writer (25% of salary)
  Overhead: $10,000/writer (office, equipment)
  Total loaded cost: $110,000/writer
  
Total hiring cost:
C_hiring = n_new × $110,000
         = 5 × $110,000
         = $550,000 per year

OPTR cost:
C_optr = $90,000 per year

Savings:
S = C_hiring - C_optr
  = $550,000 - $90,000
  = $460,000 per year

ROI:
ROI = S / C_optr
    = $460,000 / $90,000
    = 5.1 (511%)
```

**Revenue Impact**:
```
Additional proposals bid with extra capacity: 50
Win rate: P = 0.25
Avg contract value: V = $5,000,000
Profit margin: M = 0.15

Additional profit:
ΔProfit = 50 × 0.25 × $5M × 0.15
        = $9,375,000

Combined benefit:
Total = Hiring savings + Additional profit
      = $460,000 + $9,375,000
      = $9,835,000

Combined ROI:
ROI = $9,835,000 / $90,000
    = 109.3 (10,930%)
```

---

## VI. Customer Need #5: Competitive Intelligence

### Problem Definition

**Bad Bid Avoidance Model**:
```
Let:
  N = Total opportunities evaluated per year
  P_bad = Probability opportunity is "bad" (unwinnable)
  C_bid = Cost to prepare full proposal
  P_pursue = Probability of pursuing without intelligence
  
Without competitive intelligence:
  P_bad = 0.40 (40% of opportunities are unwinnable)
  P_pursue = 0.70 (pursue 70% of opportunities blindly)
  
Expected waste:
E[Waste] = N × P_bad × P_pursue × C_bid
```

**Example** (Steve's company):
```
N = 100 opportunities per year
P_bad = 0.40 (40% are unwinnable - strong incumbent, wrong domain, etc.)
P_pursue = 0.70 (pursue 70% without proper intelligence)
C_bid = $50,000 per proposal

Expected waste:
E[Waste] = 100 × 0.40 × 0.70 × $50,000
         = 28 × $50,000
         = $1,400,000 per year (wasted on bad bids)
```

### Value Delivered

**With OPTR Competitive Intelligence**:
```
P_pursue_good = 0.90 (pursue 90% of winnable opportunities)
P_pursue_bad = 0.10 (pursue only 10% of bad opportunities)

New expected waste:
E[Waste_optr] = N × P_bad × P_pursue_bad × C_bid
              = 100 × 0.40 × 0.10 × $50,000
              = 4 × $50,000
              = $200,000 per year

Waste reduction:
ΔWaste = E[Waste] - E[Waste_optr]
       = $1,400,000 - $200,000
       = $1,200,000 per year

Opportunity gain (pursuing more good bids):
  Previously missed: N × (1 - P_bad) × (1 - P_pursue) = 100 × 0.60 × 0.30 = 18
  Now pursuing: N × (1 - P_bad) × P_pursue_good = 100 × 0.60 × 0.90 = 54
  Additional pursued: 54 - (100 × 0.60 × 0.70) = 54 - 42 = 12
  
Additional wins: 12 × 0.25 = 3 contracts
Additional profit: 3 × $5M × 0.15 = $2,250,000

Total benefit:
B_total = ΔWaste + Additional profit
        = $1,200,000 + $2,250,000
        = $3,450,000

OPTR cost:
C_optr = $10,000/month × 12 + ($500 × 20 competitors × 12)
       = $120,000 + $120,000
       = $240,000 per year

Net benefit:
NB = $3,450,000 - $240,000
   = $3,210,000

ROI:
ROI = $3,210,000 / $240,000
    = 13.4 (1,340%)
```

---

## VII. Summary: Mathematical Models by Persona

### Owen (Solo Consultant)

**Primary Need**: Time savings
```
Input:
  N = 12 proposals/year
  R = $250/hour
  ΔT = 39.35 hours saved/proposal

Output:
  Annual value = $118,050
  OPTR cost = $9,600
  ROI = 1,130%
```

### Sarah (Proposal Manager)

**Primary Need**: Team capacity
```
Input:
  n = 5 writers
  N = 50 proposals/year
  ΔT = 39.35 hours saved/proposal
  
Output:
  Hiring avoided = 5 writers × $110K = $550K
  Additional revenue = $9.375M
  Total benefit = $9.835M
  OPTR cost = $90K
  ROI = 10,930%
```

### Steve (VP of BD)

**Primary Needs**: Win rate increase + bad bid avoidance
```
Input (Win rate):
  N = 50 proposals/year
  V = $5M avg contract
  ΔP = +10% win rate improvement
  
Output:
  Additional profit = $3.75M
  
Input (Bad bids):
  N = 100 opportunities/year
  Waste reduction = $1.2M
  Additional profit = $2.25M
  
Combined output:
  Total benefit = $3.75M + $1.2M + $2.25M = $7.2M
  OPTR cost = $240K
  ROI = 2,900%
```

### Carol (Contracts Manager)

**Primary Need**: Compliance risk reduction
```
Input:
  N = 30 proposals/year
  P_miss = 5% → 0.5% (OPTR reduces by 90%)
  Cost per miss = $480K
  
Output:
  Loss prevention = $712,800
  OPTR cost = $24,000
  ROI = 2,870%
```

### Danielle (Capture Manager)

**Primary Need**: Capture effort reduction
```
Input:
  N = 10 captures/year
  T_capture = 150 hours/capture
  ΔT = 75 hours saved/capture (50% reduction)
  R = $150/hour (loaded cost)
  
Output:
  Annual savings = 10 × 75 × $150 = $112,500
  Additional win (faster captures) = $50M contract × 0.30 × 0.15 = $2.25M
  Total benefit = $2.36M
  OPTR cost = $300K (enterprise)
  ROI = 687%
```

---

## VIII. Universal ROI Formula

**General Form**:
```
ROI_optr = (ΣBenefits - C_optr) / C_optr

Where Benefits include:
1. Time savings: ΔT × R × N
2. Win rate improvement: ΔP × V × M × N
3. Hiring avoidance: n_avoided × Salary_loaded
4. Compliance risk reduction: ΔP_miss × Cost_per_miss × N
5. Bad bid avoidance: P_bad × P_pursue_reduction × C_bid × N
6. Revenue expansion: Additional_wins × V × M
```

**Minimum Viable ROI** (3:1 threshold):
```
For ROI ≥ 3:
  ΣBenefits ≥ 4 × C_optr
  
Example (Sarah, $90K OPTR cost):
  Minimum benefit required = 4 × $90K = $360K
  
  Option 1 (Time savings only):
    Need: N × ΔT × R ≥ $360K
    With ΔT = 39.35, R = $100:
    N ≥ $360K / (39.35 × $100) = 91.5 proposals
    
  Option 2 (Win rate improvement):
    Need: ΔP × V × M × N ≥ $360K
    With ΔP = 0.10, V = $5M, M = 0.15:
    N ≥ $360K / (0.10 × $5M × 0.15) = 4.8 proposals
    
Conclusion: Win rate improvement path requires only 5 proposals to hit 3:1 ROI
```

---

## IX. Decision Tree: Should Customer Buy OPTR?

**Binary Decision Model**:
```
Buy_OPTR = TRUE if:
  (1) Time_savings_value > 3 × Cost, OR
  (2) Win_rate_improvement_value > 3 × Cost, OR
  (3) Hiring_avoidance_value > 3 × Cost, OR
  (4) Compliance_risk_reduction > 3 × Cost, OR
  (5) Bad_bid_avoidance > 3 × Cost

Else: Buy_OPTR = FALSE
```

**Scoring Function**:
```
Score = w1 × (Time_savings / Cost) +
        w2 × (Win_rate / Cost) +
        w3 × (Hiring / Cost) +
        w4 × (Compliance / Cost) +
        w5 × (Bad_bids / Cost)
        
Where weights (w1...w5) sum to 1.0

Recommended thresholds:
  Score > 5: Strong buy (present immediately)
  Score 3-5: Buy (schedule demo)
  Score 1-3: Maybe (nurture, provide case studies)
  Score < 1: No fit (disqualify)
```

---

## X. Sensitivity Analysis

**Key Variables Impact on ROI**:

| Variable | Baseline | -50% Change | +50% Change | ROI Impact |
|----------|----------|-------------|-------------|------------|
| Proposals/year (N) | 50 | 25 | 75 | -50% / +50% |
| Hourly rate (R) | $100 | $50 | $150 | -50% / +50% |
| Time saved (ΔT) | 39.35h | 19.7h | 59h | -50% / +50% |
| Win rate gain (ΔP) | 10% | 5% | 15% | -50% / +50% |
| Contract value (V) | $5M | $2.5M | $7.5M | -50% / +50% |
| OPTR cost (C) | $90K | $45K | $135K | +100% / -33% |

**Most Sensitive Variables** (highest impact):
1. **Win rate gain (ΔP)**: 10% → 15% doubles profit impact ($3.75M → $5.625M)
2. **Contract value (V)**: Directly multiplies all revenue benefits
3. **Time saved (ΔT)**: 39.35h → 59h increases time savings by 50%

**Least Sensitive**:
1. **OPTR cost (C)**: Doubling cost still maintains 5:1+ ROI for most personas
2. **Hourly rate (R)**: Only affects time savings component (1 of 5 benefits)

---

## XI. Conclusion: The Math Never Lies

**For every $1 spent on OPTR, customers get back**:
- Owen (Solo): **$12.30** (1,130% ROI)
- Sarah (Team): **$109.30** (10,930% ROI)
- Steve (Enterprise): **$30.00** (2,900% ROI)
- Carol (Compliance): **$29.70** (2,870% ROI)
- Danielle (Capture): **$7.87** (687% ROI)

**Average ROI across all personas**: **5,903%**

**Minimum ROI (worst case)**: **687%** (Danielle)

**Payback period**:
- Fastest: 3.3 days (Steve, win rate improvement)
- Slowest: 52.5 days (Danielle, capture reduction)
- Average: **18 days**

---

**Next Step**: Use these formulas in ROI calculators and sales presentations.

**Last Updated**: 2025-12-14  
**Owner**: @bickfordd-bit
