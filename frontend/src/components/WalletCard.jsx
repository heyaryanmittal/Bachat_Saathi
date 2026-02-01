import React from 'react';

function WalletCard({ wallet, onEdit = () => {}, onDelete = () => {}, onTransfer = () => {} }) {
  const getWalletIcon = (type) => {
    switch (type) {
      case 'Cash': return '💵';
      case 'Bank': return '🏦';
      case 'Card': return '💳';
      default: return '📱';
    }
  };

  const getWalletGradient = (type) => {
    switch (type) {
      case 'Cash': return 'from-green-400 to-emerald-500';
      case 'Bank': return 'from-blue-400 to-indigo-500';
      case 'Card': return 'from-purple-400 to-pink-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };


  return (
    <div className="card-modern card-hover p-6 relative overflow-hidden group">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5 transform rotate-12 translate-x-8 -translate-y-8">
        <div className={`w-full h-full bg-gradient-to-br ${getWalletGradient(wallet.type)} rounded-full`}></div>
      </div>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 bg-gradient-to-br ${getWalletGradient(wallet.type)} rounded-xl flex items-center justify-center text-white text-xl shadow-lg`}>
            {getWalletIcon(wallet.type)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {wallet.name}
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-700 dark:to-gray-600 dark:text-gray-200">
              {wallet.type}
            </span>
          </div>
        </div>
      </div>
      
      {/* Balance Information */}
      <div className="mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Current Balance</p>
          <p className="text-3xl font-bold text-gradient">
            ₹{wallet.currentBalance?.toLocaleString() || '0'}
          </p>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onEdit(wallet)}
          className="flex-1 min-w-0 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-all duration-200 group/btn"
        >
          <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Edit</span>
        </button>
        
        <button
          onClick={() => onTransfer(wallet)}
          className="flex-1 min-w-0 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition-all duration-200 group/btn"
        >
          <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span>Transfer</span>
        </button>
        
        <button
          onClick={() => onDelete(wallet)}
          className="flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-all duration-200 group/btn"
        >
          <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default WalletCard;
