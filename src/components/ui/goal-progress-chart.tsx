import React from "react";

interface GoalProgressChartProps {
  currentValue: number;
  goalValue: number;
  label: string;
  unit?: string;
}

export function GoalProgressChart({ currentValue, goalValue, label, unit }: GoalProgressChartProps) {
  const percent = Math.min(100, (currentValue / goalValue) * 100);
  return (
    <div className="bg-white rounded-xl shadow p-4 border border-gray-100 flex flex-col items-center">
      <div className="w-full mb-2 flex justify-between text-sm text-gray-600">
        <span>{label}</span>
        <span>{currentValue.toLocaleString()} {unit} / {goalValue.toLocaleString()} {unit}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-4 mb-2">
        <div
          className="bg-blue-600 h-4 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="text-xs text-gray-500">{percent.toFixed(1)}% of goal reached</div>
    </div>
  );
} 