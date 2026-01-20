import React from 'react';
import { Transaction } from '../types';
import { Trash2, TrendingUp, TrendingDown, ShoppingBag } from 'lucide-react';

interface HistoryListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  profits?: Record<string, number>;
}

export const HistoryList: React.FC<HistoryListProps> = ({ transactions, onDelete, profits = {} }) => {
  if (transactions.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-full min-h-[400px] flex flex-col items-center justify-center text-center">
        <div className="bg-gray-50 p-4 rounded-full mb-4">
          <TrendingUp className="text-gray-300" size={32} />
        </div>
        <p className="text-gray-400 font-medium">No transactions yet.</p>
        <p className="text-gray-300 text-sm mt-1">Start by adding a buy or sell record.</p>
      </div>
    );
  }

  // Show newest first
  const sorted = [...transactions].sort((a, b) => b.timestamp - a.timestamp);

  const getIcon = (type: string) => {
      switch(type) {
          case 'BUY': return <TrendingUp size={18} />;
          case 'SELL': return <TrendingDown size={18} />;
          case 'PERSONAL': return <ShoppingBag size={18} />;
          default: return <TrendingUp size={18} />;
      }
  };

  const getColors = (type: string) => {
      switch(type) {
          case 'BUY': return 'bg-green-100 text-green-600';
          case 'SELL': return 'bg-red-100 text-red-600';
          case 'PERSONAL': return 'bg-purple-100 text-purple-600';
          default: return 'bg-gray-100 text-gray-600';
      }
  };

  const getTitle = (type: string) => {
      switch(type) {
          case 'BUY': return 'Bought USD';
          case 'SELL': return 'Sold USD';
          case 'PERSONAL': return 'Personal Use';
          default: return 'Transaction';
      }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full min-h-[400px]">
      <h2 className="text-lg font-bold text-gray-800 mb-6">Recent History</h2>
      
      <div className="space-y-4">
        {sorted.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-50 hover:border-gray-100 hover:bg-gray-50 transition-colors group">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getColors(tx.type)}`}>
                {getIcon(tx.type)}
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {getTitle(tx.type)}
                </p>
                <p className="text-xs text-gray-400">{tx.date}</p>
              </div>
            </div>

            <div className="text-right">
              <p className={`font-bold ${tx.type === 'BUY' ? 'text-gray-900' : 'text-gray-900'}`}>
                {tx.type === 'BUY' ? '+' : '-'}${tx.amountUSD.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mb-1">
                @ {tx.exchangeRate} BDT
              </p>
              
              {/* Profit Display for Sell and Personal Transactions */}
              {(tx.type === 'SELL' || tx.type === 'PERSONAL') && profits[tx.id] !== undefined && (
                <div className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block ${
                  profits[tx.id] >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {profits[tx.id] >= 0 ? (tx.type === 'PERSONAL' ? 'Saved: +' : 'Profit: +') : 'Loss: '}
                  {Math.abs(profits[tx.id]).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ৳
                </div>
              )}
            </div>
            
            <button 
                onClick={() => onDelete(tx.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all"
                title="Delete Transaction"
            >
                <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};