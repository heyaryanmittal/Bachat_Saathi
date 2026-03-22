import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { expenseCategories, incomeCategories } from '../config/categories';
import { Button, Input, UISelect } from './ui';
import { Wallet, Tag, Calendar, PenTool, Hash } from 'lucide-react';
import { numberToWords } from '../utils/numberToWords';
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
        walletId: data.walletId,
        notes: data.description || '',
        date: data.date,
        category: data.category
      };
      await onSubmit(payload);
      if (typeof refreshWallets === 'function') await refreshWallets();
      if (!initialData) reset();
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="tx-protocol-type" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2 mb-2 block">Protocol Type</label>
          <div className="flex bg-muted/50 p-1 rounded-xl">
             <button
               type="button"
               onClick={() => reset({ ...watch(), type: 'Expense' })}
               className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all ${transactionType === 'Expense' ? 'bg-rose-500 text-white shadow-lg' : 'text-muted-foreground'}`}
             > Outbound </button>
             <button
               type="button"
               onClick={() => reset({ ...watch(), type: 'Income' })}
               className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all ${transactionType === 'Income' ? 'bg-emerald-500 text-white shadow-lg' : 'text-muted-foreground'}`}
             > Inbound </button>
             <input type="hidden" id="tx-protocol-type" {...register('type')} />
          </div>
        </div>
        <div className="space-y-1">
          <Input
            label="Transmission Value (₹)"
            id="tx-amount"
            name="amount"
            type="number"
            placeholder="0.00"
            {...register('amount', { required: "Value required", min: 0.01 })}
            error={errors.amount?.message}
          />
          {watch('amount') > 0 && (
            <p className="text-[10px] font-black text-primary uppercase tracking-widest ml-4 transition-all animate-in fade-in slide-in-from-top-1">
              {numberToWords(Number(watch('amount')))}
            </p>
          )}
        </div>
        <UISelect
          label="Source Node"
          id="tx-wallet"
          {...register('walletId', { required: "Select node" })}
          options={wallets.map(w => ({ value: w._id, label: `${w.name} (₹${w.currentBalance})` }))}
          error={errors.walletId?.message}
        />
        <UISelect
          label="Classification"
          id="tx-category"
          {...register('category', { required: "Select category" })}
          options={(transactionType === 'Income' ? incomeCategories : expenseCategories).map(c => ({ value: c.name, label: `${c.icon} ${c.name}` }))}
          error={errors.category?.message}
        />
        <Input
          label="Temporal Stamp"
          id="tx-date"
          type="date"
          {...register('date', { required: "Date binary required" })}
          error={errors.date?.message}
        />
        <Input
          label="Meta Description"
          id="tx-notes"
          placeholder="Sync notes..."
          {...register('description')}
        />
      </div>
      <Button
        type="submit"
        size="xl"
        className="w-full btn-saas-primary mt-4"
        loading={isLoading}
      >
        {initialData ? 'Sync Changes' : 'Execute Transaction'}
      </Button>
    </form>
  );
};
export default TransactionForm;
