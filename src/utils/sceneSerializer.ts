import type { SceneData, SceneObject, WindSettings, VisualizationSettings, SimulationSettings } from '../types';

export function serializeScene(
  objects: SceneObject[],
  wind: WindSettings,
  visualization: VisualizationSettings,
  simulation: SimulationSettings,
): string {
  const data: SceneData = { objects, wind, visualization, simulation };
  return JSON.stringify(data, null, 2);
}

export function deserializeScene(json: string): SceneData {
  return JSON.parse(json) as SceneData;
}

export function encodeSceneToURL(data: SceneData): string {
  const compressed = btoa(JSON.stringify(data));
  return `${window.location.origin}${window.location.pathname}?scene=${encodeURIComponent(compressed)}`;
}

export function decodeSceneFromURL(): SceneData | null {
  const params = new URLSearchParams(window.location.search);
  const scene = params.get('scene');
  if (!scene) return null;
  try {
    return JSON.parse(atob(decodeURIComponent(scene))) as SceneData;
  } catch {
    return null;
  }
}

export function exportFieldToCSV(
  field: Float32Array,
  gridSize: number,
  label: string,
): string {
  let csv = `x,z,${label}\n`;
  for (let j = 0; j < gridSize; j++) {
    for (let i = 0; i < gridSize; i++) {
      csv += `${i},${j},${field[j * gridSize + i].toFixed(6)}\n`;
    }
  }
  return csv;
}
