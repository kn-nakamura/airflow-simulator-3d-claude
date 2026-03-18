export type ShapeType = 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus';

export interface SceneObject {
  id: string;
  name: string;
  shape: ShapeType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  roughness: number;
  visible: boolean;
  locked: boolean;
  color: string;
}

export type TransformMode = 'translate' | 'rotate' | 'scale';

export type WindProfile = 'uniform' | 'boundary_layer';

export interface WindSettings {
  azimuth: number;
  elevation: number;
  speed: number;
  turbulenceIntensity: number;
  profile: WindProfile;
}

export type VisualizationMode = 'particles' | 'streamlines' | 'velocityHeatmap' | 'pressureHeatmap' | 'vectorField';

export type ColormapName = 'viridis' | 'plasma' | 'turbo' | 'coolwarm';

export interface VisualizationSettings {
  activeVisualizations: VisualizationMode[];
  particleCount: number;
  particleTrails: boolean;
  streamlineDensity: number;
  streamlineSteps: number;
  colormap: ColormapName;
  vectorFieldSpacing: number;
}

export interface SimulationSettings {
  running: boolean;
  gridSize: number;
  cellScale: number;
  viscosity: number;
  solverIterations: number;
  updateRate: number;
}

export interface FluidFieldData {
  u: Float32Array;
  v: Float32Array;
  pressure: Float32Array;
  gridSize: number;
}

export interface AnalyticsData {
  maxSpeed: number;
  avgSpeed: number;
  maxPressureDiff: number;
  dragCoeff: number;
  pressureCoeff: number;
  turbulenceIntensity: number;
  velocityProfile: { x: number; v: number }[];
  pressureProfile: { x: number; p: number }[];
}

export interface PresetScene {
  name: string;
  description: string;
  objects: SceneObject[];
  wind: WindSettings;
}

export interface SceneData {
  objects: SceneObject[];
  wind: WindSettings;
  visualization: VisualizationSettings;
  simulation: SimulationSettings;
}

export interface SolverMessage {
  type: 'init' | 'step' | 'updateSolid' | 'updateWind';
  gridSize?: number;
  dt?: number;
  wind?: WindSettings;
  solidMask?: Uint8Array;
  viscosity?: number;
  iterations?: number;
  cellScale?: number;
}

export interface SolverResponse {
  type: 'fieldData';
  u: Float32Array;
  v: Float32Array;
  pressure: Float32Array;
}
