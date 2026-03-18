import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSimulatorStore } from '../../store/simulatorStore';

export function VelocityChart() {
  const profile = useSimulatorStore((s) => s.analytics.velocityProfile);

  const data = profile.filter((_, i) => i % 4 === 0);

  return (
    <div style={{ width: '100%', height: 140 }}>
      <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>
        Velocity Profile (mid-section) [m/s]
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="x"
            tick={{ fontSize: 9, fill: '#64748b' }}
            stroke="#1e293b"
            tickFormatter={(v: number) => v.toFixed(0)}
          />
          <YAxis
            tick={{ fontSize: 9, fill: '#64748b' }}
            stroke="#1e293b"
            width={30}
          />
          <Tooltip
            contentStyle={{
              background: '#161e2e',
              border: '1px solid #1e293b',
              borderRadius: '4px',
              fontSize: '10px',
            }}
          />
          <Line
            type="monotone"
            dataKey="v"
            stroke="#38bdf8"
            dot={false}
            strokeWidth={1.5}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
