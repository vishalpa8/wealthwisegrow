import React from "react";

interface AdsPlaceholderProps {
  position: "header" | "sidebar" | "in-content" | "below-results" | "sticky";
  size: string;
  className?: string;
}

export function AdsPlaceholder({ position, size, className }: AdsPlaceholderProps) {
  return (
    <div
      className={`flex items-center justify-center border-2 border-dashed border-yellow-400 bg-yellow-50 text-yellow-700 rounded-lg my-4 py-4 ${className || ""}`}
      style={{ minHeight: 60 }}
      aria-label={`Ad Placeholder: ${position}`}
    >
      <span className="text-xs font-semibold">
        [Ad Placeholder: {position} | {size}]
      </span>
    </div>
  );
} 