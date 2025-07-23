'use client';

import React from 'react';
import Link from 'next/link';

interface CalculatorCardProps {
  title: string;
  description: string;
  icon: string;
  link: string;
}

export function CalculatorCard({ title, description, icon, link }: CalculatorCardProps) {
  return (
    <Link
      href={link}
      className="group block bg-white rounded-xl border border-gray-100 p-6 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
    >
      <div className="flex items-center gap-4 mb-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200">
            {icon}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-800">
            {title}
          </h3>
          <p className="text-sm text-gray-600 group-hover:text-gray-700 line-clamp-2 mt-1">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
