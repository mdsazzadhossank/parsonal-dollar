import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Save, Eye, EyeOff, Trash2, Plus, Users, Copy, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../api_config';
import { generateUUID } from '../utils';

interface Account {
  id: string;
  username: string;
  email: string;
  phone: string;
  password: string;
}

export const AccountSection: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  
  // State for toggling password visibility in the list
  const [visiblePasswordId, setVisiblePasswordId] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api.php?action=get_accounts`);
      if(res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
           setAccounts(data);
        }
      }
    } catch (e) {
      console.error("Fetch accounts error", e);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username && !email && !phone) {
        setMessage('Please enter at least a Username, Email or Phone.');
        return;
    }

    const newAccount: Account = {
        id: generateUUID(),
        username,
        email,
        phone,
        password
    };

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api.php?action=save_account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccount)
      });
      
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setAccounts([...accounts, newAccount]);
        // Reset form
        setUsername('');
        setEmail('');
        setPhone('');
        setPassword('');
        setMessage('অ্যাকাউন্ট সফলভাবে ডাটাবেজে যুক্ত করা হয়েছে!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`Error: ${data.message || 'Failed to save'}`);
      }
    } catch (err: any) {
      console.error(err);
      setMessage(`Network error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
      if(!confirm('আপনি কি নিশ্চিত যে আপনি এই অ্যাকাউন্টের তথ্য মুছে ফেলতে চান?')) return;
      
      const accToDelete = accounts.find(a => a.id === id);
      
      // Optimistic update
      const updatedList = accounts.filter(acc => acc.id !== id);
      setAccounts(updatedList);

      try {
        const res = await fetch(`${API_BASE_URL}/api.php?action=delete_account`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        const data = await res.json();
        
        if (data.status === 'error') {
            throw new Error(data.message);
        }

      } catch (err: any) {
        console.error("Delete failed", err);
        alert(`ডাটাবেজ থেকে মোছা যায়নি! ${err.message}`);
        // Rollback
        if (accToDelete) setAccounts(prev => [...prev, accToDelete]);
      }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage('Copied!');
    setTimeout(() => setMessage(''), 1500);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
      <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
        <div className="bg-purple-100 p-2 rounded-full">
          <Users size={20} className="text-purple-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-800">Account Manager (অ্যাকাউন্ট ম্যানেজার)</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-gray-100 pb-6 lg:pb-0 lg:pr-6">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Plus size={16} className="text-purple-600" />
                Add New Account
            </h3>
            <form onSubmit={handleAddAccount} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Username</label>
                    <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder="Username"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                    <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder="Email"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label>
                    <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder="Phone"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Password</label>
                    <div className="relative">
                        <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-3 pr-10 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="Password"
                        />
                        <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-all text-sm shadow-sm disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        Add Account Info
                    </button>
                    {message && <p className={`text-center text-xs mt-2 font-medium ${message.includes('Error') || message.includes('failed') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
                </div>
            </form>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Users size={16} className="text-gray-500" />
                Saved Accounts ({accounts.length})
            </h3>
            
            {accounts.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <p className="text-gray-400 text-sm">No accounts in database.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                    {accounts.map((acc) => (
                        <div key={acc.id} className="relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group">
                            <button 
                                onClick={() => handleDelete(acc.id)}
                                className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                title="Delete"
                            >
                                <Trash2 size={16} />
                            </button>

                            <div className="space-y-3">
                                {acc.username && (
                                    <div className="flex items-center gap-2 text-sm text-gray-800">
                                        <User size={14} className="text-gray-400 shrink-0" />
                                        <span className="font-medium truncate">{acc.username}</span>
                                        <button onClick={() => copyToClipboard(acc.username)} className="text-gray-300 hover:text-blue-500 ml-auto">
                                            <Copy size={12} />
                                        </button>
                                    </div>
                                )}
                                {acc.email && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Mail size={14} className="text-gray-400 shrink-0" />
                                        <span className="truncate">{acc.email}</span>
                                        <button onClick={() => copyToClipboard(acc.email)} className="text-gray-300 hover:text-blue-500 ml-auto">
                                            <Copy size={12} />
                                        </button>
                                    </div>
                                )}
                                {acc.phone && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone size={14} className="text-gray-400 shrink-0" />
                                        <span>{acc.phone}</span>
                                        <button onClick={() => copyToClipboard(acc.phone)} className="text-gray-300 hover:text-blue-500 ml-auto">
                                            <Copy size={12} />
                                        </button>
                                    </div>
                                )}
                                {acc.password && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600 pt-1 border-t border-gray-50 mt-2">
                                        <Lock size={14} className="text-gray-400 shrink-0" />
                                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs truncate max-w-[150px]">
                                            {visiblePasswordId === acc.id ? acc.password : '••••••••'}
                                        </span>
                                        <button 
                                            onClick={() => setVisiblePasswordId(visiblePasswordId === acc.id ? null : acc.id)}
                                            className="text-gray-400 hover:text-purple-600 ml-auto"
                                        >
                                            {visiblePasswordId === acc.id ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                         <button onClick={() => copyToClipboard(acc.password)} className="text-gray-300 hover:text-blue-500 ml-1">
                                            <Copy size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};