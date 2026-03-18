import { useState } from 'react';
import { ObjectPanel } from '../Panels/ObjectPanel';
import { WindPanel } from '../Panels/WindPanel';
import { VisualizationPanel } from '../Panels/VisualizationPanel';
import { SimulationPanel } from '../Panels/SimulationPanel';
import { PresetPanel } from '../Panels/PresetPanel';

const tabs = [
  { id: 'presets', label: 'Presets' },
  { id: 'objects', label: 'Objects' },
  { id: 'wind', label: 'Wind' },
  { id: 'visual', label: 'Visual' },
  { id: 'sim', label: 'Sim' },
];

export function Sidebar({ onClose }: { onClose?: () => void } = {}) {
  const [activeTab, setActiveTab] = useState('objects');

  return (
    <div
      className="flex flex-col h-full"
      style={{
        width: 280,
        background: '#0f1623',
        borderRight: '1px solid #1e293b',
      }}
    >
      <div className="flex border-b border-slate-700 items-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-1 py-2 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-sky-400 border-b-2 border-sky-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
        {onClose && (
          <button
            onClick={onClose}
            className="px-2 py-2 text-slate-500 hover:text-slate-300 text-sm"
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'presets' && <PresetPanel />}
        {activeTab === 'objects' && <ObjectPanel />}
        {activeTab === 'wind' && <WindPanel />}
        {activeTab === 'visual' && <VisualizationPanel />}
        {activeTab === 'sim' && <SimulationPanel />}
      </div>
    </div>
  );
}
