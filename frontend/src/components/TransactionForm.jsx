import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { expenseCategories, incomeCategories } from '../config/categories';
import { Button, Input } from './ui';
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
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2 mb-2 block">Protocol Type</label>
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
             <input type="hidden" {...register('type')} />
          </div>
        </div>
        <div className="space-y-1">
          <Input
            label="Transmission Value (₹)"
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
        <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Source Node</label>
            <div className="relative group">
                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <select 
                    {...register('walletId', { required: "Select node" })}
                    className="input-saas w-full pl-12"
                >
                    <option value="">Select Target...</option>
                    {wallets.map(w => <option key={w._id} value={w._id}>{w.name} (₹{w.currentBalance})</option>)}
                </select>
            </div>
            {errors.walletId && <p className="text-[10px] text-rose-500 font-bold ml-2 uppercase">{errors.walletId.message}</p>}
        </div>
        <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Classification</label>
            <div className="relative group">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <select 
                    {...register('category', { required: "Select category" })}
                    className="input-saas w-full pl-12"
                >
                    <option value="">Select Category...</option>
                    {(transactionType === 'Income' ? incomeCategories : expenseCategories).map(c => (
                        <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                    ))}
                </select>
            </div>
            {errors.category && <p className="text-[10px] text-rose-500 font-bold ml-2 uppercase">{errors.category.message}</p>}
        </div>
        <Input
          label="Temporal Stamp"
          type="date"
          {...register('date', { required: "Date binary required" })}
          error={errors.date?.message}
        />
        <Input
          label="Meta Description"
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
