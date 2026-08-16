"use client";

import { useMemo } from "react";
import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { parseRobustNumber } from "@/lib/utils/number";

interface DividendYieldInputs {
  sharePrice: number;
  annualDividend: number;
  numberOfShares: number;
}

const initialValues: DividendYieldInputs = {
  sharePrice: 1000,
  annualDividend: 50,
  numberOfShares: 100
};

export function DividendYieldContent() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = useMemo(() => [
    {
      label: 'Stock Price',
      name: 'stockPrice',
      type: 'number',
      placeholder: '1,000',
      unit: currency.symbol,
      tooltip: 'Current price per share of the stock'
    },
    {
      label: 'Annual Dividend per Share',
      name: 'annualDividend',
      type: 'number',
      placeholder: '50',
      unit: currency.symbol,
      tooltip: 'Dividend paid per share annually'
    },
    {
      label: 'Number of Shares',
      name: 'numberOfShares',
      type: 'number',
      placeholder: '100',
      tooltip: 'Number of shares you own or plan to buy'
    }
  ], [currency.symbol]);

  const calculate = (inputs: DividendYieldInputs) => {
    try {
      const sharePrice = Math.abs(parseRobustNumber(inputs.sharePrice)) || 1;
      const annualDividend = Math.abs(parseRobustNumber(inputs.annualDividend)) || 0;
      const numberOfShares = Math.max(1, Math.abs(parseRobustNumber(inputs.numberOfShares)) || 100);

      const dividendYield = (annualDividend / sharePrice) * 100;
      const totalInvestment = sharePrice * numberOfShares;
      const annualDividendIncome = annualDividend * numberOfShares;
      const quarterlyDividendIncome = annualDividendIncome / 4;
      const monthlyDividendIncome = annualDividendIncome / 12;

      const results: CalculatorResult[] = [
        {
          label: 'Dividend Yield',
          value: dividendYield,
          type: 'percentage',
          highlight: true,
          tooltip: 'Annual dividend yield as percentage of stock price'
        },
        {
          label: 'Total Investment',
          value: totalInvestment,
          type: 'currency',
          tooltip: 'Total amount invested in the stock'
        },
        {
          label: 'Annual Dividend Income',
          value: annualDividendIncome,
          type: 'currency',
          tooltip: 'Total annual dividend income from all shares'
        },
        {
          label: 'Quarterly Dividend Income',
          value: quarterlyDividendIncome,
          type: 'currency',
          tooltip: 'Quarterly dividend income'
        },
        {
          label: 'Monthly Dividend Income',
          value: monthlyDividendIncome,
          type: 'currency',
          tooltip: 'Average monthly dividend income'
        }
      ];
      return { results };
    } catch (e) {
      return { results: [] };
    }
  };

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Dividend Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Focus on companies with consistent dividend history.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">High dividend yield doesn't always mean a good investment.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Reinvest dividends to accelerate wealth accumulation.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <BaseCalculatorTemplate<DividendYieldInputs>
      title="Stock Dividend Yield & Income Calculator"
      description="Calculate dividend yield and income from your stock investments."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
      sidebar={sidebar}
    />
  );
}
