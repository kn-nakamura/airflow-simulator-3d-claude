import { create } from 'zustand';
import type {
  WindSettings,
  VisualizationSettings,
  SimulationSettings,
  FluidFieldData,
  AnalyticsData,
} from '../types';

interface SimulatorState {
  wind: WindSettings;
  visualization: VisualizationSettings;
  simulation: SimulationSettings;
  fieldData: FluidFieldData | null;
  analytics: AnalyticsData;
  resetToken: number;
  setWind: (wind: Partial<WindSettings>) => void;
  setVisualization: (vis: Partial<VisualizationSettings>) => void;
  setSimulation: (sim: Partial<SimulationSettings>) => void;
  setFieldData: (data: FluidFieldData) => void;
  setAnalytics: (data: Partial<AnalyticsData>) => void;
  toggleVisualization: (mode: VisualizationSettings['activeVisualizations'][number]) => void;
  resetSimulation: () => void;
}

export const useSimulatorStore = create<SimulatorState>((set) => ({
  wind: {
    azimuth: 0,
    elevation: 0,
    speed: 10,
    turbulenceIntensity: 5,
    profile: 'uniform',
  },
  visualization: {
    activeVisualizations: ['particles'],
    particleCount: 2000,
    particleTrails: false,
    streamlineDensity: 8,
    streamlineSteps: 100,
    colormap: 'viridis',
    vectorFieldSpacing: 4,
  },
  simulation: {
    running: true,
    gridSize: 128,
    cellScale: 0.25,
    viscosity: 0.0001,
    solverIterations: 40,
    updateRate: 60,
  },
  fieldData: null,
  resetToken: 0,
  analytics: {
    maxSpeed: 0,
    avgSpeed: 0,
    maxPressureDiff: 0,
    dragCoeff: 0,
    pressureCoeff: 0,
    turbulenceIntensity: 0,
    velocityProfile: [],
    pressureProfile: [],
  },
  setWind: (wind) => set((s) => ({ wind: { ...s.wind, ...wind } })),
  setVisualization: (vis) =>
    set((s) => ({ visualization: { ...s.visualization, ...vis } })),
  setSimulation: (sim) =>
    set((s) => ({ simulation: { ...s.simulation, ...sim } })),
  setFieldData: (data) => set({ fieldData: data }),
  setAnalytics: (data) => set((s) => ({ analytics: { ...s.analytics, ...data } })),
  toggleVisualization: (mode) =>
    set((s) => {
      const active = s.visualization.activeVisualizations;
      const next = active.includes(mode)
        ? active.filter((m) => m !== mode)
        : [...active, mode];
      return { visualization: { ...s.visualization, activeVisualizations: next } };
    }),
  resetSimulation: () =>
    set((s) => ({
      simulation: { ...s.simulation, running: false },
      resetToken: s.resetToken + 1,
      fieldData: null,
    })),
}));
