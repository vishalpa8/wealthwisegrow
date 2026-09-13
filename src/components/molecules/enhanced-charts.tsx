"use client";

import React from 'react';
import { useCurrency } from '@/contexts/currency-context';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, Legend
} from 'recharts';

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

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
  '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
];

export function SimpleLineChart({ 
  data, 
  title, 
  height = 250,
  formatValue 
}: LineChartProps) {
  const { formatCurrency, formatNumber } = useCurrency();
  
  if (!data || data.length === 0) return null;

  const defaultFormatter = formatValue || ((value: number) => 
    typeof value === 'number' && value > 1000 ? formatCurrency(value) : formatNumber(value)
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} />
            <YAxis tickFormatter={(value: any) => defaultFormatter(value as number)} tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} axisLine={false} width={80} />
            <Tooltip 
              formatter={(value: any) => [defaultFormatter(value as number), 'Value']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function SimplePieChart({ 
  data, 
  title, 
  size = 250, 
  showPercentages = true 
}: PieChartProps) {
  const { formatCurrency } = useCurrency();
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 w-full flex flex-col items-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 w-full text-left">{title}</h3>
      <div style={{ width: '100%', height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={size / 4}
              outerRadius={size / 2 - 20}
              paddingAngle={5}
              dataKey="value"
              nameKey="label"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any, name: any) => {
                const percentage = (((value as number) / total) * 100).toFixed(1);
                return [`${formatCurrency(value as number)} (${percentage}%)`, String(name)];
              }}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function SimpleBarChart({ 
  data, 
  title, 
  height = 300, 
  formatValue 
}: BarChartProps) {
  const { formatCurrency, formatNumber } = useCurrency();
  
  if (!data || data.length === 0) return null;

  const defaultFormatter = formatValue || ((value: number) => 
    typeof value === 'number' && value > 1000 ? formatCurrency(value) : formatNumber(value)
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
            <XAxis type="number" tickFormatter={(value: any) => defaultFormatter(value as number)} tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis type="category" dataKey="label" tick={{ fill: '#4b5563', fontSize: 13 }} width={100} />
            <Tooltip 
              formatter={(value: any) => [defaultFormatter(value as number), '']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              cursor={{ fill: '#f3f4f6' }}
            />
            <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

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

export { GoalProgressChart } from './goal-progress-chart';

export function InvestmentGrowthChart({ 
  yearlyData, 
  title = "Investment Growth Over Time" 
}: {
  yearlyData: { year: number; principal: number; interest: number; total: number }[];
  title?: string;
}) {
  const { formatCurrency } = useCurrency();
  
  if (!yearlyData || yearlyData.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={yearlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} />
            <YAxis tickFormatter={(value: any) => formatCurrency(value as number)} tick={{ fill: '#6b7280', fontSize: 12 }} width={80} tickLine={false} axisLine={false} />
            <Tooltip 
              formatter={(value: any) => formatCurrency(value as number)}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              cursor={{ fill: '#f3f4f6' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
            <Bar dataKey="principal" name="Principal" stackId="a" fill="#3b82f6" />
            <Bar dataKey="interest" name="Interest/Growth" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}