import React from 'react';
import { Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';

export const evaluatePasswordStrength = (pass = '') => {
  if (!pass) {
    return {
      score: 0,
      label: '',
      color: '',
      textClass: '',
      isStrong: false,
      criteria: {
        length: false,
        upperLower: false,
        number: false,
        symbol: false
      }
    };
  }

  const criteria = {
    length: pass.length >= 8,
    upperLower: /[a-z]/.test(pass) && /[A-Z]/.test(pass),
    number: /[0-9]/.test(pass),
    symbol: /[^A-Za-z0-9]/.test(pass)
  };

  // Strong requires ALL 4 criteria to be true
  const isStrong = criteria.length && criteria.upperLower && criteria.number && criteria.symbol;

  let metCount = 0;
  if (criteria.length) metCount++;
  if (criteria.upperLower) metCount++;
  if (criteria.number) metCount++;
  if (criteria.symbol) metCount++;

  if (isStrong) {
    return {
      score: 3,
      label: 'Strong',
      color: 'bg-emerald-500',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      isStrong: true,
      criteria
    };
  } else if (metCount >= 2 || pass.length >= 6) {
    return {
      score: 2,
      label: 'Medium',
      color: 'bg-amber-500',
      textClass: 'text-amber-600 dark:text-amber-400',
      isStrong: false,
      criteria
    };
  } else {
    return {
      score: 1,
      label: 'Weak',
      color: 'bg-rose-500',
      textClass: 'text-rose-600 dark:text-rose-400',
      isStrong: false,
      criteria
    };
  }
};

export default function PasswordStrengthBar({ password = '' }) {
  if (!password) return null;

  const strength = evaluatePasswordStrength(password);

  const criteriaItems = [
    { key: 'length', label: '8+ characters' },
    { key: 'upperLower', label: 'Uppercase & Lowercase (Aa)' },
    { key: 'number', label: 'At least 1 number (0-9)' },
    { key: 'symbol', label: 'Special character (!@#$)' }
  ];

  return (
    <div className="space-y-2 mt-2 p-3 bg-muted/30 border border-border/50 rounded-xl text-xs">
      {/* Indicator Bar & Label Header */}
      <div className="flex items-center justify-between font-bold">
        <span className="text-muted-foreground flex items-center gap-1.5">
          {strength.isStrong ? (
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          )}
          Password Strength:
        </span>
        <span className={`uppercase tracking-wider font-extrabold ${strength.textClass}`}>
          {strength.label}
        </span>
      </div>

      {/* 3 Segmented Bar (Red for Weak, Orange for Medium, Green for Strong) */}
      <div className="grid grid-cols-3 gap-1.5 h-2">
        <div 
          className={`h-full rounded-full transition-all duration-300 ${
            strength.score >= 1 
              ? (strength.score === 3 ? 'bg-emerald-500' : strength.score === 2 ? 'bg-amber-500' : 'bg-rose-500')
              : 'bg-border'
          }`} 
        />
        <div 
          className={`h-full rounded-full transition-all duration-300 ${
            strength.score >= 2 
              ? (strength.score === 3 ? 'bg-emerald-500' : 'bg-amber-500')
              : 'bg-border'
          }`} 
        />
        <div 
          className={`h-full rounded-full transition-all duration-300 ${
            strength.score === 3 ? 'bg-emerald-500' : 'bg-border'
          }`} 
        />
      </div>

      {/* Criteria Checklist */}
      <div className="grid grid-cols-2 gap-1.5 pt-1">
        {criteriaItems.map((item) => {
          const isMet = strength.criteria[item.key];
          return (
            <div key={item.key} className="flex items-center space-x-1.5">
              {isMet ? (
                <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              ) : (
                <X className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
              )}
              <span className={isMet ? 'text-foreground font-semibold' : 'text-muted-foreground/60 font-normal'}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
