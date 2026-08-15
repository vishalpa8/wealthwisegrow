"use client";

import React from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}

export function Tabs({ 
  tabs, 
  activeTab, 
  onTabChange, 
  className = '',
  variant = 'default'
}: TabsProps) {
  const getTabClasses = (tab: Tab) => {
    const baseClasses = "px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";
    
    if (variant === 'pills') {
      return `${baseClasses} rounded-lg ${
        activeTab === tab.id
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;
    }
    
    if (variant === 'underline') {
      return `${baseClasses} border-b-2 ${
        activeTab === tab.id
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
      } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;
    }
    
    // Default variant
    return `${baseClasses} border border-gray-200 ${
      activeTab === tab.id
        ? 'bg-blue-50 text-blue-700 border-blue-200'
        : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;
  };

  const getContainerClasses = () => {
    if (variant === 'pills') {
      return "flex flex-wrap gap-2";
    }
    
    if (variant === 'underline') {
      return "flex border-b border-gray-200";
    }
    
    // Default variant
    return "flex flex-wrap gap-1 p-1 bg-gray-100 rounded-lg";
  };

  return (
    <div className={`${className}`}>
      <div className={getContainerClasses()}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            className={getTabClasses(tab)}
            disabled={tab.disabled}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
          >
            <div className="flex items-center space-x-2">
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Tab Panel component for content
interface TabPanelProps {
  id: string;
  activeTab: string;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ id, activeTab, children, className = '' }: TabPanelProps) {
  if (activeTab !== id) return null;
  
  return (
    <div
      id={`tabpanel-${id}`}
      role="tabpanel"
      aria-labelledby={`tab-${id}`}
      className={`focus:outline-none ${className}`}
    >
      {children}
    </div>
  );
}

// Compound component for easier usage
Tabs.Panel = TabPanel;