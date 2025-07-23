"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import { Button } from '@/components/ui/button';
import { Target, Plus, Trash2, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { parseRobustNumber } from '@/lib/utils/number';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  timeHorizon: number;
  priority: 'high' | 'medium' | 'low';
  currentSavings: number;
  monthlyContribution: number;
  expectedReturn: number;
}

interface GoalCalculationResult {
  requiredMonthlyInvestment: number;
  projectedAmount: number;
  shortfall: number;
  surplus: number;
  feasibilityScore: number;
  inflationAdjustedTarget: number;
}

const initialGoal: Goal = {
  id: '1',
  name: 'Emergency Fund',
  targetAmount: 600000,
  timeHorizon: 2,
  priority: 'high',
  currentSavings: 50000,
  monthlyContribution: 15000,
  expectedReturn: 6
};

function calculateGoal(goal: Goal, inflationRate: number = 6): GoalCalculationResult {
  // Use parseRobustNumber for flexible input handling
  const targetAmount = Math.abs(parseRobustNumber(goal.targetAmount)) || 100000;
  const timeHorizon = Math.max(0.5, Math.abs(parseRobustNumber(goal.timeHorizon)) || 1);
  const currentSavings = Math.abs(parseRobustNumber(goal.currentSavings)) || 0;
  const monthlyContribution = Math.abs(parseRobustNumber(goal.monthlyContribution)) || 0;
  const expectedReturn = Math.abs(parseRobustNumber(goal.expectedReturn)) || 6;
  const adjustedInflationRate = Math.max(0, Math.abs(parseRobustNumber(inflationRate)) || 6);

  const months = timeHorizon * 12;
  const monthlyReturn = expectedReturn / 100 / 12;
  
  // Inflation-adjusted target
  const inflationAdjustedTarget = targetAmount * Math.pow(1 + adjustedInflationRate / 100, timeHorizon);
  
  // Future value of current savings
  const futureValueCurrentSavings = currentSavings * Math.pow(1 + monthlyReturn, months);
  
  // Future value of monthly contributions
  let futureValueContributions = 0;
  if (monthlyReturn > 0) {
    futureValueContributions = monthlyContribution * 
      ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn);
  } else {
    futureValueContributions = monthlyContribution * months;
  }
  
  const projectedAmount = futureValueCurrentSavings + futureValueContributions;
  
  // Calculate required monthly investment to reach inflation-adjusted target
  const remainingAmount = inflationAdjustedTarget - futureValueCurrentSavings;
  let requiredMonthlyInvestment = 0;
  
  if (remainingAmount > 0 && monthlyReturn > 0) {
    requiredMonthlyInvestment = remainingAmount * monthlyReturn / 
      (Math.pow(1 + monthlyReturn, months) - 1);
  } else if (remainingAmount > 0) {
    requiredMonthlyInvestment = remainingAmount / months;
  }
  
  const shortfall = Math.max(0, inflationAdjustedTarget - projectedAmount);
  const surplus = Math.max(0, projectedAmount - inflationAdjustedTarget);
  
  // Feasibility score (0-100)
  const feasibilityScore = inflationAdjustedTarget > 0 ? Math.min(100, (projectedAmount / inflationAdjustedTarget) * 100) : 100;
  
  return {
    requiredMonthlyInvestment: Math.max(0, requiredMonthlyInvestment),
    projectedAmount,
    shortfall,
    surplus,
    feasibilityScore,
    inflationAdjustedTarget
  };
}

export default function GoalPlanningCalculatorPage() {
  const [goals, setGoals] = useState<Goal[]>([initialGoal]);
  const [selectedGoalId, setSelectedGoalId] = useState<string | undefined>(initialGoal.id);
  const [inflationRate, setInflationRate] = useState(6);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency, formatCurrency, formatNumber } = useCurrency();

  const selectedGoal = useMemo(() => {
    if (selectedGoalId) {
      return goals.find(g => g.id === selectedGoalId);
    } else if (goals.length > 0) {
      return goals[0];
    }
    return undefined;
  }, [goals, selectedGoalId]);

  const goalResults = useMemo(() => {
    setCalculationError(undefined);
    if (!selectedGoal) return null;
    try {
      return calculateGoal(selectedGoal, inflationRate);
    } catch (err: any) {
      console.error('Goal calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please check your inputs.');
      return null;
    }
  }, [selectedGoal, inflationRate]);

  const allGoalsResults = useMemo(() => {
    return goals.map(goal => ({
      goal,
      result: calculateGoal(goal, inflationRate)
    }));
  }, [goals, inflationRate]);

  const addNewGoal = () => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      name: `Goal ${goals.length + 1}`,
      targetAmount: 500000,
      timeHorizon: 5,
      priority: 'medium',
      currentSavings: 0,
      monthlyContribution: 5000,
      expectedReturn: 8
    };
    setGoals(prev => [...prev, newGoal]);
    setSelectedGoalId(newGoal.id);
  };

  const removeGoal = (goalId: string) => {
    setGoals(prev => {
      const updatedGoals = prev.filter(g => g.id !== goalId);
      if (selectedGoalId === goalId) {
        setSelectedGoalId(updatedGoals.length > 0 ? updatedGoals[0]?.id : undefined);
      }
      return updatedGoals;
    });
  };

  const updateGoal = (field: keyof Goal, value: any) => {
    setGoals(prev => prev.map(goal => 
      goal.id === selectedGoalId 
        ? { ...goal, [field]: value }
        : goal
    ));
  };

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Goal Name',
      name: 'name',
      type: 'select',
      options: goals.map(goal => ({ value: goal.id, label: goal.name })),
      tooltip: 'Select or create a financial goal'
    },
    {
      label: 'Target Amount',
      name: 'targetAmount',
      type: 'number',
      placeholder: '6,00,000',
      unit: currency.symbol,
      tooltip: 'Amount you want to achieve for this goal'
    },
    {
      label: 'Time Horizon',
      name: 'timeHorizon',
      type: 'number',
      placeholder: '2',
      step: 0.5,
      unit: 'years',
      tooltip: 'Time available to achieve this goal'
    },
    {
      label: 'Priority',
      name: 'priority',
      type: 'select',
      options: [
        { value: 'high', label: 'High Priority' },
        { value: 'medium', label: 'Medium Priority' },
        { value: 'low', label: 'Low Priority' }
      ],
      tooltip: 'Priority level of this goal'
    },
    {
      label: 'Current Savings',
      name: 'currentSavings',
      type: 'number',
      placeholder: '50,000',
      unit: currency.symbol,
      tooltip: 'Amount already saved for this goal'
    },
    {
      label: 'Monthly Contribution',
      name: 'monthlyContribution',
      type: 'number',
      placeholder: '15,000',
      unit: currency.symbol,
      tooltip: 'Amount you can invest monthly towards this goal'
    },
    {
      label: 'Expected Annual Return',
      name: 'expectedReturn',
      type: 'percentage',
      placeholder: '6',
      step: 0.5,
      tooltip: 'Expected annual return on your investments'
    }
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!goalResults || !selectedGoal) return [];

    return [
      {
        label: 'Required Monthly Investment',
        value: goalResults.requiredMonthlyInvestment,
        type: 'currency',
        highlight: true,
        tooltip: 'Monthly amount needed to achieve your inflation-adjusted goal'
      } as CalculatorResult,
      {
        label: 'Projected Amount',
        value: goalResults.projectedAmount,
        type: 'currency',
        tooltip: 'Expected amount based on current savings and contributions'
      } as CalculatorResult,
      {
        label: 'Inflation-Adjusted Target',
        value: goalResults.inflationAdjustedTarget,
        type: 'currency',
        tooltip: 'Target amount adjusted for inflation'
      } as CalculatorResult,
      {
        label: 'Feasibility Score',
        value: goalResults.feasibilityScore,
        type: 'percentage',
        tooltip: 'How achievable your goal is with current plan (0-100%)'
      } as CalculatorResult,
      ...(goalResults.shortfall > 0 ? [{
        label: 'Shortfall',
        value: goalResults.shortfall,
        type: 'currency',
        tooltip: 'Amount you may fall short of your goal'
      } as CalculatorResult] : []),
      ...(goalResults.surplus > 0 ? [{
        label: 'Surplus',
        value: goalResults.surplus,
        type: 'currency',
        tooltip: 'Extra amount you may achieve beyond your goal'
      } as CalculatorResult] : [])
    ];
  }, [goalResults, selectedGoal]);

  const handleFieldChange = useCallback((name: string, value: any) => {
    if (name === 'name') {
      setSelectedGoalId(value);
    } else {
      updateGoal(name as keyof Goal, value);
    }
    setCalculationError(undefined);
  }, [selectedGoalId]);

  const handleCalculate = () => {
    setLoading(true);
    setCalculationError(undefined);
    setTimeout(() => setLoading(false), 600);
  };

  const getFieldValue = (name: string) => {
    if (name === 'name') return selectedGoalId;
    return selectedGoal ? selectedGoal[name as keyof Goal] : '';
  };

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <AdsPlaceholder position="sidebar" size="300x250" />
      </div>
      
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Goal Management</h3>
        <div className="space-y-3">
          <Button
            onClick={addNewGoal}
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Goal
          </Button>
          
          {goals.length > 1 && (
            <Button
              onClick={() => selectedGoalId && removeGoal(selectedGoalId)}
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Current Goal
            </Button>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Settings</h3>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Inflation Rate (%)
          </label>
          <input
            type="number"
            value={inflationRate}
            onChange={(e) => setInflationRate(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            step="0.5"
          />
        </div>
      </div>

      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Goal Planning Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Set SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound).</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Prioritize goals based on urgency and importance.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Review and adjust goals regularly.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Consider inflation impact on long-term goals.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Goal Planning Calculator"
      description="Plan and track multiple financial goals with inflation adjustment and feasibility analysis."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Goal Planning Details"
        description="Create and manage your financial goals with detailed planning."
        fields={fields}
        values={Object.fromEntries(fields.map(field => [field.name, getFieldValue(field.name)]))}
        onChange={handleFieldChange}
        onCalculate={handleCalculate}
        results={goalResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />

      {/* All Goals Overview */}
      {allGoalsResults.length > 1 && (
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            All Goals Overview
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3">Goal</th>
                  <th className="text-center py-3 px-3">Priority</th>
                  <th className="text-right py-3 px-3">Target</th>
                  <th className="text-right py-3 px-3">Timeline</th>
                  <th className="text-right py-3 px-3">Required Monthly</th>
                  <th className="text-center py-3 px-3">Feasibility</th>
                </tr>
              </thead>
              <tbody>
                {allGoalsResults.map(({ goal, result }) => (
                  <tr 
                    key={goal.id} 
                    className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      goal.id === selectedGoalId ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedGoalId(goal.id)}
                  >
                    <td className="py-3 px-3 font-medium">{goal.name}</td>
                    <td className="text-center py-3 px-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                        goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {goal.priority}
                      </span>
                    </td>
                    <td className="text-right py-3 px-3">{formatCurrency(goal.targetAmount)}</td>
                    <td className="text-right py-3 px-3">{goal.timeHorizon} years</td>
                    <td className="text-right py-3 px-3">{formatCurrency(result.requiredMonthlyInvestment)}</td>
                    <td className="text-center py-3 px-3">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        result.feasibilityScore >= 80 ? 'bg-green-100 text-green-800' :
                        result.feasibilityScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {formatNumber(result.feasibilityScore)}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            Click on any goal to view detailed calculations
          </div>
        </div>
      )}

      {/* Goal Progress Visualization */}
      {goalResults && selectedGoal && (
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Goal Progress Analysis
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">Current Progress</span>
                <DollarSign className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-lg font-bold text-blue-700">
                {formatCurrency(selectedGoal.currentSavings)}
              </div>
              <div className="text-xs text-blue-600">
                {formatNumber((selectedGoal.currentSavings / goalResults.inflationAdjustedTarget) * 100)}% of target
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-900">Monthly Investment</span>
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-lg font-bold text-green-700">
                {formatCurrency(selectedGoal.monthlyContribution)}
              </div>
              <div className="text-xs text-green-600">
                Current contribution
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-900">Time Remaining</span>
                <Target className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-lg font-bold text-purple-700">
                {selectedGoal.timeHorizon} years
              </div>
              <div className="text-xs text-purple-600">
                {selectedGoal.timeHorizon * 12} months
              </div>
            </div>
          </div>
        </div>
      )}
    </CalculatorLayout>
  );
}