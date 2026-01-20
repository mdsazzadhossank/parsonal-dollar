import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Transaction, PortfolioStats } from '../types';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  stats: PortfolioStats;
}

export const AIModal: React.FC<AIModalProps> = ({ isOpen, onClose, transactions, stats }) => {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen && transactions.length > 0) {
      generateInsight();
    } else if (isOpen && transactions.length === 0) {
        setInsight("কোনো লেনদেনের তথ্য পাওয়া যায়নি। অনুগ্রহ করে কিছু লেনদেন যুক্ত করুন।");
    }
  }, [isOpen]);

  const generateInsight = async () => {
    setLoading(true);
    setError('');
    setInsight('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `
        You are a smart financial trading assistant. The user is trading USD against BDT (Bangladeshi Taka).
        
        Here is their current portfolio status:
        - Total Realized Profit: ${stats.totalRealizedProfit} BDT
        - Current USD Inventory: $${stats.usdInventory}
        - Average Buy Cost: ${stats.avgBuyCost} BDT per USD
        - Total Capital Locked: ${stats.portfolioValueCost} BDT
        
        Recent Transactions (Last 5):
        ${JSON.stringify(transactions.slice(-5))}
        
        Analyze this data. 
        1. Are they profitable?
        2. Is their average buy cost good compared to a hypothetical market rate of 118-125 BDT?
        3. Give a short strategic suggestion (e.g., hold, sell if market goes up, etc).
        
        IMPORTANT: OUTPUT MUST BE IN BENGALI LANGUAGE (Bangla). Keep it professional yet friendly. Use markdown formatting.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setInsight(response.text || "দুঃখিত, কোনো তথ্য পাওয়া যায়নি।");
    } catch (err) {
      console.error(err);
      setError("AI বিশ্লেষণ তৈরি করতে সমস্যা হয়েছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-gray-900 p-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <Sparkles className="text-yellow-400" />
            <h2 className="text-xl font-bold text-white">AI Insights (বাংলা)</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto grow">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="animate-spin text-blue-600" size={48} />
              <p className="text-gray-500 animate-pulse">আপনার ডেটা বিশ্লেষণ করা হচ্ছে...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center">
              {error}
            </div>
          ) : (
            <div className="prose prose-slate max-w-none">
                {/* Rendering markdown-like text simply for now */}
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-lg">
                    {insight}
                </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t bg-gray-50 shrink-0 text-right">
             <button 
                onClick={onClose}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
                বন্ধ করুন
            </button>
        </div>
      </div>
    </div>
  );
};
