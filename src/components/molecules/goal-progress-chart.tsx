interface GoalProgressChartProps {
  currentValue: number;
  goalValue: number;
  label: string;
  unit?: string;
}

export function GoalProgressChart({ currentValue, goalValue, label, unit = "" }: GoalProgressChartProps) {
  // Handle edge cases
  if (!goalValue || goalValue <= 0) {
    return (
      <div className="bg-white rounded-xl shadow p-4 border border-gray-100 flex flex-col items-center">
        <div className="w-full mb-2 flex justify-between text-sm text-gray-600">
          <span>{label}</span>
          <span>Please set a goal to track progress</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4 mb-2">
          <div className="bg-gray-400 h-4 rounded-full w-0" />
        </div>
        <div className="text-xs text-gray-500">No goal set</div>
      </div>
    );
  }

  const percent = Math.min(100, Math.max(0, (currentValue / goalValue) * 100));
  const isGoalReached = currentValue >= goalValue;
  
  return (
    <div className="bg-white rounded-xl shadow p-4 border border-gray-100 flex flex-col items-center">
      <div className="w-full mb-2 flex justify-between text-sm text-gray-600">
        <span>{label}</span>
        <span>
          {currentValue.toLocaleString()} {unit} / {goalValue.toLocaleString()} {unit}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-4 mb-2">
        <div
          className={`h-4 rounded-full transition-all duration-500 ${
            isGoalReached ? 'bg-green-600' : 'bg-blue-600'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className={`text-xs ${isGoalReached ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
        {isGoalReached ? '🎉 Goal achieved!' : `${percent.toFixed(1)}% of goal reached`}
      </div>
    </div>
  );
}