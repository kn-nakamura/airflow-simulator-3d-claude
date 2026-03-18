/**
 * Jos Stam Stable Fluid Solver (2D, extended)
 * Reference: Jos Stam "Real-Time Fluid Dynamics for Games" (2003)
 */
export class FluidSolver {
  N: number;
  size: number;
  u: Float32Array;
  v: Float32Array;
  u0: Float32Array;
  v0: Float32Array;
  p: Float32Array;
  div: Float32Array;
  solid: Uint8Array;
  viscosity: number;
  iterations: number;
  cellScale: number;
  windU: number;
  windV: number;
  turbulenceIntensity: number;
  windProfile: 'uniform' | 'boundary_layer';

  constructor(N: number) {
    this.N = N;
    this.size = (N + 2) * (N + 2);
    this.u = new Float32Array(this.size);
    this.v = new Float32Array(this.size);
    this.u0 = new Float32Array(this.size);
    this.v0 = new Float32Array(this.size);
    this.p = new Float32Array(this.size);
    this.div = new Float32Array(this.size);
    this.solid = new Uint8Array(this.size);
    this.viscosity = 0.0001;
    this.iterations = 40;
    this.cellScale = 0.25;
    this.windU = 10;
    this.windV = 0;
    this.turbulenceIntensity = 0;
    this.windProfile = 'uniform';
  }

  private IX(i: number, j: number): number {
    return i + (this.N + 2) * j;
  }

  setSolid(mask: Uint8Array): void {
    this.solid.set(mask);
  }

  setWind(u: number, v: number, turbulence: number, profile: 'uniform' | 'boundary_layer'): void {
    this.windU = u;
    this.windV = v;
    this.turbulenceIntensity = turbulence;
    this.windProfile = profile;
  }

  reset(): void {
    this.u.fill(0);
    this.v.fill(0);
    this.u0.fill(0);
    this.v0.fill(0);
    this.p.fill(0);
    this.div.fill(0);
  }

  step(dt: number): void {
    // Apply inflow boundary
    this.applyInflow();

    // Enforce solid before processing (prevent leakage)
    this.enforceSolid();

    // Add turbulence
    if (this.turbulenceIntensity > 0) {
      this.addTurbulence(dt);
    }

    // Velocity step
    this.u0.set(this.u);
    this.v0.set(this.v);

    // Diffuse
    if (this.viscosity > 0) {
      this.diffuse(1, this.u, this.u0, this.viscosity, dt);
      this.diffuse(2, this.v, this.v0, this.viscosity, dt);
      this.enforceSolid();
    }

    // Project to remove divergence after diffusion
    this.project(this.u, this.v);
    this.enforceSolid();

    this.u0.set(this.u);
    this.v0.set(this.v);

    // Advect
    this.advect(1, this.u, this.u0, this.u0, this.v0, dt);
    this.advect(2, this.v, this.v0, this.u0, this.v0, dt);
    this.enforceSolid();

    // Project (Hodge decomposition)
    this.project(this.u, this.v);

    // Final solid enforcement
    this.enforceSolid();

    // Outflow boundary
    this.applyOutflow();
  }

  private applyInflow(): void {
    const N = this.N;

    // Inject from left boundary when wind has positive u component
    if (this.windU > 0) {
      for (let j = 1; j <= N; j++) {
        let wu = this.windU;
        if (this.windProfile === 'boundary_layer') {
          wu *= Math.pow(j / N, 0.2);
        }
        this.u[this.IX(0, j)] = wu;
        this.u[this.IX(1, j)] = wu;
        this.v[this.IX(0, j)] = this.windV;
        this.v[this.IX(1, j)] = this.windV;
      }
    }

    // Inject from right boundary when wind has negative u component
    if (this.windU < 0) {
      for (let j = 1; j <= N; j++) {
        let wu = this.windU;
        if (this.windProfile === 'boundary_layer') {
          wu *= Math.pow(j / N, 0.2);
        }
        this.u[this.IX(N, j)] = wu;
        this.u[this.IX(N + 1, j)] = wu;
        this.v[this.IX(N, j)] = this.windV;
        this.v[this.IX(N + 1, j)] = this.windV;
      }
    }

    // Inject from bottom boundary when wind has positive v component
    if (this.windV > 0) {
      for (let i = 1; i <= N; i++) {
        this.u[this.IX(i, 0)] = this.windU;
        this.u[this.IX(i, 1)] = this.windU;
        this.v[this.IX(i, 0)] = this.windV;
        this.v[this.IX(i, 1)] = this.windV;
      }
    }

    // Inject from top boundary when wind has negative v component
    if (this.windV < 0) {
      for (let i = 1; i <= N; i++) {
        this.u[this.IX(i, N)] = this.windU;
        this.u[this.IX(i, N + 1)] = this.windU;
        this.v[this.IX(i, N)] = this.windV;
        this.v[this.IX(i, N + 1)] = this.windV;
      }
    }
  }

  private applyOutflow(): void {
    const N = this.N;

    // Right outflow if wind going rightward
    if (this.windU >= 0) {
      for (let j = 1; j <= N; j++) {
        this.u[this.IX(N + 1, j)] = this.u[this.IX(N, j)];
        this.v[this.IX(N + 1, j)] = this.v[this.IX(N, j)];
      }
    }

    // Left outflow if wind going leftward
    if (this.windU <= 0) {
      for (let j = 1; j <= N; j++) {
        this.u[this.IX(0, j)] = this.u[this.IX(1, j)];
        this.v[this.IX(0, j)] = this.v[this.IX(1, j)];
      }
    }

    // Top outflow if wind going upward
    if (this.windV >= 0) {
      for (let i = 0; i <= N + 1; i++) {
        this.u[this.IX(i, N + 1)] = this.u[this.IX(i, N)];
        this.v[this.IX(i, N + 1)] = this.v[this.IX(i, N)];
      }
    }

    // Bottom outflow if wind going downward
    if (this.windV <= 0) {
      for (let i = 0; i <= N + 1; i++) {
        this.u[this.IX(i, 0)] = this.u[this.IX(i, 1)];
        this.v[this.IX(i, 0)] = this.v[this.IX(i, 1)];
      }
    }
  }

  private addTurbulence(dt: number): void {
    const N = this.N;
    const intensity = this.turbulenceIntensity / 100;
    const speed = Math.sqrt(this.windU * this.windU + this.windV * this.windV);
    for (let j = 1; j <= N; j++) {
      for (let i = 1; i <= N; i++) {
        if (this.solid[this.IX(i, j)]) continue;
        this.u[this.IX(i, j)] += (Math.random() - 0.5) * speed * intensity * dt * 2;
        this.v[this.IX(i, j)] += (Math.random() - 0.5) * speed * intensity * dt * 2;
      }
    }
  }

  private diffuse(b: number, x: Float32Array, x0: Float32Array, visc: number, dt: number): void {
    const N = this.N;
    const a = dt * visc * N * N;
    const c = 1 + 4 * a;
    for (let k = 0; k < 20; k++) {
      for (let j = 1; j <= N; j++) {
        for (let i = 1; i <= N; i++) {
          if (this.solid[this.IX(i, j)]) continue;
          x[this.IX(i, j)] =
            (x0[this.IX(i, j)] +
              a * (x[this.IX(i - 1, j)] + x[this.IX(i + 1, j)] +
                   x[this.IX(i, j - 1)] + x[this.IX(i, j + 1)])) / c;
        }
      }
      this.setBoundary(b, x);
    }
  }

  private advect(b: number, d: Float32Array, d0: Float32Array, u: Float32Array, v: Float32Array, dt: number): void {
    const N = this.N;
    const dt0 = dt * N;
    for (let j = 1; j <= N; j++) {
      for (let i = 1; i <= N; i++) {
        if (this.solid[this.IX(i, j)]) continue;
        let x = i - dt0 * u[this.IX(i, j)];
        let y = j - dt0 * v[this.IX(i, j)];
        if (x < 0.5) x = 0.5;
        if (x > N + 0.5) x = N + 0.5;
        if (y < 0.5) y = 0.5;
        if (y > N + 0.5) y = N + 0.5;
        const i0 = Math.floor(x);
        const i1 = i0 + 1;
        const j0 = Math.floor(y);
        const j1 = j0 + 1;
        const s1 = x - i0;
        const s0 = 1 - s1;
        const t1 = y - j0;
        const t0 = 1 - t1;
        d[this.IX(i, j)] =
          s0 * (t0 * d0[this.IX(i0, j0)] + t1 * d0[this.IX(i0, j1)]) +
          s1 * (t0 * d0[this.IX(i1, j0)] + t1 * d0[this.IX(i1, j1)]);
      }
    }
    this.setBoundary(b, d);
  }

  private project(u: Float32Array, v: Float32Array): void {
    const N = this.N;
    const h = 1.0 / N;

    // Compute divergence (use zero velocity at solid faces for no-penetration)
    for (let j = 1; j <= N; j++) {
      for (let i = 1; i <= N; i++) {
        if (this.solid[this.IX(i, j)]) {
          this.div[this.IX(i, j)] = 0;
          this.p[this.IX(i, j)] = 0;
          continue;
        }
        // Use zero for velocity at solid-fluid interface faces
        const uR = this.solid[this.IX(i + 1, j)] ? 0 : u[this.IX(i + 1, j)];
        const uL = this.solid[this.IX(i - 1, j)] ? 0 : u[this.IX(i - 1, j)];
        const vT = this.solid[this.IX(i, j + 1)] ? 0 : v[this.IX(i, j + 1)];
        const vB = this.solid[this.IX(i, j - 1)] ? 0 : v[this.IX(i, j - 1)];
        this.div[this.IX(i, j)] = -0.5 * h * (uR - uL + vT - vB);
        this.p[this.IX(i, j)] = 0;
      }
    }
    this.setBoundary(0, this.div);
    this.setBoundary(0, this.p);

    // Gauss-Seidel solve for pressure with Neumann BC at solid boundaries
    for (let k = 0; k < this.iterations; k++) {
      for (let j = 1; j <= N; j++) {
        for (let i = 1; i <= N; i++) {
          if (this.solid[this.IX(i, j)]) continue;
          // Count fluid neighbors and apply Neumann BC (zero gradient) at solid faces
          let pSum = this.div[this.IX(i, j)];
          let cnt = 0;
          if (!this.solid[this.IX(i - 1, j)]) { pSum += this.p[this.IX(i - 1, j)]; cnt++; }
          if (!this.solid[this.IX(i + 1, j)]) { pSum += this.p[this.IX(i + 1, j)]; cnt++; }
          if (!this.solid[this.IX(i, j - 1)]) { pSum += this.p[this.IX(i, j - 1)]; cnt++; }
          if (!this.solid[this.IX(i, j + 1)]) { pSum += this.p[this.IX(i, j + 1)]; cnt++; }
          if (cnt > 0) this.p[this.IX(i, j)] = pSum / cnt;
        }
      }
      this.setBoundary(0, this.p);
    }

    // Subtract pressure gradient using Neumann BC at solid faces
    for (let j = 1; j <= N; j++) {
      for (let i = 1; i <= N; i++) {
        if (this.solid[this.IX(i, j)]) continue;
        // Use current cell pressure for solid neighbors (zero gradient = no acceleration toward solid)
        const pL = this.solid[this.IX(i - 1, j)] ? this.p[this.IX(i, j)] : this.p[this.IX(i - 1, j)];
        const pR = this.solid[this.IX(i + 1, j)] ? this.p[this.IX(i, j)] : this.p[this.IX(i + 1, j)];
        const pB = this.solid[this.IX(i, j - 1)] ? this.p[this.IX(i, j)] : this.p[this.IX(i, j - 1)];
        const pT = this.solid[this.IX(i, j + 1)] ? this.p[this.IX(i, j)] : this.p[this.IX(i, j + 1)];
        u[this.IX(i, j)] -= 0.5 * N * (pR - pL);
        v[this.IX(i, j)] -= 0.5 * N * (pT - pB);
      }
    }
    this.setBoundary(1, u);
    this.setBoundary(2, v);
  }

  private enforceSolid(): void {
    const N = this.N;
    for (let j = 1; j <= N; j++) {
      for (let i = 1; i <= N; i++) {
        if (this.solid[this.IX(i, j)]) {
          this.u[this.IX(i, j)] = 0;
          this.v[this.IX(i, j)] = 0;
        }
      }
    }
  }

  private setBoundary(b: number, x: Float32Array): void {
    const N = this.N;
    for (let i = 1; i <= N; i++) {
      x[this.IX(0, i)] = b === 1 ? -x[this.IX(1, i)] : x[this.IX(1, i)];
      x[this.IX(N + 1, i)] = b === 1 ? -x[this.IX(N, i)] : x[this.IX(N, i)];
      x[this.IX(i, 0)] = b === 2 ? -x[this.IX(i, 1)] : x[this.IX(i, 1)];
      x[this.IX(i, N + 1)] = b === 2 ? -x[this.IX(i, N)] : x[this.IX(i, N)];
    }
    x[this.IX(0, 0)] = 0.5 * (x[this.IX(1, 0)] + x[this.IX(0, 1)]);
    x[this.IX(0, N + 1)] = 0.5 * (x[this.IX(1, N + 1)] + x[this.IX(0, N)]);
    x[this.IX(N + 1, 0)] = 0.5 * (x[this.IX(N, 0)] + x[this.IX(N + 1, 1)]);
    x[this.IX(N + 1, N + 1)] = 0.5 * (x[this.IX(N, N + 1)] + x[this.IX(N + 1, N)]);
  }

  getFieldData(): { u: Float32Array; v: Float32Array; pressure: Float32Array } {
    const N = this.N;
    const fieldSize = N * N;
    const uOut = new Float32Array(fieldSize);
    const vOut = new Float32Array(fieldSize);
    const pOut = new Float32Array(fieldSize);
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const idx = j * N + i;
        uOut[idx] = this.u[this.IX(i + 1, j + 1)];
        vOut[idx] = this.v[this.IX(i + 1, j + 1)];
        pOut[idx] = this.p[this.IX(i + 1, j + 1)];
      }
    }
    return { u: uOut, v: vOut, pressure: pOut };
  }
}
