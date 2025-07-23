"use client";

import { Button } from '@/components/ui/button';
import { useCurrency } from '@/contexts/currency-context';
import { GitCompare, Plus, X, TrendingUp, TrendingDown } from 'lucide-react';

interface ComparisonScenario {
  id: string;
  name: string;
  inputs: Record<string, any>;
  results: {
    label: string;
    value: number;
    type?: 'currency' | 'percentage' | 'number';
  }[];
  color?: string;
}

interface ScenarioComparisonProps {
  scenarios: ComparisonScenario[];
  onAddScenario: () => void;
  onRemoveScenario: (id: string) => void;
  onUpdateScenario?: (id: string, updates: Partial<ComparisonScenario>) => void;
  title?: string;
  maxScenarios?: number;
}

export function ScenarioComparison({
  scenarios,
  onAddScenario,
  onRemoveScenario,
  title = "Scenario Comparison",
  maxScenarios = 4
}: ScenarioComparisonProps) {
  const { formatCurrency, formatNumber } = useCurrency();

  if (scenarios.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <GitCompare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">
          Compare different scenarios to make better financial decisions
        </p>
        <Button onClick={onAddScenario} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add First Scenario
        </Button>
      </div>
    );
  }

  // Get all unique result labels for comparison
  const allMetrics = Array.from(
    new Set(scenarios.flatMap(s => s.results.map(r => r.label)))
  );

  const formatValue = (value: number, type?: string) => {
    switch (type) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return `${formatNumber(value)}%`;
      default:
        return formatNumber(value);
    }
  };

  const getScenarioColor = (index: number) => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
    return colors[index % colors.length];
  };

  const getComparisonIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (current < previous) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <GitCompare className="w-5 h-5 mr-2" />
          {title}
        </h3>
        {scenarios.length < maxScenarios && (
          <Button onClick={onAddScenario} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-1" />
            Add Scenario
          </Button>
        )}
      </div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {scenarios.map((scenario, index) => (
          <div
            key={scenario.id}
            className="border border-gray-200 rounded-lg p-4 relative"
            style={{ borderTopColor: getScenarioColor(index), borderTopWidth: '3px' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 truncate">{scenario.name}</h4>
              <button
                onClick={() => onRemoveScenario(scenario.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              {scenario.results.slice(0, 3).map((result, resultIndex) => (
                <div key={resultIndex} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate">{result.label}:</span>
                  <span className="font-medium text-gray-900">
                    {formatValue(result.value, result.type)}
                  </span>
                </div>
              ))}
              {scenario.results.length > 3 && (
                <div className="text-xs text-gray-500 text-center">
                  +{scenario.results.length - 3} more metrics
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Comparison Table */}
      {scenarios.length > 1 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-700">Metric</th>
                {scenarios.map((scenario, index) => (
                  <th
                    key={scenario.id}
                    className="text-right py-3 px-2 font-medium text-gray-700"
                  >
                    <div className="flex items-center justify-end">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: getScenarioColor(index) }}
                      />
                      {scenario.name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allMetrics.map((metric) => {
                const metricData = scenarios.map(scenario => 
                  scenario.results.find(r => r.label === metric)
                );
                
                // Skip if not all scenarios have this metric
                if (metricData.some(data => !data)) return null;

                return (
                  <tr key={metric} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium text-gray-900">{metric}</td>
                    {metricData.map((data, index) => {
                      const prevData = index > 0 ? metricData[index - 1] : null;
                      return (
                        <td key={index} className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end">
                            {formatValue(data!.value, data!.type)}
                            {prevData && getComparisonIcon(data!.value, prevData.value)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Best/Worst Analysis */}
      {scenarios.length > 1 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {allMetrics.slice(0, 2).map((metric) => {
            const metricData = scenarios
              .map((scenario, index) => ({
                scenario,
                index,
                data: scenario.results.find(r => r.label === metric)
              }))
              .filter(item => item.data);

            if (metricData.length === 0) return null;

            const sortedData = [...metricData].sort((a, b) => b.data!.value - a.data!.value);
            const best = sortedData[0];
            const worst = sortedData[sortedData.length - 1];

            return (
              <div key={metric} className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3">{metric}</h5>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Best: {best?.scenario.name}
                    </span>
                    <span className="text-sm font-medium">
                      {formatValue(best?.data?.value ?? 0, best?.data?.type)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-600 flex items-center">
                      <TrendingDown className="w-4 h-4 mr-1" />
                      Lowest: {worst?.scenario.name}
                    </span>
                    <span className="text-sm font-medium">
                      {formatValue(worst?.data?.value ?? 0, worst?.data?.type)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}