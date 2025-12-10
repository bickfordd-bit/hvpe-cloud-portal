type RiskMode = "conservative" | "balanced" | "aggressive";

export type TradingPosition = {
  symbol: string;
  qty: number;
  side: "long" | "short";
  avgPrice: number;
  lastPrice: number;
  unrealized: number;
  today: number;
};

export type TradingOrder = {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  qty: number;
  type: "market" | "limit";
  limitPrice?: number;
  status: "pending" | "filled" | "canceled";
  time: string;
};

export type TradingTrade = {
  id: string;
  time: string;
  symbol: string;
  side: "buy" | "sell";
  qty: number;
  price: number;
  pnl: number;
};

export type TradingEngineState = {
  running: boolean;
  risk: RiskMode;
  toggles: {
    compounding: boolean;
    supraOversight: boolean;
    packetArbitration: boolean;
    optionsFlow: boolean;
  };
};

export type TradingEngineData = {
  engineState: TradingEngineState;
  positions: TradingPosition[];
  orders: TradingOrder[];
  trades: TradingTrade[];
};

const samplePositions: TradingPosition[] = [
  {
    symbol: "NVDA",
    qty: 120,
    side: "long",
    avgPrice: 135.4,
    lastPrice: 138.9,
    unrealized: 420.0,
    today: 260.5,
  },
  {
    symbol: "TSLA",
    qty: 80,
    side: "long",
    avgPrice: 210.2,
    lastPrice: 205.1,
    unrealized: -408.0,
    today: -132.7,
  },
  {
    symbol: "AAPL",
    qty: 200,
    side: "long",
    avgPrice: 190.0,
    lastPrice: 193.2,
    unrealized: 640.0,
    today: 180.0,
  },
  {
    symbol: "SPY",
    qty: 50,
    side: "short",
    avgPrice: 520.5,
    lastPrice: 517.8,
    unrealized: 135.0,
    today: 88.4,
  },
];

const sampleOrders: TradingOrder[] = [
  {
    id: "1",
    symbol: "NVDA",
    side: "buy",
    qty: 50,
    type: "limit",
    limitPrice: 138.5,
    status: "pending",
    time: "09:46:12",
  },
  {
    id: "2",
    symbol: "TSLA",
    side: "sell",
    qty: 20,
    type: "market",
    status: "filled",
    time: "09:41:03",
  },
  {
    id: "3",
    symbol: "SPY",
    side: "sell",
    qty: 10,
    type: "limit",
    limitPrice: 518.0,
    status: "canceled",
    time: "09:39:27",
  },
];

const sampleTrades: TradingTrade[] = [
  {
    id: "t1",
    time: "09:52:14",
    symbol: "NVDA",
    side: "buy",
    qty: 30,
    price: 138.7,
    pnl: 96.4,
  },
  {
    id: "t2",
    time: "09:48:33",
    symbol: "AAPL",
    side: "sell",
    qty: 50,
    price: 193.0,
    pnl: 212.5,
  },
  {
    id: "t3",
    time: "09:43:05",
    symbol: "TSLA",
    side: "buy",
    qty: 15,
    price: 205.9,
    pnl: -54.2,
  },
];

export const defaultTradingEngineData: TradingEngineData = {
  engineState: {
    running: true,
    risk: "aggressive",
    toggles: {
      compounding: true,
      supraOversight: true,
      packetArbitration: true,
      optionsFlow: true,
    },
  },
  positions: samplePositions,
  orders: sampleOrders,
  trades: sampleTrades,
};
