import { useSimulatorStore } from '../../store/simulatorStore';

export function SimulationPanel() {
  const simulation = useSimulatorStore((s) => s.simulation);
  const setSimulation = useSimulatorStore((s) => s.setSimulation);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setSimulation({ running: !simulation.running })}
        className={`w-full px-3 py-2 rounded text-sm font-semibold transition-colors ${
          simulation.running
            ? 'bg-amber-500/20 border border-amber-500 text-amber-400 hover:bg-amber-500/30'
            : 'bg-emerald-500/20 border border-emerald-500 text-emerald-400 hover:bg-emerald-500/30'
        }`}
      >
        {simulation.running ? '⏸ Pause' : '▶ Start'}
      </button>

      <div className="space-y-1">
        <div className="text-xs text-slate-400">Grid Resolution</div>
        <div className="flex gap-1">
          {[64, 128].map((size) => (
            <button
              key={size}
              onClick={() => setSimulation({ gridSize: size })}
              className={`flex-1 px-2 py-1 rounded text-xs border transition-colors ${
                simulation.gridSize === size
                  ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {size}x{size}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Viscosity</span>
          <span className="text-slate-300 font-mono">{simulation.viscosity.toFixed(4)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={0.01}
          step={0.0001}
          value={simulation.viscosity}
          onChange={(e) => setSimulation({ viscosity: parseFloat(e.target.value) })}
          className="w-full h-1 accent-sky-500"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Solver Iterations</span>
          <span className="text-slate-300 font-mono">{simulation.solverIterations}</span>
        </div>
        <input
          type="range"
          min={10}
          max={80}
          step={5}
          value={simulation.solverIterations}
          onChange={(e) => setSimulation({ solverIterations: parseInt(e.target.value) })}
          className="w-full h-1 accent-sky-500"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Cell Scale</span>
          <span className="text-slate-300 font-mono">{simulation.cellScale.toFixed(2)} m</span>
        </div>
        <input
          type="range"
          min={0.1}
          max={0.5}
          step={0.05}
          value={simulation.cellScale}
          onChange={(e) => setSimulation({ cellScale: parseFloat(e.target.value) })}
          className="w-full h-1 accent-sky-500"
        />
      </div>
    </div>
  );
}
