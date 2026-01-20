import React, { useState, useEffect } from 'react';
import { Plus, Minus, DollarSign, ShoppingBag } from 'lucide-react';
import { Transaction, TransactionType } from '../types';

interface TransactionFormProps {
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'timestamp' | 'date'>) => void;
  currentInventory: number;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onAddTransaction, currentInventory }) => {
  const [type, setType] = useState<TransactionType>('BUY');
  const [amountUSD, setAmountUSD] = useState<string>('');
  const [rate, setRate] = useState<string>('');
  const [fees, setFees] = useState<string>('');
  const [calculatedTotal, setCalculatedTotal] = useState<number>(0);

  // Calculate total whenever inputs change
  useEffect(() => {
    const amount = parseFloat(amountUSD) || 0;
    const r = parseFloat(rate) || 0;
    const f = parseFloat(fees) || 0;

    if (type === 'BUY') {
      // Cost = (Amount * Rate) + Fees
      setCalculatedTotal((amount * r) + f);
    } else {
      // For SELL or PERSONAL: Net Value = (Amount * Rate) - Fees
      // For Personal use, this represents the Market Value consumed minus any transaction costs
      setCalculatedTotal((amount * r) - f);
    }
  }, [amountUSD, rate, fees, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountUSD);
    const r = parseFloat(rate);
    const f = parseFloat(fees) || 0;

    if (!amount || !r) return;

    if ((type === 'SELL' || type === 'PERSONAL') && amount > currentInventory) {
      alert(`Cannot ${type === 'PERSONAL' ? 'use' : 'sell'} $${amount}. You only have $${currentInventory} in inventory.`);
      return;
    }

    onAddTransaction({
      type,
      amountUSD: amount,
      exchangeRate: r,
      extraFees: f,
      totalBDT: calculatedTotal
    });

    // Reset
    setAmountUSD('');
    setFees('');
    // We usually keep rate as it changes less frequently
  };

  const getSubmitLabel = () => {
      switch(type) {
          case 'BUY': return 'Confirm Purchase';
          case 'SELL': return 'Confirm Sale';
          case 'PERSONAL': return 'Confirm Personal Use';
      }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-blue-100 p-1 rounded-full">
           <Plus size={16} className="text-blue-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-800">New Transaction</h2>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
        <button
          onClick={() => setType('BUY')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${
            type === 'BUY' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Plus size={14} /> Buy
        </button>
        <button
          onClick={() => setType('SELL')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${
            type === 'SELL' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Minus size={14} /> Sell
        </button>
        <button
          onClick={() => setType('PERSONAL')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${
            type === 'PERSONAL' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ShoppingBag size={14} /> Personal
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Amount (USD)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              step="0.01"
              value={amountUSD}
              onChange={(e) => setAmountUSD(e.target.value)}
              placeholder="0.00"
              className="w-full pl-7 pr-4 py-2.5 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
             {type === 'PERSONAL' ? 'Current Market Rate (Ref only)' : 'Exchange Rate (BDT/USD)'}
          </label>
          <input
            type="number"
            step="0.01"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="e.g. 120.50"
            className="w-full px-4 py-2.5 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Extra Charges / Fees (BDT)</label>
          <input
            type="number"
            step="0.01"
            value={fees}
            onChange={(e) => setFees(e.target.value)}
            placeholder="e.g. 50"
            className="w-full px-4 py-2.5 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
          />
        </div>

        <div className="flex justify-between items-center py-2 border-t border-gray-100 mt-2">
          <span className="text-sm text-gray-500">
            {type === 'BUY' ? 'Total Cost:' : type === 'SELL' ? 'Net Receive:' : 'Est. Market Value:'}
          </span>
          <span className="text-lg font-bold text-gray-900">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BDT' }).format(calculatedTotal)}
          </span>
        </div>

        <button
          type="submit"
          className={`w-full py-3 rounded-lg text-white font-semibold shadow-lg transition-transform active:scale-[0.98] ${
            type === 'BUY' 
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' 
                : type === 'SELL'
                    ? 'bg-gray-800 hover:bg-gray-900 shadow-gray-200'
                    : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
          }`}
        >
          {getSubmitLabel()}
        </button>
      </form>
    </div>
  );
};