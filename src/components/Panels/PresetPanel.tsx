import { useObjectStore } from '../../store/objectStore';
import { useSimulatorStore } from '../../store/simulatorStore';
import type { PresetScene } from '../../types';

const presets: PresetScene[] = [
  {
    name: 'Building Wind',
    description: 'Tall buildings creating wind acceleration between them',
    objects: [
      { id: 'b1', name: 'Building 1', shape: 'box', position: [-3, 3, -2], rotation: [0, 0, 0], scale: [2, 6, 2], roughness: 0.8, visible: true, locked: false, color: '#6366f1' },
      { id: 'b2', name: 'Building 2', shape: 'box', position: [3, 4, -2], rotation: [0, 0, 0], scale: [2.5, 8, 2], roughness: 0.8, visible: true, locked: false, color: '#818cf8' },
      { id: 'b3', name: 'Building 3', shape: 'box', position: [0, 2, 3], rotation: [0, 0.3, 0], scale: [3, 4, 2], roughness: 0.7, visible: true, locked: false, color: '#a5b4fc' },
    ],
    wind: { azimuth: 0, elevation: 0, speed: 12, turbulenceIntensity: 5, profile: 'boundary_layer' },
  },
  {
    name: 'Car Aerodynamics',
    description: 'Simplified car shape to observe wake turbulence',
    objects: [
      { id: 'c1', name: 'Car Body', shape: 'box', position: [0, 0.5, 0], rotation: [0, 0, 0], scale: [4, 1, 1.8], roughness: 0.3, visible: true, locked: false, color: '#ef4444' },
      { id: 'c2', name: 'Car Top', shape: 'box', position: [0.3, 1.3, 0], rotation: [0, 0, 0], scale: [2, 0.8, 1.6], roughness: 0.3, visible: true, locked: false, color: '#dc2626' },
    ],
    wind: { azimuth: 0, elevation: 0, speed: 15, turbulenceIntensity: 3, profile: 'uniform' },
  },
  {
    name: 'Cylinder Array',
    description: 'Multiple cylinders for Karman vortex street observation',
    objects: [
      { id: 'cy1', name: 'Cylinder 1', shape: 'cylinder', position: [-4, 1, 0], rotation: [0, 0, 0], scale: [1, 2, 1], roughness: 0.5, visible: true, locked: false, color: '#f59e0b' },
      { id: 'cy2', name: 'Cylinder 2', shape: 'cylinder', position: [-4, 1, 4], rotation: [0, 0, 0], scale: [1, 2, 1], roughness: 0.5, visible: true, locked: false, color: '#f59e0b' },
      { id: 'cy3', name: 'Cylinder 3', shape: 'cylinder', position: [-4, 1, -4], rotation: [0, 0, 0], scale: [1, 2, 1], roughness: 0.5, visible: true, locked: false, color: '#f59e0b' },
    ],
    wind: { azimuth: 0, elevation: 0, speed: 8, turbulenceIntensity: 2, profile: 'uniform' },
  },
  {
    name: 'Wing Section',
    description: 'Simplified wing shape (box approximation) for lift/drag analysis',
    objects: [
      { id: 'w1', name: 'Wing', shape: 'box', position: [0, 1, 0], rotation: [0, 0, -0.1], scale: [3, 0.3, 8], roughness: 0.2, visible: true, locked: false, color: '#38bdf8' },
    ],
    wind: { azimuth: 0, elevation: 0, speed: 20, turbulenceIntensity: 1, profile: 'uniform' },
  },
  {
    name: 'Empty Field',
    description: 'Clean state with no objects',
    objects: [],
    wind: { azimuth: 0, elevation: 0, speed: 10, turbulenceIntensity: 5, profile: 'uniform' },
  },
];

export function PresetPanel() {
  const setObjects = useObjectStore((s) => s.setObjects);
  const setWind = useSimulatorStore((s) => s.setWind);

  const loadPreset = (preset: PresetScene) => {
    setObjects(JSON.parse(JSON.stringify(preset.objects)));
    setWind(preset.wind);
  };

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Presets
      </div>
      {presets.map((preset) => (
        <button
          key={preset.name}
          onClick={() => loadPreset(preset)}
          className="w-full text-left px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-md transition-colors group"
        >
          <div className="text-xs font-medium text-slate-200 group-hover:text-sky-400 transition-colors">
            {preset.name}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{preset.description}</div>
        </button>
      ))}
    </div>
  );
}
