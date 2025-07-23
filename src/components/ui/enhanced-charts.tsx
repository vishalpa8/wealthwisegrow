"use client";

import React from 'react';
import { useCurrency } from '@/contexts/currency-context';

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface LineChartProps {
  data: ChartDataPoint[];
  title: string;
  height?: number;
  showValues?: boolean;
  formatValue?: (value: number) => string;
}

interface PieChartProps {
  data: ChartDataPoint[];
  title: string;
  size?: number;
  showPercentages?: boolean;
}

interface BarChartProps {
  data: ChartDataPoint[];
  title: string;
  height?: number;
  horizontal?: boolean;
  formatValue?: (value: number) => string;
}

interface AmortizationScheduleProps {
  schedule: {
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }[];
  title?: string;
  maxRows?: number;
}

// Simple Line Chart Component
export function SimpleLineChart({ 
  data, 
  title, 
  height = 200, 
  showValues = false,
  formatValue 
}: LineChartProps) {
  const { formatCurrency, formatNumber } = useCurrency();
  
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((point.value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  const defaultFormatter = formatValue || ((value: number) => 
    typeof value === 'number' && value > 1000 ? formatCurrency(value) : formatNumber(value)
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="relative" style={{ height: `${height}px` }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          
          {/* Line */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            points={points}
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((point.value - minValue) / range) * 100;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="#3b82f6"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>
        
        {/* Labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 mt-2">
          {data.map((point, index) => (
            <span key={index} className="text-center">
              {point.label}
            </span>
          ))}
        </div>
      </div>
      
      {showValues && (
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          {data.map((point, index) => (
            <div key={index} className="flex justify-between">
              <span className="text-gray-600">{point.label}:</span>
              <span className="font-medium">{defaultFormatter(point.value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Simple Pie Chart Component
export function SimplePieChart({ 
  data, 
  title, 
  size = 200, 
  showPercentages = true 
}: PieChartProps) {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="flex items-center justify-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            {data.map((item, index) => {
              
              const angle = (item.value / total) * 360;
              const radius = size / 2 - 10;
              const centerX = size / 2;
              const centerY = size / 2;
              
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              currentAngle += angle;
              
              const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
              const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
              const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
              const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={item.color || colors[index % colors.length]}
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        {data.map((item, index) => {
          
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color || colors[index % colors.length] }}
                />
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
              <span className="text-sm font-medium">
                {showPercentages ? `${((item.value / total) * 100).toFixed(1)}%` : item.value.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Simple Bar Chart Component
export function SimpleBarChart({ 
  data, 
  title, 
  height = 200, 
  formatValue 
}: BarChartProps) {
  const { formatCurrency, formatNumber } = useCurrency();
  
  if (!data || data.length === 0) return null;

  const defaultFormatter = formatValue || ((value: number) => 
    typeof value === 'number' && value > 1000 ? formatCurrency(value) : formatNumber(value)
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3" style={{ height: `${height}px`, overflowY: 'auto' }}>
        {data.map((item, index) => {
          return (
            <div key={index} className="flex items-center">
              <div className="w-20 text-sm text-gray-600 mr-3 text-right">
                {item.label}
              </div>
              <div className="flex-1 relative">
                <div className="bg-gray-200 rounded-full h-6">
                  <div
                    className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                  >
                    <span className="text-xs text-white font-medium">
                      {defaultFormatter(item.value)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Amortization Schedule Component
export function AmortizationSchedule({ 
  schedule, 
  title = "Payment Schedule", 
  maxRows = 12 
}: AmortizationScheduleProps) {
  const { formatCurrency } = useCurrency();
  
  if (!schedule || schedule.length === 0) return null;

  const displaySchedule = schedule.slice(0, maxRows);
  const hasMore = schedule.length > maxRows;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-3 font-medium text-gray-700">Month</th>
              <th className="text-right py-2 px-3 font-medium text-gray-700">Payment</th>
              <th className="text-right py-2 px-3 font-medium text-gray-700">Principal</th>
              <th className="text-right py-2 px-3 font-medium text-gray-700">Interest</th>
              <th className="text-right py-2 px-3 font-medium text-gray-700">Balance</th>
            </tr>
          </thead>
          <tbody>
            {displaySchedule.map((row, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-3 text-gray-900">{row.month}</td>
                <td className="py-2 px-3 text-right text-gray-900">{formatCurrency(row.payment)}</td>
                <td className="py-2 px-3 text-right text-green-600">{formatCurrency(row.principal)}</td>
                <td className="py-2 px-3 text-right text-red-600">{formatCurrency(row.interest)}</td>
                <td className="py-2 px-3 text-right text-gray-900 font-medium">{formatCurrency(row.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <div className="mt-3 text-center">
          <span className="text-sm text-gray-500">
            Showing first {maxRows} payments of {schedule.length} total
          </span>
        </div>
      )}
    </div>
  );
}

// Goal Progress Chart (enhanced version)
export { GoalProgressChart } from './goal-progress-chart';

// Investment Growth Chart
export function InvestmentGrowthChart({ 
  yearlyData, 
  title = "Investment Growth Over Time" 
}: {
  yearlyData: { year: number; principal: number; interest: number; total: number }[];
  title?: string;
}) {
  const { formatCurrency } = useCurrency();
  
  if (!yearlyData || yearlyData.length === 0) return null;

  const maxValue = Math.max(...yearlyData.map(d => d.total));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-2">
        {yearlyData.map((data, index) => {
          const totalPercentage = (data.total / maxValue) * 100;
          const principalPercentage = (data.principal / maxValue) * 100;
          
          return (
            <div key={index} className="flex items-center">
              <div className="w-16 text-sm text-gray-600 mr-3 text-right">
                Year {data.year}
              </div>
              <div className="flex-1 relative">
                <div className="bg-gray-200 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="bg-blue-600 h-6 rounded-full absolute left-0 top-0"
                    style={{ width: `${principalPercentage}%` }}
                  />
                  <div
                    className="bg-green-500 h-6 rounded-full absolute left-0 top-0"
                    style={{ 
                      width: `${totalPercentage}%`,
                      marginLeft: `${principalPercentage}%`
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-end pr-2">
                    <span className="text-xs text-white font-medium">
                      {formatCurrency(data.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-600 rounded-full mr-2" />
          <span className="text-gray-600">Principal</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
          <span className="text-gray-600">Interest/Growth</span>
        </div>
      </div>
    </div>
  );
}