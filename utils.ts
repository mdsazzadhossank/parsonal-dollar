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
    } else if (tx.type === 'SELL' || tx.type === 'PERSONAL') {
      
      // Calculate Average Cost Per Unit based on AVAILABLE positive inventory
      let avgCostPerUnit = 0;
      if (inventory > 0) {
        avgCostPerUnit = totalCostBasis / inventory;
      }
      
      // Determine how much of the transaction can be "covered" by existing stock for cost calculation
      // If we have 0 stock, cost is 0 (pure savings/profit visually, or debt creation)
      const effectiveInventory = Math.max(0, inventory);
      const coveredAmount = Math.min(effectiveInventory, tx.amountUSD);
      
      // Cost of the goods being sold/used
      const costOfSoldGoods = avgCostPerUnit * coveredAmount;

      // Revenue from sale OR Value consumed (Net amount)
      const revenue = tx.totalBDT; 

      // Profit = Revenue - Cost of Goods Sold
      const txProfit = revenue - costOfSoldGoods;
      
      realizedProfit += txProfit;
      profits[tx.id] = parseFloat(txProfit.toFixed(2));

      // Update Inventory Logic
      if (tx.type === 'PERSONAL') {
        // Personal use ALWAYS subtracts, allowing negative balance
        inventory -= tx.amountUSD;
        // Reduce cost basis only by the amount we actually had cover for
        totalCostBasis -= costOfSoldGoods;
      } else {
        // SELL Logic (Standard)
        if (inventory > 0) {
          inventory -= tx.amountUSD;
          totalCostBasis -= costOfSoldGoods;
        }
      }
    }
  }

  // Handle floating point errors for inventory
  // If slightly negative due to float (e.g. -0.0000001), fix to 0, but if truly negative (personal use), keep it.
  // We use a small epsilon for zero check, but let big negatives stay.
  if (Math.abs(inventory) < 0.001) inventory = 0;
  else inventory = parseFloat(inventory.toFixed(2));

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