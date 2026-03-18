import { FluidSolver } from './FluidSolver';
import type { SolverMessage } from '../types';

let solver: FluidSolver | null = null;

self.onmessage = (e: MessageEvent<SolverMessage>) => {
  const msg = e.data;

  switch (msg.type) {
    case 'init': {
      const gridSize = msg.gridSize ?? 128;
      solver = new FluidSolver(gridSize);
      if (msg.viscosity !== undefined) solver.viscosity = msg.viscosity;
      if (msg.iterations !== undefined) solver.iterations = msg.iterations;
      if (msg.cellScale !== undefined) solver.cellScale = msg.cellScale;
      break;
    }
    case 'updateWind': {
      if (!solver || !msg.wind) break;
      // azimuth=0 → wind flows from left (West) to right (East), positive u
      const az = (msg.wind.azimuth * Math.PI) / 180;
      const wu = Math.cos(az) * msg.wind.speed;
      const wv = Math.sin(az) * msg.wind.speed;
      solver.setWind(wu, wv, msg.wind.turbulenceIntensity, msg.wind.profile);
      break;
    }
    case 'updateSolid': {
      if (!solver || !msg.solidMask) break;
      solver.setSolid(msg.solidMask);
      break;
    }
    case 'reset': {
      if (!solver) break;
      solver.reset();
      break;
    }
    case 'step': {
      if (!solver) break;
      const dt = msg.dt ?? 0.016;
      solver.step(dt);
      const field = solver.getFieldData();
      const solid = solver.solid;
      const solidOut = new Uint8Array(solid.buffer.slice(0));
      const response = {
        type: 'fieldData' as const,
        u: field.u,
        v: field.v,
        pressure: field.pressure,
        solid: solidOut,
      };
      (self as unknown as Worker).postMessage(response, [
        field.u.buffer,
        field.v.buffer,
        field.pressure.buffer,
        solidOut.buffer,
      ]);
      break;
    }
  }
};
