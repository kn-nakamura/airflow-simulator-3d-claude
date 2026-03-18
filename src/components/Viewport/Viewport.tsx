import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { SceneObjects } from './SceneObjects';
import { WindArrow } from './WindArrow';
import { GridFloor } from './GridFloor';
import { FpsCounter } from './FpsCounter';
import { ParticleStream } from '../Visualizers/ParticleStream';
import { Streamlines } from '../Visualizers/Streamlines';
import { VelocityHeatmap } from '../Visualizers/VelocityHeatmap';
import { PressureHeatmap } from '../Visualizers/PressureHeatmap';
import { VectorField } from '../Visualizers/VectorField';
import { useSimulatorStore } from '../../store/simulatorStore';
import { useFluidSolver } from '../../hooks/useFluidSolver';
import { useAnimationLoop } from '../../hooks/useAnimationLoop';
import { CameraController, setCameraView } from './CameraController';

function SimControls() {
  const running = useSimulatorStore((s) => s.simulation.running);
  const setSimulation = useSimulatorStore((s) => s.setSimulation);
  const resetSimulation = useSimulatorStore((s) => s.resetSimulation);

  return (
    <div className="absolute top-10 right-3 md:top-3 flex gap-2 z-10">
      <button
        onClick={() => setSimulation({ running: !running })}
        className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors border ${
          running
            ? 'bg-amber-500/20 border-amber-500 text-amber-400 hover:bg-amber-500/30'
            : 'bg-emerald-500/20 border-emerald-500 text-emerald-400 hover:bg-emerald-500/30'
        }`}
      >
        {running ? '⏸' : '▶'}
      </button>
      <button
        onClick={resetSimulation}
        className="px-3 py-1.5 rounded text-sm font-semibold transition-colors border bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30"
        title="Stop & Reset"
      >
        ⏹
      </button>
    </div>
  );
}

function SolverRunner() {
  const { stepSolver } = useFluidSolver();
  const running = useSimulatorStore((s) => s.simulation.running);
  useAnimationLoop(stepSolver, running);
  return null;
}

export function Viewport() {
  const activeVis = useSimulatorStore((s) => s.visualization.activeVisualizations);

  return (
    <div className="flex-1 relative" style={{ minHeight: 0 }}>
      <Canvas
        camera={{ position: [15, 12, 15], fov: 50, near: 0.1, far: 200 }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        style={{ background: '#070b14' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 15, 10]} intensity={0.8} />
        <directionalLight position={[-5, 10, -5]} intensity={0.3} />

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.1}
          minDistance={3}
          maxDistance={80}
        />

        <GridFloor />
        <SceneObjects />
        <WindArrow />

        {activeVis.includes('particles') && <ParticleStream />}
        {activeVis.includes('streamlines') && <Streamlines />}
        {activeVis.includes('velocityHeatmap') && <VelocityHeatmap />}
        {activeVis.includes('pressureHeatmap') && <PressureHeatmap />}
        {activeVis.includes('vectorField') && <VectorField />}

        <FpsCounter />
        <SolverRunner />
        <CameraController />
      </Canvas>
      <SimControls />
      <div className="absolute bottom-3 left-3 flex gap-1">
        {(['reset', 'top', 'front', 'side'] as const).map((view) => (
          <button
            key={view}
            onClick={() => setCameraView(view)}
            className="px-2 py-1 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded text-xs text-slate-400 hover:text-sky-400 transition-colors capitalize"
          >
            {view === 'reset' ? 'Reset' : view}
          </button>
        ))}
      </div>
    </div>
  );
}
