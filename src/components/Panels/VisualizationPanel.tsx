import { useSimulatorStore } from '../../store/simulatorStore';
import type { VisualizationMode, ColormapName } from '../../types';

const visOptions: { mode: VisualizationMode; label: string }[] = [
  { mode: 'particles', label: 'Particles' },
  { mode: 'streamlines', label: 'Streamlines' },
  { mode: 'velocityHeatmap', label: 'Velocity Heatmap' },
  { mode: 'pressureHeatmap', label: 'Pressure Heatmap' },
  { mode: 'vectorField', label: 'Vector Field' },
];

const colormapOptions: ColormapName[] = ['viridis', 'plasma', 'turbo', 'coolwarm'];

export function VisualizationPanel() {
  const vis = useSimulatorStore((s) => s.visualization);
  const toggleVisualization = useSimulatorStore((s) => s.toggleVisualization);
  const setVisualization = useSimulatorStore((s) => s.setVisualization);

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Layers
      </div>
      <div className="space-y-1">
        {visOptions.map((opt) => (
          <label
            key={opt.mode}
            className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-slate-200"
          >
            <input
              type="checkbox"
              checked={vis.activeVisualizations.includes(opt.mode)}
              onChange={() => toggleVisualization(opt.mode)}
              className="accent-sky-500"
            />
            {opt.label}
          </label>
        ))}
      </div>

      {vis.activeVisualizations.includes('particles') && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Particle Count</span>
            <span className="text-slate-300 font-mono">{vis.particleCount}</span>
          </div>
          <input
            type="range"
            min={500}
            max={5000}
            step={100}
            value={vis.particleCount}
            onChange={(e) => setVisualization({ particleCount: parseInt(e.target.value) })}
            className="w-full h-1 accent-sky-500"
          />
        </div>
      )}

      {vis.activeVisualizations.includes('streamlines') && (
        <>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Seed Density</span>
              <span className="text-slate-300 font-mono">{vis.streamlineDensity}</span>
            </div>
            <input
              type="range"
              min={3}
              max={20}
              step={1}
              value={vis.streamlineDensity}
              onChange={(e) => setVisualization({ streamlineDensity: parseInt(e.target.value) })}
              className="w-full h-1 accent-sky-500"
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Integration Steps</span>
              <span className="text-slate-300 font-mono">{vis.streamlineSteps}</span>
            </div>
            <input
              type="range"
              min={20}
              max={300}
              step={10}
              value={vis.streamlineSteps}
              onChange={(e) => setVisualization({ streamlineSteps: parseInt(e.target.value) })}
              className="w-full h-1 accent-sky-500"
            />
          </div>
        </>
      )}

      <div className="space-y-1">
        <div className="text-xs text-slate-400">Colormap</div>
        <div className="grid grid-cols-2 gap-1">
          {colormapOptions.map((cm) => (
            <button
              key={cm}
              onClick={() => setVisualization({ colormap: cm })}
              className={`px-2 py-1 rounded text-xs border transition-colors capitalize ${
                vis.colormap === cm
                  ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {cm}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
