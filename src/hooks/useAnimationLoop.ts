import { useEffect, useRef } from 'react';

export function useAnimationLoop(callback: () => void, active: boolean = true) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    if (!active) return;
    let id: number;
    const loop = () => {
      cbRef.current();
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [active]);
}
