'use client';

import React from 'react';
import { useCurrency, CURRENCIES } from '@/contexts/currency-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CurrencySelectorProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CurrencySelector({ className = '', size = 'md' }: CurrencySelectorProps) {
  const { currency, setCurrency } = useCurrency();

  const sizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base'
  };

  return (
    <Select
      value={currency.code}
      onValueChange={(value) => {
        const selectedCurrency = CURRENCIES.find(c => c.code === value);
        if (selectedCurrency) {
          setCurrency(selectedCurrency);
        }
      }}
    >
      <SelectTrigger className={`w-auto min-w-[120px] ${sizeClasses[size]} ${className}`}>
        <SelectValue>
          <div className="flex items-center gap-2">
            <span className="font-medium">{currency.symbol}</span>
            <span className="text-muted-foreground">{currency.code}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((curr) => (
          <SelectItem key={curr.code} value={curr.code}>
            <div className="flex items-center gap-3">
              <span className="font-medium w-6">{curr.symbol}</span>
              <span className="font-medium">{curr.code}</span>
              <span className="text-muted-foreground text-sm">{curr.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}