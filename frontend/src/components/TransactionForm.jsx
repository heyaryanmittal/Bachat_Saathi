import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { expenseCategories, incomeCategories } from '../config/categories';

const TransactionForm = ({ onSubmit, wallets, refreshWallets, initialData = null }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: initialData || {
      type: 'Expense',
      date: new Date().toISOString().split('T')[0]
    }
  });

  const transactionType = watch('type');

  const onSubmitForm = async (data) => {
    try {
      setIsLoading(true);

      const payload = {
        type: data.type,
        amount: Number(data.amount),
        walletId: data.walletId,        // ✅ backend expects walletId
        notes: data.description || '',    // ✅ map to notes
        date: data.date,
        category: data.category
      };

      await onSubmit(payload);

      // ✅ Refresh wallets after transaction so latest balance is fetched
      if (typeof refreshWallets === 'function') {
        await refreshWallets();
      }

      if (!initialData) reset();
    } catch (error) {
      console.error('Transaction error:', error);
      alert(error.response?.data?.message || 'Error creating transaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-5 p-6 bg-gray-900 rounded-xl border border-gray-800 shadow-lg">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-white">
          {initialData ? 'Edit Transaction' : 'Add New Transaction'}
        </h2>
        <p className="text-sm text-gray-400">
          {initialData ? 'Update your transaction details' : 'Record a new income or expense'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Transaction Type */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">Type</label>
          <div className="relative">
            <select
              {...register('type')}
              className="block w-full pl-3 pr-10 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 appearance-none"
            >
              <option value="Income" className="bg-gray-800 text-green-400">💰 Income</option>
              <option value="Expense" className="bg-gray-800 text-red-400">💸 Expense</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">Amount (₹)</label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <input
              type="number"
              step="0.01"
              min="0.01"
              {...register('amount', { 
                required: "Please enter an amount",
                min: { value: 0.01, message: "Amount must be greater than 0" }
              })}
              className="block w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all duration-200"
              placeholder="0.00"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-sm">INR</span>
            </div>
          </div>
          {errors.amount && (
            <p className="mt-1 text-xs text-red-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mr-1 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {errors.amount.message}
            </p>
          )}
        </div>

        {/* Wallet */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">Wallet</label>
          <div className="relative">
            <select
              {...register('walletId', { required: "Please select a wallet" })}
              className="block w-full pl-3 pr-10 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 appearance-none"
            >
              <option value="" className="text-gray-500">Select Wallet</option>
              {wallets.map(wallet => (
                <option key={wallet._id} value={wallet._id} className="bg-gray-800 text-gray-200">
                  {wallet.name} (₹{wallet.currentBalance?.toLocaleString() || '0'})
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
          {errors.walletId && (
            <p className="mt-1 text-xs text-red-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mr-1 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {errors.walletId.message}
            </p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">Category</label>
          <div className="relative">
            <select
              {...register('category', { required: "Please select a category" })}
              className="block w-full pl-3 pr-10 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 appearance-none"
            >
              <option value="" className="text-gray-500">Select Category</option>
              {(transactionType === 'Income' ? incomeCategories : expenseCategories).map((category) => (
                <option 
                  key={category.name}
                  value={category.name}
                  className={`bg-gray-800 ${transactionType === 'Income' ? 'text-green-400' : 'text-red-400'}`}
                >
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {errors.category && (
            <p className="mt-1 text-xs text-red-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mr-1 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {errors.category.message}
            </p>
          )}
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">Date</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              type="date"
              {...register('date', { required: "Please select a date" })}
              className="block w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            />
          </div>
          {errors.date && (
            <p className="mt-1 text-xs text-red-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mr-1 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {errors.date.message}
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">Notes</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <input
              type="text"
              {...register('description')}
              className="block w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all duration-200"
              placeholder="Add a note (optional)"
            />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none flex items-center justify-center space-x-2 shadow-lg hover:shadow-indigo-500/20"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Processing...</span>
            </>
          ) : (
            <>
              {initialData ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  <span>Update Transaction</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Transaction</span>
                </>
              )}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
