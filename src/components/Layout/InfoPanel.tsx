import { useSimulatorStore } from '../../store/simulatorStore';
import { VelocityChart } from '../Charts/VelocityChart';
import { PressureChart } from '../Charts/PressureChart';
import { ExportPanel } from '../Panels/ExportPanel';

function StatRow({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-mono text-slate-200">
        {value.toFixed(2)} <span className="text-slate-500">{unit}</span>
      </span>
    </div>
  );
}

export function InfoPanel() {
  const analytics = useSimulatorStore((s) => s.analytics);

  return (
    <div
      className="flex flex-col h-full overflow-y-auto"
      style={{
        width: 260,
        background: '#0f1623',
        borderLeft: '1px solid #1e293b',
      }}
    >
      <div className="p-3 space-y-3">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Analytics
        </div>

        <div
          className="rounded-md p-2 space-y-0.5"
          style={{ background: '#161e2e', border: '1px solid #1e293b' }}
        >
          <StatRow label="Max Speed" value={analytics.maxSpeed} unit="m/s" />
          <StatRow label="Avg Speed" value={analytics.avgSpeed} unit="m/s" />
          <StatRow label="Max ΔP" value={analytics.maxPressureDiff} unit="Pa" />
          <StatRow label="Cd (drag)" value={analytics.dragCoeff} unit="" />
          <StatRow label="Cp (pressure)" value={analytics.pressureCoeff} unit="" />
          <StatRow label="Turbulence" value={analytics.turbulenceIntensity} unit="%" />
        </div>

        <div
          className="rounded-md p-2"
          style={{ background: '#161e2e', border: '1px solid #1e293b' }}
        >
          <VelocityChart />
        </div>

        <div
          className="rounded-md p-2"
          style={{ background: '#161e2e', border: '1px solid #1e293b' }}
        >
          <PressureChart />
        </div>

        <ExportPanel />
      </div>
    </div>
  );
}
