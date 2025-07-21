export interface HistoryEntry {
  type: string;
  timestamp: string;
  input: Record<string, string>;
  output: Record<string, string>;
}
