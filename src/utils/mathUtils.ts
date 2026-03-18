export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function windDirectionToVector(
  azimuthDeg: number,
  elevationDeg: number,
): [number, number, number] {
  const az = (azimuthDeg * Math.PI) / 180;
  const el = (elevationDeg * Math.PI) / 180;
  const cosEl = Math.cos(el);
  return [
    -Math.sin(az) * cosEl,
    Math.sin(el),
    -Math.cos(az) * cosEl,
  ];
}

export function magnitude2D(u: number, v: number): number {
  return Math.sqrt(u * u + v * v);
}

export function normalize2D(u: number, v: number): [number, number] {
  const m = magnitude2D(u, v);
  if (m < 1e-8) return [0, 0];
  return [u / m, v / m];
}
