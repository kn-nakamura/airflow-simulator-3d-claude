import { useEffect, useRef, useCallback } from 'react';
import { useSimulatorStore } from '../store/simulatorStore';
import { useObjectStore } from '../store/objectStore';
import { buildSolidMask } from '../simulator/BoundaryCondition';
import type { SolverResponse } from '../types';

export function useFluidSolver() {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef(false);
  const { wind, simulation, setFieldData, setAnalytics } = useSimulatorStore();
  const objects = useObjectStore((s) => s.objects);
  const selectedId = useObjectStore((s) => s.selectedId);

  // Lazy import analytics to avoid circular
  const analyticsRef = useRef<typeof import('../simulator/Analytics')['computeAnalytics'] | null>(null);

  useEffect(() => {
    import('../simulator/Analytics').then((mod) => {
      analyticsRef.current = mod.computeAnalytics;
    });
  }, []);

  useEffect(() => {
    const worker = new Worker(
      new URL('../simulator/FluidWorker.ts', import.meta.url),
      { type: 'module' },
    );
    workerRef.current = worker;

    worker.postMessage({
      type: 'init',
      gridSize: simulation.gridSize,
      viscosity: simulation.viscosity,
      iterations: simulation.solverIterations,
      cellScale: simulation.cellScale,
    });

    worker.onmessage = (e: MessageEvent<SolverResponse>) => {
      if (e.data.type === 'fieldData') {
        pendingRef.current = false;
        const fieldData = {
          u: e.data.u,
          v: e.data.v,
          pressure: e.data.pressure,
          gridSize: simulation.gridSize,
        };
        setFieldData(fieldData);

        if (analyticsRef.current) {
          const selectedObj = useObjectStore.getState().objects.find(
            (o) => o.id === useObjectStore.getState().selectedId,
          ) || null;
          const analytics = analyticsRef.current(fieldData, selectedObj, simulation.cellScale);
          setAnalytics(analytics);
        }
      }
    };

    return () => {
      worker.terminate();
    };
  }, [simulation.gridSize]);

  // Update wind
  useEffect(() => {
    workerRef.current?.postMessage({ type: 'updateWind', wind });
  }, [wind]);

  // Update solid mask
  useEffect(() => {
    const mask = buildSolidMask(objects, simulation.gridSize, simulation.cellScale);
    workerRef.current?.postMessage({ type: 'updateSolid', solidMask: mask });
  }, [objects, simulation.gridSize, simulation.cellScale]);

  const stepSolver = useCallback(() => {
    if (!workerRef.current || pendingRef.current || !simulation.running) return;
    pendingRef.current = true;
    workerRef.current.postMessage({ type: 'step', dt: 1 / simulation.updateRate });
  }, [simulation.running, simulation.updateRate]);

  return { stepSolver };
}
