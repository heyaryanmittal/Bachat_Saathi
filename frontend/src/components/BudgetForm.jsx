import React, { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { expenseCategories } from "../config/categories";
import { Button, Input } from "./ui";
import { Tag, Calendar, Bell, DollarSign } from 'lucide-react';

function BudgetForm({ onSubmit, initialData = null }) {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, control } = useForm({
    defaultValues: {
      category: initialData?.category || '',
      amount: initialData?.amount || 0,
      alertThreshold: initialData?.alertThreshold ? initialData.alertThreshold * 100 : 80,
      monthYear: initialData ? `${initialData.year}-${String(initialData.month).padStart(2, '0')}` : ''
    },
  });

  const watchAlertThreshold = useWatch({ control, name: 'alertThreshold', defaultValue: 80 });

  const handleFormSubmit = async (data) => {
    setIsLoading(true);
    try {
      const [year, month] = data.monthYear.split("-").map(Number);
      await onSubmit({
        category: data.category,
        amount: Number(data.amount),
        alertThreshold: Number(data.alertThreshold) / 100,
        month,
        year,
      });
    } catch (e) { /* handled by parent */ }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (!initialData) {
      const today = new Date();
      setValue('monthYear', `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);
    }
  }, [initialData, setValue]);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Scope Classification</label>
            <div className="relative group">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary" />
                <select 
                    {...register("category", { required: "Select node" })}
                    className="input-saas w-full pl-12"
                >
                    <option value="">Select Category...</option>
                    {expenseCategories.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
                </select>
            </div>
            {errors.category && <p className="text-[10px] text-rose-500 font-bold ml-2 uppercase">{errors.category.message}</p>}
        </div>

        <Input
          label="Maximum Outbound (₹)"
          type="number"
          placeholder="0.00"
          {...register("amount", { required: "Limit required", min: 0.01 })}
          error={errors.amount?.message}
        />

        <Input
          label="Strategy Period"
          type="month"
          {...register("monthYear", { required: "Period required" })}
          error={errors.monthYear?.message}
        />

        <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Alert Threshold</label>
                <span className="text-sm font-black text-primary">{watchAlertThreshold}%</span>
            </div>
            <div className="relative pt-1 px-2">
                <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    {...register("alertThreshold")}
                    className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                />
            </div>
            <p className="text-[9px] text-muted-foreground font-medium px-2 italic">Receive telemetry alerts at {watchAlertThreshold}% consumption.</p>
        </div>
      </div>

      <Button
        type="submit"
        size="xl"
        className="w-full btn-saas-primary mt-4"
        loading={isLoading}
      >
        {initialData ? 'Sync Strategy' : 'Initialize Proxy'}
      </Button>
    </form>
  );
}

export default BudgetForm;
