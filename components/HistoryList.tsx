import React from 'react';
import { Transaction } from '../types';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';

interface HistoryListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ transactions, onDelete }) => {
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

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full min-h-[400px]">
      <h2 className="text-lg font-bold text-gray-800 mb-6">Recent History</h2>
      
      <div className="space-y-4">
        {sorted.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-50 hover:border-gray-100 hover:bg-gray-50 transition-colors group">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                tx.type === 'BUY' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {tx.type === 'BUY' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {tx.type === 'BUY' ? 'Bought USD' : 'Sold USD'}
                </p>
                <p className="text-xs text-gray-400">{tx.date}</p>
              </div>
            </div>

            <div className="text-right">
              <p className={`font-bold ${tx.type === 'BUY' ? 'text-gray-900' : 'text-gray-900'}`}>
                {tx.type === 'BUY' ? '+' : '-'}${tx.amountUSD.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                @ {tx.exchangeRate} BDT
              </p>
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
