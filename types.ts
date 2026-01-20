export type TransactionType = 'BUY' | 'SELL';

export interface Transaction {
  id: string;
  type: TransactionType;
  amountUSD: number;
  exchangeRate: number;
  extraFees: number;
  totalBDT: number;
  date: string;
  timestamp: number;
}

export interface PortfolioStats {
  totalRealizedProfit: number;
  usdInventory: number;
  avgBuyCost: number;
  portfolioValueCost: number; // Total capital locked in current inventory
}
