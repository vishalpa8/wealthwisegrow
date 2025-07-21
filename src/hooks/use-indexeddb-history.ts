import { useState, useEffect, useCallback } from "react";
import type { CalculatorResult } from "@/types/calculator";

const DB_KEY = "calculator_history";

function getDB() {
  return window.indexedDB;
}

export function useIndexedDBHistory() {
  const [history, setHistory] = useState<CalculatorResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Open or create the IndexedDB database
  const openDB = useCallback((): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("WealthWiseHistory", 1);
      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains(DB_KEY)) {
          db.createObjectStore(DB_KEY, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, []);

  // Load all history
  const loadHistory = useCallback(async () => {
    setLoading(true);
    const db = await openDB();
    const tx = db.transaction(DB_KEY, "readonly");
    const store = tx.objectStore(DB_KEY);
    const request = store.getAll();
    request.onsuccess = () => {
      setHistory(request.result as CalculatorResult[]);
      setLoading(false);
    };
    request.onerror = () => {
      setHistory([]);
      setLoading(false);
    };
  }, [openDB]);

  // Add a new result
  const addHistory = useCallback(async (result: CalculatorResult) => {
    const db = await openDB();
    const tx = db.transaction(DB_KEY, "readwrite");
    const store = tx.objectStore(DB_KEY);
    store.put(result);
    tx.oncomplete = () => loadHistory();
  }, [openDB, loadHistory]);

  // Clear all history
  const clearHistory = useCallback(async () => {
    const db = await openDB();
    const tx = db.transaction(DB_KEY, "readwrite");
    const store = tx.objectStore(DB_KEY);
    store.clear();
    tx.oncomplete = () => loadHistory();
  }, [openDB, loadHistory]);

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { history, loading, addHistory, clearHistory, reload: loadHistory };
} 