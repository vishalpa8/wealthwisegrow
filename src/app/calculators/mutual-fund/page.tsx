"use client";

import { useMemo } from "react";
import { differenceInMonths } from "date-fns";
import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { parseRobustNumber } from "@/lib/utils/number";
import { calculateXirr, DatedCashFlow } from "@/lib/calculations/xirr";

const initialValues = {
  investmentType: 'lumpsum',
  initialInvestment: 100000,
  monthlyInvestment: 10000,
  startDate: '',
  endDate: '',
  purchaseNav: 10,
  currentNav: 12,
  entryLoad: 0,
  exitLoad: 0,
};

export default function MutualFundCalculatorPage() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = useMemo(() => [
    {
      label: 'Investment Type',
      name: 'investmentType',
      type: 'select',
      options: [
        { value: 'lumpsum', label: 'Lumpsum Investment' },
        { value: 'sip', label: 'SIP Investment' }
      ],
    },
    {
      label: 'Investment Start Date',
      name: 'startDate',
      type: 'date',
    },
    {
      label: 'Investment End Date',
      name: 'endDate',
      type: 'date',
    },
    {
      label: 'Investment Amount (Lumpsum)',
      name: 'initialInvestment',
      type: 'number',
      placeholder: '1,00,000',
      unit: currency.symbol,
      showIf: (values: any) => values.investmentType === 'lumpsum',
    },
    {
      label: 'Monthly Investment (SIP)',
      name: 'monthlyInvestment',
      type: 'number',
      placeholder: '10,000',
      unit: currency.symbol,
      showIf: (values: any) => values.investmentType === 'sip',
    },
    {
      label: 'Purchase / Average NAV',
      name: 'purchaseNav',
      type: 'number',
      placeholder: '10.00',
      unit: currency.symbol,
      step: 0.01,
    },
    {
      label: 'Current NAV',
      name: 'currentNav',
      type: 'number',
      placeholder: '12.00',
      unit: currency.symbol,
      step: 0.01,
    },
    {
      label: 'Entry Load (%)',
      name: 'entryLoad',
      type: 'percentage',
      placeholder: '0',
      step: 0.01,
    },
    {
      label: 'Exit Load (%)',
      name: 'exitLoad',
      type: 'percentage',
      placeholder: '0',
      step: 0.01,
    },
  ], [currency.symbol]);

  const calculate = (values: typeof initialValues) => {
    if (!values.startDate || new Date(values.startDate).toString() === 'Invalid Date') {
      return { results: [] };
    }

    const startDateTime = new Date(values.startDate).getTime();
    const endDateTime = values.endDate ? new Date(values.endDate).getTime() : Date.now();
    const durationInYears = (endDateTime - startDateTime) / (365.25 * 24 * 60 * 60 * 1000);

    let totalInvestment = 0;
    let units = 0;
    let currentValue = 0;
    const cashFlows: DatedCashFlow[] = [];

    const initialInvestment = Math.abs(parseRobustNumber(values.initialInvestment)) || 0;
    const monthlyInvestment = Math.abs(parseRobustNumber(values.monthlyInvestment)) || 0;
    const purchaseNav = Math.abs(parseRobustNumber(values.purchaseNav)) || 1;
    const currentNav = Math.abs(parseRobustNumber(values.currentNav)) || 1;
    const entryLoad = Math.abs(parseRobustNumber(values.entryLoad)) || 0;
    const exitLoad = Math.abs(parseRobustNumber(values.exitLoad)) || 0;

    if (values.investmentType === 'lumpsum') {
      const investmentAfterLoad = initialInvestment * (1 - entryLoad / 100);
      units = investmentAfterLoad / purchaseNav;
      currentValue = units * currentNav * (1 - exitLoad / 100);
      totalInvestment = initialInvestment;
      cashFlows.push(
        { date: new Date(startDateTime), amount: -initialInvestment },
        { date: new Date(endDateTime), amount: currentValue },
      );
    } else {
      const startDateObj = new Date(values.startDate);
      const endDateObj = new Date(values.endDate || Date.now());
      
      const totalMonths = Math.max(0, differenceInMonths(endDateObj, startDateObj));
      
      for (let i = 0; i < totalMonths; i++) {
        const monthlyInvestmentAfterLoad = monthlyInvestment * (1 - entryLoad / 100);
        units += monthlyInvestmentAfterLoad / purchaseNav;
        totalInvestment += monthlyInvestment;
        const contributionDate = new Date(startDateObj);
        contributionDate.setMonth(contributionDate.getMonth() + i);
        cashFlows.push({ date: contributionDate, amount: -monthlyInvestment });
      }
      currentValue = units * currentNav * (1 - exitLoad / 100);
      cashFlows.push({ date: endDateObj, amount: currentValue });
    }

    const absoluteReturns = totalInvestment > 0 ? ((currentValue - totalInvestment) / totalInvestment) * 100 : 0;
    const annualizedReturn =
      values.investmentType === 'sip'
        ? calculateXirr(cashFlows)
        : (totalInvestment > 0 && durationInYears > 0)
          ? (Math.pow(currentValue / totalInvestment, 1 / durationInYears) - 1) * 100
          : null;
    const gains = currentValue - totalInvestment;

    const results: CalculatorResult[] = [
      {
        label: 'Current Value',
        value: currentValue,
        type: 'currency',
        highlight: true,
      },
      {
        label: 'Total Investment',
        value: totalInvestment,
        type: 'currency',
      },
      {
        label: 'Total Units',
        value: units,
        type: 'number',
      },
      {
        label: 'Absolute Returns',
        value: absoluteReturns,
        type: 'percentage',
      },
      {
        label: values.investmentType === 'sip' ? 'XIRR' : 'CAGR',
        value: annualizedReturn ?? 0,
        type: 'percentage',
      },
      {
        label: 'Total Gains',
        value: gains,
        type: 'currency',
      }
    ];

    return { results };
  };

  return (
    <BaseCalculatorTemplate<typeof initialValues>
      title="Mutual Fund NAV Return, CAGR & XIRR Calculator"
      description="Estimate returns from supplied NAV values. Lumpsum results use CAGR; dated SIP cash flows use XIRR. This tool does not retrieve historical NAV data or calculate country-specific tax."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
    />
  );
}
