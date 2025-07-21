"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";
import type { CalculatorLayoutProps } from "@/types/calculator";

export function CalculatorLayout({
  title,
  description,
  children,
  sidebar,
  className,
}: CalculatorLayoutProps) {
  return (
    <div className={cn("max-w-6xl mx-auto p-4", className)}>
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 text-blue-700">{title}</h1>
        {description && (
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
        )}
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calculator Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
            {children}
          </div>
        </div>

        {/* Sidebar */}
        {sidebar && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-24">
              {sidebar}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}