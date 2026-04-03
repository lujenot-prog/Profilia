import type { AnalysisResult } from "./analysis";

const KEY = "profilia:last-analysis";

export type StoredAnalysisResult = AnalysisResult & {
  id?: string;
};

export function saveAnalysis(result: StoredAnalysisResult) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(result));
}

export function readAnalysis(): StoredAnalysisResult | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredAnalysisResult;
  } catch {
    return null;
  }
}