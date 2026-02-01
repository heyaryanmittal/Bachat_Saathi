import React, { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { expenseCategories } from "../config/categories";

function BudgetForm({ onSubmit, initialData = null }) {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, control } = useForm({
    defaultValues: {
      ...initialData,
      alertThreshold: initialData?.alertThreshold ? initialData.alertThreshold * 100 : 80,
      monthYear: initialData ? `${initialData.year}-${String(initialData.month).padStart(2, '0')}` : ''
    },
  });

  // Use only expense categories for budgets
  const categories = expenseCategories;

  const watchAlertThreshold = useWatch({
    control,
    name: 'alertThreshold',
    defaultValue: 80
  });

  const handleFormSubmit = async (data) => {
    setIsLoading(true);
    try {
      const [year, month] = data.monthYear.split("-").map(Number);

      const payload = {
        category: data.category,
        amount: Number(data.amount),
        alertThreshold: Number(data.alertThreshold) / 100, // convert % → fraction
        month,
        year,
      };

      await onSubmit(payload);
    } catch (error) {
      console.error("Error submitting budget:", error);
      // Error handling can be enhanced with toast notifications
    } finally {
      setIsLoading(false);
    }
  };

  // Set default month to current month if not editing
  useEffect(() => {
    if (!initialData) {
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      setValue('monthYear', `${year}-${month}`);
    }
  }, [initialData, setValue]);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 p-6 bg-gray-900 rounded-xl border border-gray-800 shadow-lg">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-white">
          {initialData ? 'Edit Budget' : 'Create New Budget'}
        </h2>
        <p className="text-sm text-gray-400">
          {initialData ? 'Update your budget details' : 'Set up a new budget category'}
        </p>
      </div>
      {/* Category */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300">
          Category
        </label>
        <div className="relative">
          <select
            {...register("category", { required: "Please select a category" })}
            className="block w-full pl-3 pr-10 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 appearance-none"
          >
            <option value="" className="text-gray-500">Select a category</option>
            {categories.map((category) => (
              <option 
                key={category.name} 
                value={category.name}
                className="bg-gray-800 text-gray-200"
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

      {/* Amount */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300">
          Budget Amount (₹)
        </label>
        <div className="relative rounded-lg shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register("amount", { 
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

      {/* Month */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300">
          Budget Month
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            type="month"
            {...register("monthYear", { 
              required: "Please select a month",
              validate: (value) => {
                const [year, month] = value.split('-').map(Number);
                const selectedDate = new Date(year, month - 1);
                const minDate = new Date(2020, 0); // January 2020
                const maxDate = new Date(2030, 11); // December 2030
                
                if (selectedDate < minDate || selectedDate > maxDate) {
                  return "Please select a date between 2020 and 2030";
                }
                return true;
              }
            })}
            className="block w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          />
        </div>
        {errors.monthYear && (
          <p className="mt-1 text-xs text-red-400 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mr-1 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {errors.monthYear.message}
          </p>
        )}
      </div>

      {/* Threshold */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-300">
            Alert Threshold
          </label>
          <span className="text-sm font-medium text-indigo-400 bg-indigo-900/30 px-2.5 py-1 rounded-full">
            {watchAlertThreshold || 80}%
          </span>
        </div>
        <div className="relative pt-1">
          <input
            type="range"
            min="50"
            max="100"
            step="5"
            {...register("alertThreshold", { 
              min: { value: 50, message: "Minimum 50%" },
              max: { value: 100, message: "Maximum 100%" }
            })}
            className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:cursor-ew-resize [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:hover:bg-indigo-400 [&::-webkit-slider-thumb]:active:bg-indigo-600 [&::-webkit-slider-thumb]:active:scale-110"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1 px-0.5">
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
        <p className="text-xs text-gray-400">
          Get notified when you reach {watchAlertThreshold || 80}% of your budget
        </p>
        {errors.alertThreshold && (
          <p className="mt-1 text-xs text-red-400 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mr-1 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {errors.alertThreshold.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
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
                  <span>Update Budget</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create Budget</span>
                </>
              )}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default BudgetForm;
