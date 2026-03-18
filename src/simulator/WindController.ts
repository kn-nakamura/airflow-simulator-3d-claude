import type { WindSettings } from '../types';

export function windToSolverParams(wind: WindSettings) {
  const az = (wind.azimuth * Math.PI) / 180;
  return {
    u: -Math.sin(az) * wind.speed,
    v: -Math.cos(az) * wind.speed,
    turbulence: wind.turbulenceIntensity,
    profile: wind.profile,
  };
}
