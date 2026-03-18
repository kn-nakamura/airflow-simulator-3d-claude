import type { FluidFieldData, AnalyticsData, SceneObject } from '../types';

export function computeAnalytics(
  field: FluidFieldData,
  selectedObject: SceneObject | null,
  cellScale: number,
): AnalyticsData {
  const { u, v, pressure, gridSize } = field;
  const N = gridSize;

  let maxSpeed = 0;
  let totalSpeed = 0;
  let minP = Infinity;
  let maxP = -Infinity;
  let count = 0;

  const velocityProfile: { x: number; v: number }[] = [];
  const pressureProfile: { x: number; p: number }[] = [];

  const midJ = Math.floor(N / 2);

  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const idx = j * N + i;
      const speed = Math.sqrt(u[idx] * u[idx] + v[idx] * v[idx]);
      if (speed > maxSpeed) maxSpeed = speed;
      totalSpeed += speed;
      if (pressure[idx] < minP) minP = pressure[idx];
      if (pressure[idx] > maxP) maxP = pressure[idx];
      count++;
    }
  }

  // Build mid-line profiles
  for (let i = 0; i < N; i++) {
    const idx = midJ * N + i;
    const speed = Math.sqrt(u[idx] * u[idx] + v[idx] * v[idx]);
    velocityProfile.push({ x: i * cellScale, v: speed });
    pressureProfile.push({ x: i * cellScale, p: pressure[idx] });
  }

  const avgSpeed = count > 0 ? totalSpeed / count : 0;
  const maxPressureDiff = maxP - minP;
  const windSpeed = Math.max(avgSpeed, 0.01);

  // Estimate drag coefficient for selected object
  let dragCoeff = 0;
  let pressureCoeff = 0;
  if (selectedObject) {
    const rho = 1.225; // air density kg/m^3
    const qInf = 0.5 * rho * windSpeed * windSpeed;
    // Approximate drag from pressure difference across object
    const [px, , pz] = selectedObject.position;
    const halfWorld = (N * cellScale) / 2;
    const gi = Math.round((px + halfWorld) / cellScale);
    const gj = Math.round((pz + halfWorld) / cellScale);
    if (gi > 1 && gi < N - 1 && gj > 0 && gj < N) {
      const pFront = pressure[gj * N + Math.max(0, gi - 2)];
      const pBack = pressure[gj * N + Math.min(N - 1, gi + 2)];
      const dpForce = (pFront - pBack) * cellScale;
      const charLength = Math.max(selectedObject.scale[0], selectedObject.scale[2]) * cellScale;
      dragCoeff = Math.abs(dpForce) / (qInf * charLength + 1e-10);
      pressureCoeff = (pFront - pBack) / (qInf + 1e-10);
    }
  }

  // Turbulence intensity from velocity variance
  let speedVar = 0;
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const idx = j * N + i;
      const speed = Math.sqrt(u[idx] * u[idx] + v[idx] * v[idx]);
      speedVar += (speed - avgSpeed) * (speed - avgSpeed);
    }
  }
  const turbulenceIntensity = count > 0 ? Math.sqrt(speedVar / count) / (avgSpeed + 1e-10) * 100 : 0;

  return {
    maxSpeed,
    avgSpeed,
    maxPressureDiff,
    dragCoeff: Math.min(dragCoeff, 10),
    pressureCoeff: Math.min(Math.max(pressureCoeff, -5), 5),
    turbulenceIntensity: Math.min(turbulenceIntensity, 100),
    velocityProfile,
    pressureProfile,
  };
}
