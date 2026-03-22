import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { expenseCategories, incomeCategories } from '../config/categories';
import { Button, Input, UISelect } from './ui';
import { numberToWords } from '../utils/numberToWords';

function RecurringForm({ onSubmit, wallets, initialData = null }) {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: initialData || {
      type: 'Expense',
      cadence: 'monthly'
    }
  });

  const type = watch('type');
  const amount = watch('amount');
  const categories = type === 'Expense' 
    ? expenseCategories 
    : incomeCategories;

  const handleFormSubmit = async (data) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting recurring rule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 animate-entrance">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UISelect
          label="Flow Type"
          id="recurring-type"
          {...register('type', { required: 'Type is required' })}
          options={[
            { value: 'Expense', label: 'Outbound' },
            { value: 'Income', label: 'Inbound' }
          ]}
          error={errors.type?.message}
        />

        <UISelect
          label="Execution Node"
          id="recurring-wallet"
          {...register('walletId', { required: 'Wallet is required' })}
          options={wallets.map(wallet => ({ value: wallet._id, label: wallet.name }))}
          error={errors.walletId?.message}
          placeholder="Select a node"
        />

        <div className="space-y-1">
          <Input
            label="Magnitude (₹)"
            id="recurring-amount"
            type="number"
            {...register('amount', {
              required: 'Amount is required',
              min: { value: 0.01, message: 'Amount must be positive' }
            })}
            placeholder="0.00"
            error={errors.amount?.message}
          />
          {amount > 0 && (
            <p className="text-[10px] font-black text-primary uppercase tracking-widest ml-4 animate-in fade-in slide-in-from-top-1">
              {numberToWords(Number(amount))}
            </p>
          )}
        </div>

        <UISelect
          label="Classification"
          id="recurring-category"
          {...register('category', { required: 'Category is required' })}
          options={categories.map(cat => ({ value: cat.name, label: `${cat.icon || ''} ${cat.name}` }))}
          error={errors.category?.message}
          placeholder="Select categories"
        />

        <UISelect
          label="Execution Cadence"
          id="recurring-cadence"
          {...register('cadence', { required: 'Cadence is required' })}
          options={[
            { value: 'weekly', label: 'Weekly Interval' },
            { value: 'monthly', label: 'Monthly Cycle' }
          ]}
          error={errors.cadence?.message}
        />

        <Input
          label="Start Horizon"
          id="recurring-start"
          type="date"
          {...register('startDate', { required: 'Start date is required' })}
          error={errors.startDate?.message}
        />

        <Input
          label="End Horizon (Optional)"
          id="recurring-end"
          type="date"
          {...register('endsAt')}
        />
      </div>

      <Button
        type="submit"
        className="w-full btn-saas-primary mt-4"
        loading={isLoading}
      >
        {initialData ? 'Update Matrix' : 'Initialize Rule'}
      </Button>
    </form>
  );
}

export default RecurringForm;
