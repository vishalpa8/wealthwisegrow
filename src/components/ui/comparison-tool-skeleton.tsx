import React from "react";

export function ComparisonToolSkeleton() {
  return (
    <section className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mt-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">Compare Financial Products</h2>
      <p className="text-gray-600 mb-6 text-sm">Preview: Quickly compare loans, investments, or other products side by side. More features coming soon!</p>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border border-gray-200 rounded-xl">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 font-semibold">Product</th>
              <th className="px-4 py-2 font-semibold">Rate</th>
              <th className="px-4 py-2 font-semibold">Term</th>
              <th className="px-4 py-2 font-semibold">Monthly Payment</th>
              <th className="px-4 py-2 font-semibold">Total Cost</th>
              <th className="px-4 py-2 font-semibold">Compare</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((row) => (
              <tr key={row} className="border-t border-gray-100">
                <td className="px-4 py-2">Product {row}</td>
                <td className="px-4 py-2">{row === 1 ? "6.5%" : row === 2 ? "7.2%" : "5.9%"}</td>
                <td className="px-4 py-2">{row === 1 ? "30 yrs" : row === 2 ? "15 yrs" : "20 yrs"}</td>
                <td className="px-4 py-2">${row === 1 ? "1,200" : row === 2 ? "1,800" : "1,400"}</td>
                <td className="px-4 py-2">${row === 1 ? "432,000" : row === 2 ? "324,000" : "336,000"}</td>
                <td className="px-4 py-2">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs">Compare</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
} 