import { Transaction, PortfolioStats } from './types';

export const calculatePortfolioAnalytics = (transactions: Transaction[]) => {
  let inventory = 0;
  let totalCostBasis = 0; // Total BDT spent on currently held USD
  let realizedProfit = 0;
  const profits: Record<string, number> = {};

  // Sort by time to ensure chronological processing
  const sorted = [...transactions].sort((a, b) => a.timestamp - b.timestamp);

  for (const tx of sorted) {
    if (tx.type === 'BUY') {
      // Add to inventory
      inventory += tx.amountUSD;
      // Add cost (including fees) to cost basis
      totalCostBasis += tx.totalBDT;
    } else if (tx.type === 'SELL') {
      let txProfit = 0;
      if (inventory > 0) {
        // Calculate the average cost per unit at the moment of sale
        const avgCostPerUnit = totalCostBasis / inventory;
        
        // Cost of the goods being sold
        const costOfSoldGoods = avgCostPerUnit * tx.amountUSD;

        // Revenue from sale (Net received)
        const revenue = tx.totalBDT; 

        // Profit = Revenue - Cost of Goods Sold
        txProfit = revenue - costOfSoldGoods;
        
        realizedProfit += txProfit;

        // Reduce inventory and cost basis proportionally
        inventory -= tx.amountUSD;
        totalCostBasis -= costOfSoldGoods;
      } else {
        // Edge case: Selling without inventory
        txProfit = tx.totalBDT;
        realizedProfit += txProfit;
      }
      profits[tx.id] = parseFloat(txProfit.toFixed(2));
    }
  }

  // Handle floating point errors
  inventory = Math.max(0, parseFloat(inventory.toFixed(2)));
  totalCostBasis = Math.max(0, parseFloat(totalCostBasis.toFixed(2)));
  
  const avgBuyCost = inventory > 0 ? totalCostBasis / inventory : 0;

  return {
    stats: {
      totalRealizedProfit: parseFloat(realizedProfit.toFixed(2)),
      usdInventory: inventory,
      avgBuyCost: parseFloat(avgBuyCost.toFixed(2)),
      portfolioValueCost: parseFloat(totalCostBasis.toFixed(2))
    },
    profits
  };
};

export const calculateStats = (transactions: Transaction[]): PortfolioStats => {
  return calculatePortfolioAnalytics(transactions).stats;
};

export const formatCurrency = (amount: number, currency: 'BDT' | 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount).replace('BDT', '৳'); // Custom symbol for BDT often cleaner
};

export const generateUUID = () => {
  // @ts-ignore
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    // @ts-ignore
    return crypto.randomUUID();
  }
  // Fallback for environments where crypto.randomUUID is not available
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};