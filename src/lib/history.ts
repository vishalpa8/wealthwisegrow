'use client';

import { HistoryEntry } from '@/types/history';

const HISTORY_STORAGE_KEY = 'wealthwisegrow_calculation_history';
const MAX_HISTORY_ITEMS = 50;

/**
 * Add a calculation to history
 */
export function addHistory(entry: HistoryEntry): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Get existing history
    const historyString = localStorage.getItem(HISTORY_STORAGE_KEY);
    const history: HistoryEntry[] = historyString ? JSON.parse(historyString) : [];
    
    // Add new entry to the beginning of the array
    history.unshift(entry);
    
    // Limit history size
    if (history.length > MAX_HISTORY_ITEMS) {
      history.pop();
    }
    
    // Save back to localStorage
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to add calculation to history:', error);
  }
}

/**
 * Get all calculation history
 */
export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const historyString = localStorage.getItem(HISTORY_STORAGE_KEY);
    return historyString ? JSON.parse(historyString) : [];
  } catch (error) {
    console.error('Failed to retrieve calculation history:', error);
    return [];
  }
}

/**
 * Clear all calculation history
 */
export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear calculation history:', error);
  }
}

/**
 * Get filtered history by calculator type
 */
export function getHistoryByType(type: string): HistoryEntry[] {
  const allHistory = getHistory();
  return allHistory.filter(entry => entry.type === type);
}
