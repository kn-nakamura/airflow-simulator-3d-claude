import { useObjectStore } from '../../store/objectStore';
import type { ShapeType } from '../../types';

const shapes: { type: ShapeType; label: string; icon: string }[] = [
  { type: 'box', label: 'Box', icon: '▮' },
  { type: 'sphere', label: 'Sphere', icon: '●' },
  { type: 'cylinder', label: 'Cylinder', icon: '⬭' },
  { type: 'cone', label: 'Cone', icon: '▲' },
  { type: 'torus', label: 'Torus', icon: '◎' },
];

function NumberInput({
  label,
  value,
  onChange,
  step = 0.1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <label className="flex items-center gap-1 text-xs">
      <span className="w-4 text-slate-500">{label}</span>
      <input
        type="number"
        value={value.toFixed(2)}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="flex-1 bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-xs text-slate-200 w-16"
      />
    </label>
  );
}

export function ObjectPanel() {
  const {
    objects,
    selectedId,
    addObject,
    removeObject,
    updateObject,
    selectObject,
    duplicateObject,
    transformMode,
    setTransformMode,
  } = useObjectStore();

  const selected = objects.find((o) => o.id === selectedId);

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Add Shape
      </div>
      <div className="flex flex-wrap gap-1">
        {shapes.map((s) => (
          <button
            key={s.type}
            onClick={() => addObject(s.type)}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300 transition-colors"
            title={s.label}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-3">
        Transform
      </div>
      <div className="flex gap-1">
        {(['translate', 'rotate', 'scale'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setTransformMode(m)}
            className={`px-2 py-1 rounded text-xs border transition-colors ${
              transformMode === m
                ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {m === 'translate' ? 'W Move' : m === 'rotate' ? 'E Rotate' : 'R Scale'}
          </button>
        ))}
      </div>

      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-3">
        Objects
      </div>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {objects.length === 0 && (
          <div className="text-xs text-slate-600 italic">No objects</div>
        )}
        {objects.map((obj) => (
          <div
            key={obj.id}
            onClick={() => selectObject(obj.id)}
            className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer text-xs transition-colors ${
              selectedId === obj.id
                ? 'bg-sky-500/20 border border-sky-500/50 text-sky-300'
                : 'bg-slate-800/50 border border-transparent text-slate-400 hover:bg-slate-700'
            }`}
          >
            <span className="truncate">{obj.name}</span>
            <div className="flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateObject(obj.id, { visible: !obj.visible });
                }}
                className={`text-xs ${obj.visible ? 'text-slate-400' : 'text-slate-600'}`}
                title="Toggle visibility"
              >
                {obj.visible ? '👁' : '—'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateObject(obj.id, { locked: !obj.locked });
                }}
                className={`text-xs ${obj.locked ? 'text-amber-400' : 'text-slate-600'}`}
                title="Toggle lock"
              >
                {obj.locked ? '🔒' : '🔓'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="space-y-2 border-t border-slate-700 pt-2">
          <div className="text-xs font-semibold text-slate-400">
            {selected.name}
          </div>

          <div className="text-xs text-slate-500">Position</div>
          <div className="grid grid-cols-3 gap-1">
            <NumberInput label="X" value={selected.position[0]} onChange={(v) => updateObject(selected.id, { position: [v, selected.position[1], selected.position[2]] })} />
            <NumberInput label="Y" value={selected.position[1]} onChange={(v) => updateObject(selected.id, { position: [selected.position[0], v, selected.position[2]] })} />
            <NumberInput label="Z" value={selected.position[2]} onChange={(v) => updateObject(selected.id, { position: [selected.position[0], selected.position[1], v] })} />
          </div>

          <div className="text-xs text-slate-500">Scale</div>
          <div className="grid grid-cols-3 gap-1">
            <NumberInput label="X" value={selected.scale[0]} onChange={(v) => updateObject(selected.id, { scale: [v, selected.scale[1], selected.scale[2]] })} />
            <NumberInput label="Y" value={selected.scale[1]} onChange={(v) => updateObject(selected.id, { scale: [selected.scale[0], v, selected.scale[2]] })} />
            <NumberInput label="Z" value={selected.scale[2]} onChange={(v) => updateObject(selected.id, { scale: [selected.scale[0], selected.scale[1], v] })} />
          </div>

          <div className="text-xs text-slate-500">Roughness</div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={selected.roughness}
            onChange={(e) => updateObject(selected.id, { roughness: parseFloat(e.target.value) })}
            className="w-full h-1 accent-sky-500"
          />
          <div className="text-xs text-slate-600 text-right">{selected.roughness.toFixed(2)}</div>

          <div className="flex gap-1">
            <button
              onClick={() => duplicateObject(selected.id)}
              className="flex-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300"
            >
              Duplicate
            </button>
            <button
              onClick={() => removeObject(selected.id)}
              className="flex-1 px-2 py-1 bg-red-900/30 hover:bg-red-900/50 border border-red-800/50 rounded text-xs text-red-400"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
