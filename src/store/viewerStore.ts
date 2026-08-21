import { create } from 'zustand';
import type { TocItem } from '../viewers/TocItem';

interface ViewerState {
  file: File | null;
  fileType: string | null;
  currentPage: number;
  totalPages: number;
  zoom: number;
  sidebarOpen: boolean;
  toc: TocItem[];
  setFile: (file: File | null, fileType?: string | null) => void;
  setCurrentPage: (page: number) => void;
  setZoom: (zoom: number) => void;
  toggleSidebar: () => void;
  setToc: (toc: TocItem[]) => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  file: null,
  fileType: null,
  currentPage: 0,
  totalPages: 1,
  zoom: 1,
  sidebarOpen: false,
  toc: [],

  setFile: (file, fileType = null) =>
    set({ file, fileType, currentPage: 0, totalPages: 1, toc: [] }),

  setCurrentPage: (page) => set({ currentPage: page }),

  setZoom: (zoom) => set({ zoom }),

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  setToc: (toc) => set({ toc }),
}));
