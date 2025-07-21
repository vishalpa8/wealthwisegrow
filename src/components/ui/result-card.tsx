"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import type { ResultCardProps } from "@/types/calculator";

export function ResultCard({
  title,
  value,
  subtitle,
  prefix,
  suffix,
  variant = "default",
  className,
  children,
}: ResultCardProps) {
  const formatValue = (val: string | number): string => {
    if (typeof val === "number") {
      if (prefix === "$" || title.toLowerCase().includes("payment") || title.toLowerCase().includes("amount")) {
        return formatCurrency(val);
      }
      return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
    return val;
  };

  const variantStyles = {
    default: "bg-blue-50 border-blue-100 text-blue-700",
    success: "bg-green-50 border-green-100 text-green-700",
    warning: "bg-yellow-50 border-yellow-100 text-yellow-700",
    error: "bg-red-50 border-red-100 text-red-700",
  };

  return (
    <div
      className={cn(
        "rounded-xl p-4 sm:p-6 text-center shadow-sm border transition-all duration-200 hover:shadow-md w-full min-w-0 flex flex-col items-center justify-center",
        variantStyles[variant],
        className
      )}
      role="region"
      aria-labelledby={`result-${title.replace(/\s+/g, "-").toLowerCase()}`}
    >
      <div className="space-y-2 w-full min-w-0 flex flex-col items-center justify-center">
        <h3
          id={`result-${title.replace(/\s+/g, "-").toLowerCase()}`}
          className="text-lg font-semibold break-words max-w-full min-w-0 overflow-hidden w-full"
        >
          {title}
        </h3>
        
        <div className="text-3xl font-extrabold break-words max-w-full min-w-0 overflow-hidden w-full">
          {prefix && <span className="text-2xl">{prefix}</span>}
          {formatValue(value)}
          {suffix && <span className="text-2xl">{suffix}</span>}
        </div>
        
        {subtitle && (
          <p className="text-sm opacity-75 break-words max-w-full min-w-0 overflow-hidden w-full">{subtitle}</p>
        )}
      </div>
      
      {children && (
        <div className="mt-4 pt-4 border-t border-current border-opacity-20 w-full min-w-0">
          {children}
        </div>
      )}
    </div>
  );
}