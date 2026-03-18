import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

export function FpsCounter() {
  const [fps, setFps] = useState(60);
  const frames = useRef(0);
  const lastTime = useRef(performance.now());

  useFrame(() => {
    frames.current++;
    const now = performance.now();
    if (now - lastTime.current >= 1000) {
      setFps(frames.current);
      frames.current = 0;
      lastTime.current = now;
    }
  });

  return (
    <Html
      position={[0, 0, 0]}
      style={{
        position: 'fixed',
        bottom: '12px',
        right: '280px',
        background: 'rgba(15,22,35,0.8)',
        color: fps >= 30 ? '#10b981' : '#f59e0b',
        padding: '4px 10px',
        borderRadius: '4px',
        fontSize: '12px',
        fontFamily: "'JetBrains Mono', monospace",
        pointerEvents: 'none',
        zIndex: 100,
      }}
    >
      {fps} FPS
    </Html>
  );
}
