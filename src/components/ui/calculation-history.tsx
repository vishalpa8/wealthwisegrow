import React from "react";
import { useIndexedDBHistory } from "@/hooks/use-indexeddb-history";
import { LoadingSpinner } from "./loading-spinner";

export function CalculationHistory() {
  const { history, loading, clearHistory } = useIndexedDBHistory();

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-blue-700">Calculation History</h2>
        <button
          className="text-sm text-red-600 hover:underline"
          onClick={clearHistory}
          disabled={loading || history.length === 0}
        >
          Clear All
        </button>
      </div>
      {loading ? (
        <LoadingSpinner text="Loading history..." />
      ) : history.length === 0 ? (
        <div className="text-gray-500 text-sm">No calculation history yet.</div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {history.slice().reverse().map((item) => (
            <li key={item.id} className="py-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 capitalize">{item.type.replace(/-/g, " ")}</div>
                  <div className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</div>
                </div>
                <div className="text-xs text-gray-700 text-right max-w-xs truncate">
                  Inputs: {Object.entries(item.inputs).map(([k, v]) => `${k}: ${v}`).join(", ")}
                  <br />
                  Results: {Object.entries(item.results).map(([k, v]) => `${k}: ${v}`).join(", ")}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 