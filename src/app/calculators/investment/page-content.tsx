"use client";
import { SEOContent } from "@/components/molecules/seo-content";

import { useMemo } from "react";
import { parseRobustNumber, safeMultiply, safeAdd, safePower, safeDivide, safeSubtract } from "@/lib/utils/number";
import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { GoalProgressChart } from "@/components/molecules/goal-progress-chart";

interface InvestmentInputs {
  initialInvestment: number;
  monthlyContribution: number;
  annualReturnRate: number;
  years: number;
  goal: number;
}

const initialValues: InvestmentInputs = {
  initialInvestment: 10000,
  monthlyContribution: 500,
  annualReturnRate: 7,
  years: 20,
  goal: 0,
};

export function InvestmentCalculatorPageContent() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = useMemo(() => [
    { label: "Initial Investment", name: "initialInvestment", type: "number", placeholder: "10,000", unit: currency.symbol },
    { label: "Monthly Contribution", name: "monthlyContribution", type: "number", placeholder: "500", unit: currency.symbol },
    { label: "Annual Return Rate", name: "annualReturnRate", type: "percentage", placeholder: "7", step: 0.1 },
    { label: "Investment Period", name: "years", type: "number", placeholder: "20", unit: "years" },
    { label: "Investment Goal", name: "goal", type: "number", placeholder: "1,000,000", unit: currency.symbol },
  ], [currency.symbol]);

  const calculate = (inputs: InvestmentInputs) => {
    const initial = Math.abs(parseRobustNumber(inputs.initialInvestment) || 0);
    const monthly = Math.abs(parseRobustNumber(inputs.monthlyContribution) || 0);
    const rate = Math.abs(parseRobustNumber(inputs.annualReturnRate) || 0);
    const years = Math.max(parseRobustNumber(inputs.years) || 1, 1);

    const n = years * 12;
    const r = safeDivide(safeDivide(rate, 12), 100);

    const fvInitial = safeMultiply(initial, safePower(safeAdd(1, r), n));

    let fvMonthly = 0;
    if (!isFinite(r) || r === 0) {
      fvMonthly = safeMultiply(monthly, n);
    } else {
      fvMonthly = safeMultiply(monthly, safeDivide(safeSubtract(safePower(safeAdd(1, r), n), 1), r));
    }

    const totalFutureValue = safeAdd(fvInitial, fvMonthly);
    const totalContributions = safeAdd(initial, safeMultiply(monthly, n));
    const totalInterestEarned = safeSubtract(totalFutureValue, totalContributions);

    const annualizedReturn = totalContributions > 0
      ? (Math.pow(totalFutureValue / totalContributions, 1 / years) - 1) * 100
      : 0;

    const results: CalculatorResult[] = [
      { label: "Final Amount", value: totalFutureValue, type: "currency", highlight: true },
      { label: "Total Contributions", value: totalContributions, type: "currency" },
      { label: "Total Growth", value: totalInterestEarned, type: "currency" },
      { label: "Annualized Return", value: annualizedReturn, type: "percentage" },
    ];

    const chartData = { goal: inputs.goal, current: totalFutureValue };

    return { results, chartData };
  };

  const charts = [
    {
      id: "goal-progress",
      render: (results: any, chartData: any) => chartData.goal > 0 ? (
        <div className="mt-6 card p-6">
          <GoalProgressChart
            currentValue={chartData.current}
            goalValue={chartData.goal}
            label="Investment Growth Progress"
            unit={currency.symbol}
          />
        </div>
      ) : null
    }
  ];

  const seoContent = (
      <SEOContent title="Wealth Creation & Compounding"
      description={<>Investing is the key to building long-term wealth and achieving financial independence. By putting your money to work in assets like stocks, mutual funds, or fixed deposits, you leverage the <strong>power of compounding</strong> to grow your savings exponentially over time.</>}
      sections={[
        { title: "The Power of Compounding", content: "Albert Einstein famously called compounding the 'eighth wonder of the world.' It refers to the process where the returns on your investment start earning their own returns. The longer your money stays invested, the more dramatic the growth becomes." },
        { title: "Consistency Over Quantity", content: "Investing a small amount regularly (SIP) is often more effective than waiting for a large 'perfect' moment to invest a lumpsum. Disciplined investing helps you navigate market volatility through rupee cost averaging." },
        { title: "Risk vs. Reward", content: "Every investment carries some risk. Generally, higher potential returns (like in Equity) come with higher volatility. A balanced portfolio that matches your risk appetite and time horizon is essential for stress-free investing." },
        { title: "Beating Inflation", content: "The primary goal of investing is to ensure your money grows faster than the rate of inflation. Traditional savings accounts often fail this test, which is why exposure to growth assets like mutual funds is vital." }
      ]}
      faqs={[
        { question: "What is a Systematic Investment Plan (SIP)?", answer: "An SIP allows you to invest a fixed amount in a mutual fund scheme at regular intervals (monthly or quarterly). It helps in disciplined saving and reduces the risk of market timing." },
        { question: "How much should I invest every month?", answer: "A common rule of thumb is the 50/30/20 rule, where 20% of your take-home income goes toward investments and debt repayment. However, your specific goal and timeline should dictate the amount." },
        { question: "What is the difference between Equity and Debt?", answer: "Equity represents ownership in companies and offers higher growth potential with higher risk. Debt involves lending money (to government or corporates) for fixed interest, offering lower growth but higher safety." }
      ]}
      relatedTools={[
        { name: "SIP Calculator", href: "/calculators/sip" },
        { name: "Mutual Fund Calculator", href: "/calculators/mutual-fund" },
        { name: "Compound Interest Calculator", href: "/calculators/compound-interest" }
      ]}
    />
  );

  return (
    <BaseCalculatorTemplate<InvestmentInputs>
      title="Future Value Investment Growth Calculator"
      description="Estimate the future value of your investments. Plan your financial goals."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
      charts={charts}
      seoContent={seoContent}
    />
  );
}
