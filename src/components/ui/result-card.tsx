"use client";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/currency";
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
    default: "bg-white border-gray-200 text-gray-700",
    success: "bg-green-50 border-green-100 text-green-700",
    warning: "bg-yellow-50 border-yellow-100 text-yellow-700",
    error: "bg-red-50 border-red-100 text-red-700",
    primary: "bg-gray-900 border-gray-900 text-white",
    pricing: "bg-white border-gray-200 text-gray-700",
  };

  return (
    <div
      className={cn(
        "rounded-xl p-4 sm:p-6 lg:p-8 text-center shadow-sm border transition-all duration-200 hover:shadow-md w-full min-w-0 flex flex-col items-center justify-center overflow-wrap-anywhere",
        variantStyles[variant],
        className
      )}
      role="region"
      aria-labelledby={`result-${title.replace(/\s+/g, "-").toLowerCase()}`}
    >
      <div className="space-y-3 w-full min-w-0 flex flex-col items-center justify-center">
        <h3
          id={`result-${title.replace(/\s+/g, "-").toLowerCase()}`}
          className="text-sm sm:text-base lg:text-lg font-semibold break-words overflow-wrap-anywhere max-w-full min-w-0 w-full leading-tight"
        >
          {title}
        </h3>
        
        <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-extrabold break-words overflow-wrap-anywhere max-w-full min-w-0 w-full leading-tight">
          {prefix && <span className="text-base sm:text-lg lg:text-xl xl:text-2xl">{prefix}</span>}
          {formatValue(value)}
          {suffix && <span className="text-base sm:text-lg lg:text-xl xl:text-2xl">{suffix}</span>}
        </div>
        
        {subtitle && (
          <p className="text-xs sm:text-sm opacity-75 break-words overflow-wrap-anywhere max-w-full min-w-0 w-full leading-relaxed">{subtitle}</p>
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