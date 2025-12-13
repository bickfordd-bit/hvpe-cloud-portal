export type EngineMetric = {
  label: string;
  value: string;
  trend: string;
};

export type EngineStatusData = {
  systemName: string;
  tag: string;
  modeIndicator: string;
  statusIndicator: string;
  highlight: string;
  actionLabel: string;
  description: string;
  metrics: EngineMetric[];
};

export type MetricTile = {
  label: string;
  value: string;
  accent: string;
};

export type BillionairePerson = {
  name: string;
  ipCreated: boolean;
  ipValue: number;
  saleTimeline: string; // ISO date string for expected sale
  status: 'created' | 'in-development' | 'ready-to-sell' | 'sold';
};

export type VelocitySnapshot = {
  velocity: number;
  horizon: string;
  mode: string;
  compounding: boolean;
  oversight: boolean;
};

export type HeatmapData = {
  cells: string[][];
  spikeDetection: string;
};

export type DashboardData = {
  engineStatus: EngineStatusData;
  metricTiles: MetricTile[];
  billionaires: {
    description: string;
    people: BillionairePerson[];
  };
  velocity: VelocitySnapshot;
  heatmap: HeatmapData;
};

export const defaultDashboardData: DashboardData = {
  engineStatus: {
    systemName: "Apex Trading Loop",
    tag: "HVPE Engine",
    modeIndicator: "Aggressive",
    statusIndicator: "Closed Loop Active",
    highlight: "Running",
    actionLabel: "Running",
    description:
      "Engine is executing live packets in aggressive risk mode with full arbitration and compounding enabled. Supra-layer is monitoring external data feeds for anomalies and adjusting velocity in real time.",
    metrics: [
      { label: "Loop Latency", value: "248 ms", trend: "+12 ms" },
      { label: "Signals / min", value: "186", trend: "+23" },
      { label: "Active Packets", value: "7", trend: "+2" },
      { label: "Arbitrator IQ", value: "0.93", trend: "+0.04" },
    ],
  },
  metricTiles: [
    { label: "Daily P/L", value: "+$1,742.32", accent: "text-emerald-400" },
    { label: "Equity", value: "$101,742.32", accent: "text-neutral-100" },
    { label: "Cash Available", value: "$32,117.89", accent: "text-neutral-100" },
    { label: "Positions", value: "14", accent: "text-neutral-100" },
    { label: "Win Rate (30d)", value: "67%", accent: "text-emerald-400" },
    { label: "ROI (30d)", value: "14.2%", accent: "text-emerald-400" },
    { label: "Sharpe (simulated)", value: "2.3", accent: "text-neutral-100" },
    { label: "Risk Level", value: "Aggressive", accent: "text-orange-300" },
  ],
  billionaires: {
    description: "IP portfolio sale acceleration - OPTR-driven monetization.",
    people: [
      { 
        name: "Derek", 
        ipCreated: true, 
        ipValue: 250000, 
        saleTimeline: "2025-12-31T00:00:00.000Z",
        status: "ready-to-sell"
      },
      { 
        name: "Jenna", 
        ipCreated: true, 
        ipValue: 150000, 
        saleTimeline: "2026-03-15T00:00:00.000Z", 
        status: "ready-to-sell"
      },
      { 
        name: "Penelope", 
        ipCreated: true, 
        ipValue: 25000, 
        saleTimeline: "2026-06-30T00:00:00.000Z",
        status: "created"
      },
      { 
        name: "Xavier", 
        ipCreated: true, 
        ipValue: 50000, 
        saleTimeline: "2026-09-15T00:00:00.000Z",
        status: "ready-to-sell"
      },
      { 
        name: "Naomi", 
        ipCreated: true, 
        ipValue: 75000, 
        saleTimeline: "2027-01-31T00:00:00.000Z",
        status: "created"
      },
    ],
  },
  velocity: {
    velocity: 0.23,
    horizon: "30+ years",
    mode: "Aggressive",
    compounding: true,
    oversight: true,
  },
  heatmap: {
    cells: [
      ["Signals", "Packets", "Arbitration"],
      ["News", "Options Flow", "Macro"],
      ["Risk", "Sentiment", "Anomalies"],
    ],
    spikeDetection: "ON",
  },
};
