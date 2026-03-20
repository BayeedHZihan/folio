import type {
  PortfolioHolding,
  PortfolioSummary,
  PortfolioAnalytics,
  AllocationSlice,
} from '../types';

interface TransactionWithStock {
  type: string;
  ticker: string;
  shares: number;
  pricePerShare: number;
  currency: string;
  stock: {
    name: string;
    currentPrice: number;
    sector: string;
    region: string;
    currency: string;
  };
}

export function buildPortfolioSummary(transactions: TransactionWithStock[]): PortfolioSummary {
  const holdingsMap = new Map<string, {
    ticker: string;
    name: string;
    shares: number;
    totalCost: number;
    currentPrice: number;
    sector: string;
    region: string;
    currency: string;
  }>();

  for (const tx of transactions) {
    const existing = holdingsMap.get(tx.ticker) ?? {
      ticker: tx.ticker,
      name: tx.stock.name,
      shares: 0,
      totalCost: 0,
      currentPrice: tx.stock.currentPrice,
      sector: tx.stock.sector,
      region: tx.stock.region,
      currency: tx.currency,
    };

    if (tx.type === 'BUY') {
      existing.shares += tx.shares;
      existing.totalCost += tx.shares * tx.pricePerShare;
    } else {
      existing.shares -= tx.shares;
      existing.totalCost -= tx.shares * tx.pricePerShare;
    }

    holdingsMap.set(tx.ticker, existing);
  }

  const activeHoldings = Array.from(holdingsMap.values()).filter((h) => h.shares > 0.0001);

  const totalPortfolioValue = activeHoldings.reduce(
    (sum, h) => sum + h.shares * h.currentPrice,
    0
  );

  const holdings: PortfolioHolding[] = activeHoldings.map((h) => {
    const currentValue = h.shares * h.currentPrice;
    const averageCostBasis = h.totalCost / h.shares;
    const gainLoss = currentValue - h.totalCost;

    return {
      ticker: h.ticker,
      name: h.name,
      shares: h.shares,
      averageCostBasis,
      currentPrice: h.currentPrice,
      currentValue,
      totalCost: h.totalCost,
      gainLoss,
      gainLossPercent: (gainLoss / h.totalCost) * 100,
      weight: totalPortfolioValue > 0 ? (currentValue / totalPortfolioValue) * 100 : 0,
      sector: h.sector as PortfolioHolding['sector'],
      region: h.region as PortfolioHolding['region'],
      currency: h.currency,
    };
  });

  const totalCost = holdings.reduce((s, h) => s + h.totalCost, 0);
  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);
  const totalGainLoss = totalValue - totalCost;

  return {
    totalValue,
    totalCost,
    totalGainLoss,
    totalGainLossPercent: totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0,
    holdings,
    lastUpdated: new Date().toISOString(),
  };
}

export function buildPortfolioAnalytics(holdings: PortfolioHolding[]): PortfolioAnalytics {
  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);

  const sorted = [...holdings].sort((a, b) => b.currentValue - a.currentValue);
  const top8 = sorted.slice(0, 8);
  const rest = sorted.slice(8);

  const holdingAllocation: AllocationSlice[] = [
    ...top8.map((h) => ({ label: h.ticker, value: h.weight, absoluteValue: h.currentValue })),
    ...(rest.length > 0
      ? [{ label: 'Other', value: rest.reduce((s, h) => s + h.weight, 0), absoluteValue: rest.reduce((s, h) => s + h.currentValue, 0) }]
      : []),
  ];

  const sectorMap = new Map<string, number>();
  for (const h of holdings) {
    sectorMap.set(h.sector, (sectorMap.get(h.sector) ?? 0) + h.currentValue);
  }
  const sectorAllocation: AllocationSlice[] = Array.from(sectorMap.entries()).map(([label, value]) => ({
    label,
    value: totalValue > 0 ? (value / totalValue) * 100 : 0,
    absoluteValue: value,
  }));

  const regionMap = new Map<string, number>();
  for (const h of holdings) {
    regionMap.set(h.region, (regionMap.get(h.region) ?? 0) + h.currentValue);
  }
  const regionAllocation: AllocationSlice[] = Array.from(regionMap.entries()).map(([label, value]) => ({
    label,
    value: totalValue > 0 ? (value / totalValue) * 100 : 0,
    absoluteValue: value,
  }));

  return { holdingAllocation, sectorAllocation, regionAllocation };
}