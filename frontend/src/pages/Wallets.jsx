import { useState, useEffect } from 'react';
import * as api from '../services/api';
import WalletCard from '../components/WalletCard';

const Wallets = () => {
  const [wallets, setWallets] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newWallet, setNewWallet] = useState({
    name: '',
    type: 'Cash',
    openingBalance: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [editingWallet, setEditingWallet] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferFrom, setTransferFrom] = useState(null);
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    wallet: null
  });

  useEffect(() => {
    console.log('Wallets component mounted, calling fetchWallets...');
    fetchWallets();
  }, []);

  const handleDeleteWallet = async (wallet) => {
    setDeleteModal({ show: true, wallet: wallet });
  };

  const confirmDeleteWallet = async () => {
    try {
      await api.deleteWallet(deleteModal.wallet._id);
      setWallets(wallets.filter(w => w._id !== deleteModal.wallet._id));
      setDeleteModal({ show: false, wallet: null });
      setError(''); // Clear any previous errors
      setInfoMessage(''); // Clear any previous info messages
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error deleting wallet';
      setDeleteModal({ show: false, wallet: null });

      // Check if it's a time-based restriction (12 hours or 24 hours)
      if (errorMessage.includes('12 hours') || errorMessage.includes('24 hours')) {
        setInfoMessage(errorMessage);
        setError(''); // Clear error state
      } else {
        setError(errorMessage);
        setInfoMessage(''); // Clear info state
      }
    }
  };

  const fetchWallets = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Fetching wallets...');
      const response = await api.getWallets();
      console.log('✅ Wallets response:', response);

      if (response.data && response.data.data && response.data.data.wallets) {
        setWallets(response.data.data.wallets);
        setError('');
        console.log('✅ Successfully loaded', response.data.data.wallets.length, 'wallets');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('❌ Fetch wallets error:', err.response?.data || err.message);
      console.error('❌ Full error object:', err);

      // Provide more specific error messages
      let errorMessage = 'Unable to load wallets';
      if (err.response?.status === 401) {
        errorMessage = 'Please log in again';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error - please check if backend is running';
      } else if (err.code === 'ECONNREFUSED') {
        errorMessage = 'Backend server not running on port 5001';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const openTransferModal = (wallet) => {
    setTransferFrom(wallet._id);
    setTransferTo('');
    setTransferAmount('');
    setTransferNotes('');
    setShowTransferModal(true);
  };

  const submitTransfer = async (e) => {
    e.preventDefault();
    if (!transferFrom || !transferTo || !transferAmount) {
      setError('Please fill all transfer fields');
      return;
    }
    if (transferFrom === transferTo) {
      setError('Source and destination wallets must be different');
      return;
    }
    if (!wallets.find(w => w._id === transferTo)) {
      setError('Please select a valid destination wallet');
      return;
    }

    try {
      setIsTransferring(true);
      const payload = {
        type: 'Transfer',
        amount: Number(transferAmount),
        walletId: transferFrom,
        notes: transferNotes,
        date: new Date()
      };
      // Only add toWallet if valid
      if (transferTo) {
        payload.toWallet = transferTo;
      }

      await api.createTransaction(payload);
      await fetchWallets();
      setShowTransferModal(false);
      setError('');
    } catch (err) {
      console.error('Transfer error:', err.response?.data || err.message || err);
      setError(err.response?.data?.message || 'Error creating transfer');
    } finally {
      setIsTransferring(false);
    }
  };

  const handleCreateWallet = async (e) => {
    e.preventDefault();
    try {
      // Send correct field names as required by backend (openingBalance)
      const payload = {
        name: newWallet.name,
        type: newWallet.type,
        openingBalance: newWallet.openingBalance
      };

      const response = await api.createWallet(payload);

      // Option 1: Re-fetch wallets to ensure correct data
      await fetchWallets();

      // Option 2 (if you want instant UI update without re-fetching):
      // setWallets([...wallets, response.data.data.wallet]);

      setIsCreating(false);
      setNewWallet({ name: '', type: 'Cash', openingBalance: 0 });
      setError('');
    } catch (err) {
      console.error("Wallet creation error:", err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error creating wallet');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your wallets...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            If this takes too long, please check if the backend server is running on port 5001
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Banner Section */}
      <div className="text-center py-8 px-4">
        <h1 className="text-4xl font-bold mb-2">
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            My Wallets
          </span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Manage and track all your financial accounts in one place
        </p>
      </div>

      <div className="flex justify-end mb-8">
        <button
          onClick={() => setIsCreating(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add Wallet</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl mb-6">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="font-medium">{error}</p>
              <p className="text-sm mt-1">💡 Please follow the instructions in BACKEND_STARTUP_README.md to start the backend server.</p>
              <div className="mt-3 flex space-x-3">
                <button
                  onClick={() => fetchWallets()}
                  className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Retry
                </button>
                <a
                  href="/BACKEND_STARTUP_README.md"
                  target="_blank"
                  className="text-sm bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded"
                >
                  View Instructions
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {infoMessage && (
        <div className="relative mb-6 animate-fadeInUp">
          {/* 3D Animated Container */}
          <div className="relative bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 shadow-2xl transform hover:scale-105 transition-all duration-500 overflow-hidden">
            
            {/* Animated Background Particles */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-400/20 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
              <div className="absolute top-8 right-8 w-6 h-6 bg-indigo-400/20 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute bottom-4 left-1/3 w-4 h-4 bg-purple-400/20 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
              <div className="absolute top-1/2 right-4 w-3 h-3 bg-blue-300/30 rounded-full animate-pulse"></div>
            </div>

            {/* Floating 3D Icon */}
            <div className="flex items-start space-x-4 relative z-10">
              <div className="relative animate-float3D">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-6 transition-transform duration-300 animate-glow3D">
                  {/* 3D Shadow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl transform translate-x-1 translate-y-1 -z-10 opacity-50"></div>
                  
                  {/* Animated Clock Icon */}
                  <div className="relative animate-wiggle">
                    <svg className="w-8 h-8 text-white animate-spin" style={{animationDuration: '3s'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    
                    {/* Glowing Ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"></div>
                  </div>
                </div>
                
                {/* Floating Sparkles */}
                <div className="absolute -top-2 -right-2 w-4 h-4 animate-sparkle">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                </div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 animate-sparkle" style={{animationDelay: '1s'}}>
                  <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
                </div>
                <div className="absolute top-1 left-8 w-2 h-2 animate-sparkle" style={{animationDelay: '0.5s'}}>
                  <div className="w-1 h-1 bg-purple-300 rounded-full"></div>
                </div>
              </div>

              {/* Content with 3D Text Effect */}
              <div className="flex-1">
                <div className="relative">
                  <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 mb-2 transform hover:scale-105 transition-transform duration-300">
                    ⏰ Wallet Protection Active
                  </h3>
                  {/* Text Shadow Effect */}
                  <div className="absolute inset-0 text-xl font-bold text-blue-200 dark:text-blue-800 transform translate-x-0.5 translate-y-0.5 -z-10 mb-2">
                    ⏰ Wallet Protection Active
                  </div>
                </div>
                
                <div className="relative">
                  <p className="text-blue-800 dark:text-blue-200 leading-relaxed transform hover:translate-x-1 transition-transform duration-300">
                    {infoMessage}
                  </p>
                  {/* Subtle text shadow */}
                  <div className="absolute inset-0 text-blue-300 dark:text-blue-700 transform translate-x-0.5 translate-y-0.5 -z-10">
                    {infoMessage}
                  </div>
                </div>

                {/* Animated Progress Bar */}
                <div className="mt-4 relative">
                  <div className="w-full h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 rounded-full animate-pulse transform origin-left animate-slideInLeft"></div>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-1 animate-fadeInUp">
                    🛡️ Security cooldown period active
                  </p>
                </div>
              </div>

              {/* 3D Close Button */}
              <button 
                onClick={() => setInfoMessage('')}
                className="relative group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 hover:rotate-12 transition-all duration-300 group-hover:shadow-2xl">
                  {/* 3D Shadow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-pink-700 rounded-xl transform translate-x-0.5 translate-y-0.5 -z-10 opacity-50 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-300"></div>
                  
                  <svg className="w-5 h-5 text-white transform group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-xl bg-red-400/20 scale-0 group-hover:scale-150 transition-transform duration-300 -z-20"></div>
              </button>
            </div>

            {/* Animated Border Glow */}
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 opacity-20 animate-pulse"></div>
            
            {/* Corner Decorations */}
            <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-blue-300 dark:border-blue-600 rounded-tl-lg"></div>
            <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-indigo-300 dark:border-indigo-600 rounded-tr-lg"></div>
            <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-purple-300 dark:border-purple-600 rounded-bl-lg"></div>
            <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-blue-300 dark:border-blue-600 rounded-br-lg"></div>
          </div>
        </div>
      )}


      {(isCreating || editingWallet) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingWallet ? 'Edit Wallet' : 'Create New Wallet'}
          </h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (editingWallet) {
                try {
                  const payload = {
                    name: editingWallet.name,
                    type: editingWallet.type,
                    openingBalance: editingWallet.openingBalance
                  };
                  await api.updateWallet(editingWallet._id, payload);
                  await fetchWallets();
                  setEditingWallet(null);
                  setError('');
                } catch (err) {
                  setError(err.response?.data?.message || 'Error updating wallet');
                }
              } else {
                await handleCreateWallet(e);
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Wallet Name
              </label>
              <input
                type="text"
                value={editingWallet ? editingWallet.name : newWallet.name}
                onChange={(e) => {
                  if (editingWallet) {
                    setEditingWallet({ ...editingWallet, name: e.target.value });
                  } else {
                    setNewWallet({ ...newWallet, name: e.target.value });
                  }
                }}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Type
              </label>
              <select
                value={editingWallet ? editingWallet.type : newWallet.type}
                onChange={(e) => {
                  if (editingWallet) {
                    setEditingWallet({ ...editingWallet, type: e.target.value });
                  } else {
                    setNewWallet({ ...newWallet, type: e.target.value });
                  }
                }}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
              >
                <option value="Cash">Cash</option>
                <option value="Bank">Bank</option>
                <option value="Card">Card</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Opening Balance (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editingWallet ? editingWallet.openingBalance : newWallet.openingBalance}
                onChange={(e) => {
                  const val = e.target.value;
                  if (editingWallet) {
                    setEditingWallet({
                      ...editingWallet,
                      openingBalance: val === '' ? 0 : parseFloat(val)
                    });
                  } else {
                    setNewWallet({
                      ...newWallet,
                      openingBalance: val === '' ? 0 : parseFloat(val)
                    });
                  }
                }}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  if (editingWallet) {
                    setEditingWallet(null);
                  } else {
                    setIsCreating(false);
                  }
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {editingWallet ? 'Update Wallet' : 'Create Wallet'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No wallets found</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {error ? 'There was an error loading your wallets.' : 'You haven\'t created any wallets yet.'}
            </p>
            {error && (
              <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4">
                <p className="font-medium">Error Details:</p>
                <p>{error}</p>
                <p className="text-sm mt-2">💡 Try refreshing the page or check if the backend server is running.</p>
              </div>
            )}
            <button
              onClick={() => fetchWallets()}
              className="btn-primary"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry Loading
            </button>
          </div>
        ) : (
          wallets.map(wallet => (
            <WalletCard
              key={wallet._id}
              wallet={wallet}
              onEdit={() => setEditingWallet(wallet)}
              onDelete={() => handleDeleteWallet(wallet)}
              onTransfer={() => openTransferModal(wallet)}
              // Removed onViewHistory
            />
          ))
        )}
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft w-full max-w-md p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-white">Create Transfer</h3>
            <form onSubmit={submitTransfer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From</label>
                <select value={transferFrom} onChange={(e) => setTransferFrom(e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 dark:focus:border-indigo-400 dark:focus:ring-indigo-400">
                  <option value="">Select source</option>
                  {wallets.map(w => <option key={w._id} value={w._id}>{w.name} (₹{w.currentBalance})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To</label>
                <select value={transferTo} onChange={(e) => setTransferTo(e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 dark:focus:border-indigo-400 dark:focus:ring-indigo-400">
                  <option value="">Select destination</option>
                  {wallets.filter(w => w._id !== transferFrom).map(w => <option key={w._id} value={w._id}>{w.name} (₹{w.currentBalance})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</label>
                <input type="number" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 dark:focus:border-indigo-400 dark:focus:ring-indigo-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                <input type="text" value={transferNotes} onChange={(e) => setTransferNotes(e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 dark:focus:border-indigo-400 dark:focus:ring-indigo-400" />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowTransferModal(false)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200">Cancel</button>
                <button type="submit" disabled={isTransferring} className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg">{isTransferring ? 'Sending...' : 'Send Transfer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Delete Wallet Confirmation
            </h3>
            <div className="mb-4">
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Are you sure you want to delete this wallet?
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <p className="font-medium text-gray-900 dark:text-white">
                  {deleteModal.wallet?.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Type: {deleteModal.wallet?.type}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Balance: ₹{deleteModal.wallet?.currentBalance?.toLocaleString() || '0'}
                </p>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                ⚠️ This action cannot be undone.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={confirmDeleteWallet}
                className="btn-primary bg-red-600 hover:bg-red-700 flex-1"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteModal({ show: false, wallet: null })}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallets;
