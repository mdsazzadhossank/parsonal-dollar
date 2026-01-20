import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Wallet, PiggyBank, Sparkles, Loader2, WifiOff } from 'lucide-react';
import { StatCard } from './components/StatCard';
import { TransactionForm } from './components/TransactionForm';
import { HistoryList } from './components/HistoryList';
import { AIModal } from './components/AIModal';
import { AccountSection } from './components/AccountSection';
import { Transaction, PortfolioStats } from './types';
import { calculatePortfolioAnalytics, formatCurrency, generateUUID } from './utils';
import { API_BASE_URL } from './api_config';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [stats, setStats] = useState<PortfolioStats>({
    totalRealizedProfit: 0,
    usdInventory: 0,
    avgBuyCost: 0,
    portfolioValueCost: 0
  });

  // Store individual transaction profits
  const [profits, setProfits] = useState<Record<string, number>>({});

  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // Fetch from Server
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsError(false);
      const res = await fetch(`${API_BASE_URL}/api.php?action=get_transactions`);
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      
      if (data.status === 'error') {
        throw new Error(data.message);
      }
      
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Recalculate stats whenever transactions change
  useEffect(() => {
    const { stats: newStats, profits: newProfits } = calculatePortfolioAnalytics(transactions);
    setStats(newStats);
    setProfits(newProfits);
  }, [transactions]);

  const handleAddTransaction = async (txData: Omit<Transaction, 'id' | 'timestamp' | 'date'>) => {
    const newTx: Transaction = {
      ...txData,
      id: generateUUID(),
      timestamp: Date.now(),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    // Optimistic Update (Show immediately)
    setTransactions(prev => [...prev, newTx]);

    // Send to DB
    try {
      const res = await fetch(`${API_BASE_URL}/api.php?action=save_transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTx)
      });
      
      const data = await res.json();
      
      if (data.status === 'error') {
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error("Failed to save transaction", error);
      alert(`ডাটাবেজে সেভ হয়নি! এরর: ${error.message || "Network Error"}`);
      // Rollback
      setTransactions(prev => prev.filter(tx => tx.id !== newTx.id));
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (confirm('Are you sure you want to delete this transaction? It will recalculate all history.')) {
      const txToDelete = transactions.find(t => t.id === id);
      
      // Optimistic Update
      setTransactions(prev => prev.filter(tx => tx.id !== id));

      // Delete from DB
      try {
        const res = await fetch(`${API_BASE_URL}/api.php?action=delete_transaction`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        const data = await res.json();
        
        if (data.status === 'error') {
          throw new Error(data.message);
        }
      } catch (error: any) {
        console.error("Failed to delete transaction", error);
        alert(`ডাটাবেজ থেকে মোছা যায়নি! এরর: ${error.message}`);
        // Rollback (Restore the deleted item)
        if (txToDelete) {
           setTransactions(prev => [...prev, txToDelete]);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <DollarSign className="text-white" size={20} />
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Dollar Trade Tracker</h1>
            </div>
            
            <button 
              onClick={() => setIsAIModalOpen(true)}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg"
            >
              <Sparkles size={16} className="text-yellow-400" />
              AI Insights (বাংলা)
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Loading / Error State */}
        {isLoading && (
          <div className="text-center py-10 flex flex-col items-center">
             <Loader2 className="animate-spin text-blue-600 mb-2" />
             <p className="text-gray-500">Loading data from database...</p>
          </div>
        )}

        {isError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2 border border-red-100">
             <WifiOff size={20} />
             <p>ডাটাবেজ কানেকশনে সমস্যা হয়েছে। URL ঠিক আছে কিনা এবং Xampp/Server চালু আছে কিনা চেক করুন।</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            label="Total Realized Profit"
            value={`${stats.totalRealizedProfit > 0 ? '+' : ''}${formatCurrency(stats.totalRealizedProfit, 'BDT')}`}
            subtext="Net earnings after fees"
            valueColor={stats.totalRealizedProfit >= 0 ? 'text-green-600' : 'text-red-600'}
            icon={<TrendingUp size={24} className={stats.totalRealizedProfit >= 0 ? 'text-green-500' : 'text-red-500'} />}
          />
          <StatCard 
            label="USD Inventory"
            value={formatCurrency(stats.usdInventory, 'USD')}
            subtext="Current dollars on hand"
            icon={<DollarSign size={24} className="text-blue-500" />}
            valueColor="text-gray-900"
          />
          <StatCard 
            label="Avg Buy Cost"
            value={formatCurrency(stats.avgBuyCost, 'BDT')}
            subtext="Includes fees"
            icon={<Wallet size={24} className="text-orange-500" />}
            valueColor="text-gray-900"
          />
          <StatCard 
            label="Portfolio Value (Cost)"
            value={formatCurrency(stats.portfolioValueCost, 'BDT')}
            subtext="Total capital locked"
            icon={<PiggyBank size={24} className="text-indigo-500" />}
            valueColor="text-gray-900"
          />
        </div>

        {/* Main Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Input */}
          <div className="lg:col-span-1">
            <TransactionForm 
              onAddTransaction={handleAddTransaction} 
              currentInventory={stats.usdInventory}
            />
          </div>

          {/* Right Column: History */}
          <div className="lg:col-span-2">
            <HistoryList 
              transactions={transactions} 
              onDelete={handleDeleteTransaction}
              profits={profits}
            />
          </div>
        </div>

        {/* Account Details Section */}
        <AccountSection />

      </main>

      {/* AI Modal */}
      <AIModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
        transactions={transactions}
        stats={stats}
      />
    </div>
  );
};

export default App;