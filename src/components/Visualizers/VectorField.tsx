import { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useSimulatorStore } from '../../store/simulatorStore';
import { sampleColormap } from '../../utils/colormap';

const dummy = new THREE.Object3D();
const color = new THREE.Color();

export function VectorField() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const fieldData = useSimulatorStore((s) => s.fieldData);
  const simulation = useSimulatorStore((s) => s.simulation);
  const vis = useSimulatorStore((s) => s.visualization);
  const [count, setCount] = useState(0);
  const frameRef = useRef(0);

  useFrame(() => {
    if (!meshRef.current || !fieldData) return;
    frameRef.current++;
    if (frameRef.current % 4 !== 0) return;

    const N = fieldData.gridSize;
    const cs = simulation.cellScale;
    const hw = (N * cs) / 2;
    const spacing = vis.vectorFieldSpacing;
    let maxSpeed = 0;

    for (let i = 0; i < N * N; i++) {
      const s = Math.sqrt(fieldData.u[i] ** 2 + fieldData.v[i] ** 2);
      if (s > maxSpeed) maxSpeed = s;
    }
    if (maxSpeed < 0.01) maxSpeed = 1;

    let idx = 0;
    for (let j = 0; j < N; j += spacing) {
      for (let i = 0; i < N; i += spacing) {
        const fi = j * N + i;
        const u = fieldData.u[fi];
        const v = fieldData.v[fi];
        const speed = Math.sqrt(u * u + v * v);
        const len = (speed / maxSpeed) * cs * spacing * 0.8;

        if (speed < 0.01) continue;
        if (idx >= meshRef.current.count) break;

        const wx = i * cs - hw;
        const wz = j * cs - hw;
        const angle = Math.atan2(u, v);

        dummy.position.set(wx, 0.3, wz);
        dummy.rotation.set(0, angle, 0);
        dummy.scale.set(0.1, 0.1, len);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(idx, dummy.matrix);

        const t = speed / maxSpeed;
        const [r, g, b] = sampleColormap(vis.colormap, t);
        color.setRGB(r / 255, g / 255, b / 255);
        meshRef.current.setColorAt(idx, color);

        idx++;
      }
    }

    setCount(idx);
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
    meshRef.current.count = idx;
  });

  const maxArrows = Math.ceil(simulation.gridSize / vis.vectorFieldSpacing) ** 2;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, maxArrows]}
      frustumCulled={false}
      renderOrder={999}
    >
      <coneGeometry args={[1, 1, 4]} />
      <meshBasicMaterial
        vertexColors
        transparent
        opacity={0.7}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}
