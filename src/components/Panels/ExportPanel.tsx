import { useRef } from 'react';
import { useSceneExport } from '../../hooks/useSceneExport';

export function ExportPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { saveScene, loadScene, shareURL, exportCSV, takeScreenshot } = useSceneExport();

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Scene
      </div>
      <div className="flex gap-1">
        <button
          onClick={saveScene}
          className="flex-1 px-2 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300 transition-colors"
        >
          Save JSON
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 px-2 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300 transition-colors"
        >
          Load JSON
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) loadScene(file);
          e.target.value = '';
        }}
      />

      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-3">
        Export
      </div>
      <button
        onClick={takeScreenshot}
        className="w-full px-2 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300 transition-colors"
      >
        Screenshot (PNG)
      </button>
      <div className="flex gap-1">
        <button
          onClick={() => exportCSV('velocity')}
          className="flex-1 px-2 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300 transition-colors"
        >
          Velocity CSV
        </button>
        <button
          onClick={() => exportCSV('pressure')}
          className="flex-1 px-2 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300 transition-colors"
        >
          Pressure CSV
        </button>
      </div>

      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-3">
        Share
      </div>
      <button
        onClick={() => {
          const url = shareURL();
          alert('URL copied to clipboard!');
        }}
        className="w-full px-2 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/50 rounded text-xs text-sky-400 transition-colors"
      >
        Copy Share URL
      </button>
    </div>
  );
}
