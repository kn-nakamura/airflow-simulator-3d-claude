import { create } from 'zustand';

interface UIState {
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  activeLeftTab: string;
  showShortcuts: boolean;
  hoveredGridPoint: { x: number; z: number; speed: number; pressure: number } | null;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setActiveLeftTab: (tab: string) => void;
  setShowShortcuts: (show: boolean) => void;
  setHoveredGridPoint: (point: UIState['hoveredGridPoint']) => void;
}

export const useUIStore = create<UIState>((set) => ({
  leftPanelOpen: true,
  rightPanelOpen: true,
  activeLeftTab: 'objects',
  showShortcuts: false,
  hoveredGridPoint: null,
  toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  setActiveLeftTab: (tab) => set({ activeLeftTab: tab }),
  setShowShortcuts: (show) => set({ showShortcuts: show }),
  setHoveredGridPoint: (point) => set({ hoveredGridPoint: point }),
}));
