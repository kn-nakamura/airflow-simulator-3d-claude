import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useSimulatorStore } from '../../store/simulatorStore';
import { sampleColormap } from '../../utils/colormap';

function sampleField(
  fieldU: Float32Array,
  fieldV: Float32Array,
  N: number,
  x: number,
  y: number,
): [number, number] {
  const i = Math.floor(x);
  const j = Math.floor(y);
  if (i < 0 || i >= N - 1 || j < 0 || j >= N - 1) return [0, 0];
  const fx = x - i;
  const fy = y - j;
  const idx00 = j * N + i;
  const idx10 = j * N + i + 1;
  const idx01 = (j + 1) * N + i;
  const idx11 = (j + 1) * N + i + 1;
  const u =
    (1 - fx) * (1 - fy) * fieldU[idx00] +
    fx * (1 - fy) * fieldU[idx10] +
    (1 - fx) * fy * fieldU[idx01] +
    fx * fy * fieldU[idx11];
  const v =
    (1 - fx) * (1 - fy) * fieldV[idx00] +
    fx * (1 - fy) * fieldV[idx10] +
    (1 - fx) * fy * fieldV[idx01] +
    fx * fy * fieldV[idx11];
  return [u, v];
}

function computeStreamline(
  fieldU: Float32Array,
  fieldV: Float32Array,
  N: number,
  startI: number,
  startJ: number,
  steps: number,
  dt: number,
): { points: THREE.Vector3[]; speeds: number[] } {
  const points: THREE.Vector3[] = [];
  const speeds: number[] = [];
  let x = startI;
  let y = startJ;

  for (let s = 0; s < steps; s++) {
    if (x < 0 || x >= N || y < 0 || y >= N) break;

    const [u, v] = sampleField(fieldU, fieldV, N, x, y);
    const speed = Math.sqrt(u * u + v * v);
    points.push(new THREE.Vector3(x, 0, y));
    speeds.push(speed);

    if (speed < 0.01) break;

    // RK4
    const [k1u, k1v] = sampleField(fieldU, fieldV, N, x, y);
    const [k2u, k2v] = sampleField(fieldU, fieldV, N, x + 0.5 * dt * k1u, y + 0.5 * dt * k1v);
    const [k3u, k3v] = sampleField(fieldU, fieldV, N, x + 0.5 * dt * k2u, y + 0.5 * dt * k2v);
    const [k4u, k4v] = sampleField(fieldU, fieldV, N, x + dt * k3u, y + dt * k3v);

    x += (dt / 6) * (k1u + 2 * k2u + 2 * k3u + k4u);
    y += (dt / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);
  }

  return { points, speeds };
}

export function Streamlines() {
  const fieldData = useSimulatorStore((s) => s.fieldData);
  const simulation = useSimulatorStore((s) => s.simulation);
  const vis = useSimulatorStore((s) => s.visualization);
  const [lines, setLines] = useState<{ positions: Float32Array; colors: Float32Array }[]>([]);
  const lastUpdate = useRef(0);

  useFrame(({ clock }) => {
    if (!fieldData) return;
    const now = clock.getElapsedTime();
    if (now - lastUpdate.current < 3) return;
    lastUpdate.current = now;

    const N = fieldData.gridSize;
    const cs = simulation.cellScale;
    const hw = (N * cs) / 2;
    const density = vis.streamlineDensity;
    const steps = vis.streamlineSteps;
    const spacing = Math.max(2, Math.floor(N / density));
    const newLines: { positions: Float32Array; colors: Float32Array }[] = [];

    let maxSpeed = 0;
    for (let i = 0; i < fieldData.u.length; i++) {
      const s = Math.sqrt(fieldData.u[i] ** 2 + fieldData.v[i] ** 2);
      if (s > maxSpeed) maxSpeed = s;
    }
    if (maxSpeed < 0.01) maxSpeed = 1;

    for (let sj = spacing / 2; sj < N; sj += spacing) {
      for (let si = spacing / 2; si < N; si += spacing) {
        const { points, speeds } = computeStreamline(
          fieldData.u, fieldData.v, N, si, sj, steps, 0.5,
        );
        if (points.length < 2) continue;

        const positions = new Float32Array(points.length * 3);
        const colors = new Float32Array(points.length * 3);

        for (let k = 0; k < points.length; k++) {
          positions[k * 3] = points[k].x * cs - hw;
          positions[k * 3 + 1] = 0.5;
          positions[k * 3 + 2] = points[k].z * cs - hw;

          const t = Math.min(speeds[k] / maxSpeed, 1);
          const [r, g, b] = sampleColormap(vis.colormap, t);
          colors[k * 3] = r / 255;
          colors[k * 3 + 1] = g / 255;
          colors[k * 3 + 2] = b / 255;
        }

        newLines.push({ positions, colors });
      }
    }

    setLines(newLines);
  });

  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useThree();

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    // Clear old lines
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if ((child as any).geometry) (child as any).geometry.dispose();
      if ((child as any).material) (child as any).material.dispose();
    }
    // Add new lines
    for (const lineData of lines) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(lineData.positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(lineData.colors, 3));
      const material = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      });
      const line = new THREE.Line(geometry, material);
      line.renderOrder = 999;
      group.add(line);
    }
  }, [lines]);

  return <group ref={groupRef} renderOrder={999} />;
}
