// ─── User & Auth ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ─── Stocks ──────────────────────────────────────────────────────────────────

export type StockSector =
  | 'Technology'
  | 'Healthcare'
  | 'Financials'
  | 'Consumer Discretionary'
  | 'Consumer Staples'
  | 'Industrials'
  | 'Energy'
  | 'Materials'
  | 'Utilities'
  | 'Real Estate'
  | 'Communication Services'
  | 'Other';

export type StockRegion =
  | 'North America'
  | 'Europe'
  | 'Asia Pacific'
  | 'Emerging Markets'
  | 'Other';

export interface Stock {
  ticker: string;
  name: string;
  currentPrice: number;
  currency: string;
  sector: StockSector;
  region: StockRegion;
  lastUpdated: Date;
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export type TransactionType = 'BUY' | 'SELL';

export interface Transaction {
  id: string;
  userId: string;
  ticker: string;
  type: TransactionType;
  shares: number;
  pricePerShare: number;
  currency: string;
  date: Date;
  notes?: string;
  createdAt: Date;
}

export interface CreateTransactionRequest {
  ticker: string;
  type: TransactionType;
  shares: number;
  pricePerShare: number;
  currency: string;
  date: string;
  notes?: string;
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

export interface PortfolioHolding {
  ticker: string;
  name: string;
  shares: number;
  averageCostBasis: number;
  currentPrice: number;
  currentValue: number;
  totalCost: number;
  gainLoss: number;
  gainLossPercent: number;
  weight: number;
  sector: StockSector;
  region: StockRegion;
  currency: string;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  holdings: PortfolioHolding[];
  lastUpdated: string;
}

export interface AllocationSlice {
  label: string;
  value: number;
  absoluteValue: number;
}

export interface PortfolioAnalytics {
  holdingAllocation: AllocationSlice[];
  sectorAllocation: AllocationSlice[];
  regionAllocation: AllocationSlice[];
}

// ─── API ──────────────────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;