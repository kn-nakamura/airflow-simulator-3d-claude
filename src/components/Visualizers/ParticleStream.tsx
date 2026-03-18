import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useSimulatorStore } from '../../store/simulatorStore';

const dummy = new THREE.Object3D();
const color = new THREE.Color();

export function ParticleStream() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particleCount = useSimulatorStore((s) => s.visualization.particleCount);
  const fieldData = useSimulatorStore((s) => s.fieldData);
  const simulation = useSimulatorStore((s) => s.simulation);

  const positions = useMemo(() => {
    const N = simulation.gridSize;
    const worldSize = N * simulation.cellScale;
    const hw = worldSize / 2;
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = Math.random() * worldSize - hw;
      pos[i * 3 + 1] = Math.random() * 3 + 0.1;
      pos[i * 3 + 2] = Math.random() * worldSize - hw;
    }
    return pos;
  }, [particleCount, simulation.gridSize, simulation.cellScale]);

  const posRef = useRef(positions);
  posRef.current = positions;

  useFrame(() => {
    if (!meshRef.current || !fieldData) return;

    const N = fieldData.gridSize;
    const cs = simulation.cellScale;
    const worldSize = N * cs;
    const hw = worldSize / 2;
    const pos = posRef.current;

    for (let p = 0; p < particleCount; p++) {
      let px = pos[p * 3];
      let py = pos[p * 3 + 1];
      let pz = pos[p * 3 + 2];

      // Grid coordinates
      const gi = Math.floor((px + hw) / cs);
      const gj = Math.floor((pz + hw) / cs);

      let u = 0, v = 0;
      if (gi >= 0 && gi < N && gj >= 0 && gj < N) {
        const idx = gj * N + gi;
        u = fieldData.u[idx];
        v = fieldData.v[idx];
      }

      const speed = Math.sqrt(u * u + v * v);
      const dt = 0.02;
      px += u * dt;
      pz += v * dt;

      // Respawn if out of bounds
      if (px < -hw || px > hw || pz < -hw || pz > hw) {
        px = -hw + Math.random() * 2;
        py = Math.random() * 3 + 0.1;
        pz = Math.random() * worldSize - hw;
      }

      pos[p * 3] = px;
      pos[p * 3 + 1] = py;
      pos[p * 3 + 2] = pz;

      const scale = 0.03 + speed * 0.005;
      dummy.position.set(px, py, pz);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(p, dummy.matrix);

      // Color by speed: blue -> cyan -> white
      const t = Math.min(speed / 15, 1);
      if (t < 0.5) {
        color.setRGB(0.1, 0.2 + t * 1.2, 0.8 + t * 0.4);
      } else {
        color.setRGB(0.1 + (t - 0.5) * 1.8, 0.8 + (t - 0.5) * 0.4, 1.0);
      }
      meshRef.current.setColorAt(p, color);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, particleCount]}
      frustumCulled={false}
      renderOrder={999}
    >
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial
        transparent
        opacity={0.8}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}
