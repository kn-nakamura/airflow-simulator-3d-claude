import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useSimulatorStore } from '../../store/simulatorStore';
import { sampleColormap } from '../../utils/colormap';

export function PressureHeatmap() {
  const meshRef = useRef<THREE.Mesh>(null);
  const fieldData = useSimulatorStore((s) => s.fieldData);
  const simulation = useSimulatorStore((s) => s.simulation);
  const frameCount = useRef(0);
  const statsRef = useRef({ min: 0, max: 1 });

  const { texture, worldSize } = useMemo(() => {
    const N = simulation.gridSize;
    const ws = N * simulation.cellScale;
    const data = new Uint8Array(N * N * 4);
    const tex = new THREE.DataTexture(data, N, N, THREE.RGBAFormat);
    tex.needsUpdate = true;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return { texture: tex, worldSize: ws };
  }, [simulation.gridSize, simulation.cellScale]);

  useFrame(() => {
    if (!fieldData || !meshRef.current) return;
    frameCount.current++;
    if (frameCount.current % 4 !== 0) return;

    const N = fieldData.gridSize;
    const data = texture.image.data as Uint8Array;

    let minP = Infinity, maxP = -Infinity;
    for (let i = 0; i < N * N; i++) {
      if (fieldData.pressure[i] < minP) minP = fieldData.pressure[i];
      if (fieldData.pressure[i] > maxP) maxP = fieldData.pressure[i];
    }
    const range = maxP - minP;
    if (range < 1e-8) {
      minP = -1;
      maxP = 1;
    }
    statsRef.current = { min: minP, max: maxP };

    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const idx = j * N + i;
        const t = (fieldData.pressure[idx] - minP) / (maxP - minP || 1);
        const [r, g, b] = sampleColormap('coolwarm', t);
        const di = (j * N + i) * 4;
        data[di] = r;
        data[di + 1] = g;
        data[di + 2] = b;
        data[di + 3] = 160;
      }
    }
    texture.needsUpdate = true;
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.08, 0]}
        renderOrder={997}
      >
        <planeGeometry args={[worldSize, worldSize]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={0.6}
          depthTest={false}
          blending={THREE.NormalBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      <Html position={[worldSize / 2 + 3, 3, 0]} style={{ pointerEvents: 'none' }}>
        <div
          style={{
            background: 'rgba(15,22,35,0.9)',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '8px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px',
            color: '#e2e8f0',
            width: '30px',
          }}
        >
          <div style={{ height: '100px', background: 'linear-gradient(to bottom, #b4041e, #dddddd, #3b4cc0)', borderRadius: '3px', marginBottom: '4px' }} />
          <div style={{ color: '#ef4444' }}>+{statsRef.current.max.toFixed(2)}</div>
          <div style={{ marginTop: '80px', color: '#3b82f6' }}>{statsRef.current.min.toFixed(2)}</div>
        </div>
      </Html>
    </group>
  );
}
