import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'fastreader:recentFiles';
const MAX_ENTRIES = 20;

export interface RecentFile {
  name: string;
  path: string;
  lastOpened: number;
  type: 'pdf' | 'epub' | 'txt' | 'md';
}

function load(): RecentFile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e): e is RecentFile =>
          typeof e.name === 'string' &&
          typeof e.path === 'string' &&
          typeof e.lastOpened === 'number',
      )
      .sort((a, b) => b.lastOpened - a.lastOpened)
      .slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

function persist(files: RecentFile[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  } catch {
    // private-mode Safari — ignore write errors
  }
}

export function useRecentFiles() {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>(load);

  useEffect(() => {
    persist(recentFiles);
  }, [recentFiles]);

  const addRecentFile = useCallback(
    (entry: Omit<RecentFile, 'lastOpened'>) => {
      setRecentFiles((prev) => {
        const now = Date.now();
        const withoutDup = prev.filter((f) => f.path !== entry.path);
        const updated: RecentFile[] = [
          { ...entry, lastOpened: now },
          ...withoutDup,
        ].slice(0, MAX_ENTRIES);
        return updated;
      });
    },
    [],
  );

  const clearRecent = useCallback(() => {
    setRecentFiles([]);
  }, []);

  return { recentFiles, addRecentFile, clearRecent };
}
