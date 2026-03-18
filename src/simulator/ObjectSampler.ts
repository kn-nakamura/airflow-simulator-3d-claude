import type { SceneObject } from '../types';
import { buildSolidMask } from './BoundaryCondition';

export function sampleObjectsToGrid(
  objects: SceneObject[],
  gridSize: number,
  cellScale: number,
): Uint8Array {
  return buildSolidMask(objects, gridSize, cellScale);
}
