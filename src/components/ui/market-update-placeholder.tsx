import React from "react";

export function MarketUpdatePlaceholder() {
  return (
    <section className="bg-blue-50 rounded-2xl shadow-lg p-6 border border-blue-100 mt-8 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-blue-700 mb-2">Market Updates</h2>
      <ul className="mb-3 text-blue-900 text-sm">
        <li>30-Year Fixed Mortgage: <span className="font-semibold">6.75%</span></li>
        <li>15-Year Fixed Mortgage: <span className="font-semibold">6.10%</span></li>
        <li>Personal Loan: <span className="font-semibold">10.5%</span></li>
        <li>CD Rates: <span className="font-semibold">5.25%</span></li>
      </ul>
      <p className="text-xs text-blue-600">Real-time updates coming soon!</p>
    </section>
  );
} 