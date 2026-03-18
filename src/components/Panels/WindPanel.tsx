import { useSimulatorStore } from '../../store/simulatorStore';

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300 font-mono">
          {value.toFixed(step < 1 ? 1 : 0)} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 accent-sky-500"
      />
    </div>
  );
}

export function WindPanel() {
  const wind = useSimulatorStore((s) => s.wind);
  const setWind = useSimulatorStore((s) => s.setWind);

  return (
    <div className="space-y-3">
      <Slider
        label="Wind Speed"
        value={wind.speed}
        min={0}
        max={50}
        step={0.5}
        unit="m/s"
        onChange={(v) => setWind({ speed: v })}
      />
      <Slider
        label="Azimuth"
        value={wind.azimuth}
        min={0}
        max={360}
        step={5}
        unit="deg"
        onChange={(v) => setWind({ azimuth: v })}
      />
      <Slider
        label="Elevation"
        value={wind.elevation}
        min={-90}
        max={90}
        step={5}
        unit="deg"
        onChange={(v) => setWind({ elevation: v })}
      />
      <Slider
        label="Turbulence"
        value={wind.turbulenceIntensity}
        min={0}
        max={30}
        step={1}
        unit="%"
        onChange={(v) => setWind({ turbulenceIntensity: v })}
      />
      <div className="space-y-1">
        <div className="text-xs text-slate-400">Wind Profile</div>
        <div className="flex gap-1">
          {(['uniform', 'boundary_layer'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setWind({ profile: p })}
              className={`flex-1 px-2 py-1 rounded text-xs border transition-colors ${
                wind.profile === p
                  ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {p === 'uniform' ? 'Uniform' : 'Boundary Layer'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
