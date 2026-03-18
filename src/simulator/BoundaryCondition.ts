import type { SceneObject } from '../types';

/**
 * Rasterize 3D objects to a 2D grid solid mask.
 * We project onto the XZ plane (Y is height, ignored for 2D solver).
 */
export function buildSolidMask(
  objects: SceneObject[],
  gridSize: number,
  cellScale: number,
): Uint8Array {
  const N = gridSize;
  const size = (N + 2) * (N + 2);
  const mask = new Uint8Array(size);
  const halfWorld = (N * cellScale) / 2;

  for (const obj of objects) {
    if (!obj.visible) continue;
    const [px, , pz] = obj.position;
    const [sx, , sz] = obj.scale;
    const rotY = obj.rotation[1];

    switch (obj.shape) {
      case 'box':
        rasterizeBox(mask, N, cellScale, halfWorld, px, pz, sx, sz, rotY);
        break;
      case 'sphere':
        rasterizeSphere(mask, N, cellScale, halfWorld, px, pz, Math.max(sx, sz));
        break;
      case 'cylinder':
        rasterizeSphere(mask, N, cellScale, halfWorld, px, pz, Math.max(sx, sz) * 0.5);
        break;
      case 'cone':
        rasterizeSphere(mask, N, cellScale, halfWorld, px, pz, Math.max(sx, sz) * 0.5);
        break;
      case 'torus':
        rasterizeTorus(mask, N, cellScale, halfWorld, px, pz, sx, rotY);
        break;
    }
  }

  return mask;
}

function IX(i: number, j: number, N: number): number {
  return i + (N + 2) * j;
}

function rasterizeBox(
  mask: Uint8Array, N: number, cs: number, hw: number,
  px: number, pz: number, sx: number, sz: number, rotY: number,
): void {
  const cosR = Math.cos(rotY);
  const sinR = Math.sin(rotY);
  const hsx = sx * 0.5;
  const hsz = sz * 0.5;

  for (let j = 1; j <= N; j++) {
    for (let i = 1; i <= N; i++) {
      const wx = i * cs - hw;
      const wz = j * cs - hw;
      const dx = wx - px;
      const dz = wz - pz;
      const lx = dx * cosR + dz * sinR;
      const lz = -dx * sinR + dz * cosR;
      if (Math.abs(lx) <= hsx && Math.abs(lz) <= hsz) {
        mask[IX(i, j, N)] = 1;
      }
    }
  }
}

function rasterizeSphere(
  mask: Uint8Array, N: number, cs: number, hw: number,
  px: number, pz: number, radius: number,
): void {
  for (let j = 1; j <= N; j++) {
    for (let i = 1; i <= N; i++) {
      const wx = i * cs - hw;
      const wz = j * cs - hw;
      const dx = wx - px;
      const dz = wz - pz;
      if (dx * dx + dz * dz <= radius * radius) {
        mask[IX(i, j, N)] = 1;
      }
    }
  }
}

function rasterizeTorus(
  mask: Uint8Array, N: number, cs: number, hw: number,
  px: number, pz: number, scale: number, _rotY: number,
): void {
  const R = scale * 0.7;
  const r = scale * 0.3;
  for (let j = 1; j <= N; j++) {
    for (let i = 1; i <= N; i++) {
      const wx = i * cs - hw;
      const wz = j * cs - hw;
      const dx = wx - px;
      const dz = wz - pz;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const diff = Math.abs(dist - R);
      if (diff <= r) {
        mask[IX(i, j, N)] = 1;
      }
    }
  }
}
