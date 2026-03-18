import { useState } from 'react';

const shortcuts = [
  { key: 'W', desc: 'Move mode' },
  { key: 'E', desc: 'Rotate mode' },
  { key: 'R', desc: 'Scale mode' },
  { key: 'Del', desc: 'Delete object' },
  { key: 'Space', desc: 'Play / Pause' },
  { key: 'Ctrl+C', desc: 'Copy object' },
  { key: 'Ctrl+V', desc: 'Paste object' },
  { key: 'Ctrl+Z', desc: 'Undo' },
  { key: 'Ctrl+Y', desc: 'Redo' },
  { key: 'F', desc: 'Focus camera' },
];

export function ShortcutsOverlay() {
  const [show, setShow] = useState(false);

  return (
    <div className="fixed top-3 right-[272px] z-50">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="px-2 py-1 bg-slate-800/80 border border-slate-700 rounded text-xs text-slate-400 hover:text-sky-400 transition-colors"
      >
        ?
      </button>
      {show && (
        <div
          className="absolute top-8 right-0 w-48 p-3 rounded-lg shadow-xl"
          style={{ background: '#161e2e', border: '1px solid #1e293b' }}
        >
          <div className="text-xs font-semibold text-slate-400 mb-2">Keyboard Shortcuts</div>
          <div className="space-y-1">
            {shortcuts.map((s) => (
              <div key={s.key} className="flex justify-between text-xs">
                <kbd className="px-1 bg-slate-700 rounded text-sky-400 font-mono">{s.key}</kbd>
                <span className="text-slate-400">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
