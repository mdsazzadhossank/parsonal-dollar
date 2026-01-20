import { Transaction, PortfolioStats } from './types';

export const calculateStats = (transactions: Transaction[]): PortfolioStats => {
  let inventory = 0;
  let totalCostBasis = 0; // Total BDT spent on currently held USD
  let realizedProfit = 0;

  // Sort by time to ensure chronological processing
  const sorted = [...transactions].sort((a, b) => a.timestamp - b.timestamp);

  for (const tx of sorted) {
    if (tx.type === 'BUY') {
      // Add to inventory
      inventory += tx.amountUSD;
      // Add cost (including fees) to cost basis
      totalCostBasis += tx.totalBDT;
    } else if (tx.type === 'SELL') {
      if (inventory > 0) {
        // Calculate the average cost per unit at the moment of sale
        const avgCostPerUnit = totalCostBasis / inventory;
        
        // Cost of the goods being sold
        const costOfSoldGoods = avgCostPerUnit * tx.amountUSD;

        // Revenue from sale (Net received: Amount * Rate - Fees)
        // However, in our form logic, 'totalBDT' for sell is usually (Amount * Rate) - Fees if we treat fees as expense, 
        // or we track fees separately.
        // Let's assume tx.totalBDT for SELL is the net amount pocketed.
        const revenue = tx.totalBDT; 

        // Profit = Revenue - Cost of Goods Sold
        const profit = revenue - costOfSoldGoods;
        realizedProfit += profit;

        // Reduce inventory and cost basis proportionally
        inventory -= tx.amountUSD;
        totalCostBasis -= costOfSoldGoods;
      } else {
        // Edge case: Selling without inventory (Short selling not supported in simple view, ignore or treat as pure profit)
        // For this app, we assume validation prevents this, but mathematically:
        realizedProfit += tx.totalBDT;
      }
    }
  }

  // Handle floating point errors
  inventory = Math.max(0, parseFloat(inventory.toFixed(2)));
  totalCostBasis = Math.max(0, parseFloat(totalCostBasis.toFixed(2)));
  
  const avgBuyCost = inventory > 0 ? totalCostBasis / inventory : 0;

  return {
    totalRealizedProfit: parseFloat(realizedProfit.toFixed(2)),
    usdInventory: inventory,
    avgBuyCost: parseFloat(avgBuyCost.toFixed(2)),
    portfolioValueCost: parseFloat(totalCostBasis.toFixed(2))
  };
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