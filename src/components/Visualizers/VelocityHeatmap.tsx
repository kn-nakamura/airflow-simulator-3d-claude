import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useSimulatorStore } from '../../store/simulatorStore';
import { sampleColormap } from '../../utils/colormap';

export function VelocityHeatmap() {
  const meshRef = useRef<THREE.Mesh>(null);
  const fieldData = useSimulatorStore((s) => s.fieldData);
  const simulation = useSimulatorStore((s) => s.simulation);
  const colormap = useSimulatorStore((s) => s.visualization.colormap);
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

    let maxSpeed = 0;
    for (let i = 0; i < N * N; i++) {
      const s = Math.sqrt(fieldData.u[i] ** 2 + fieldData.v[i] ** 2);
      if (s > maxSpeed) maxSpeed = s;
    }
    if (maxSpeed < 0.01) maxSpeed = 1;
    statsRef.current = { min: 0, max: maxSpeed };

    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const idx = j * N + i;
        const speed = Math.sqrt(fieldData.u[idx] ** 2 + fieldData.v[idx] ** 2);
        const t = speed / maxSpeed;
        const [r, g, b] = sampleColormap(colormap, t);
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
        position={[0, 0.05, 0]}
        renderOrder={998}
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
      <Html position={[worldSize / 2 + 1.5, 3, 0]} style={{ pointerEvents: 'none' }}>
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
          <div style={{ height: '100px', background: `linear-gradient(to bottom, #fde725, #21918c, #440154)`, borderRadius: '3px', marginBottom: '4px' }} />
          <div>{statsRef.current.max.toFixed(1)} m/s</div>
          <div style={{ marginTop: '80px' }}>{statsRef.current.min.toFixed(1)} m/s</div>
        </div>
      </Html>
    </group>
  );
}
