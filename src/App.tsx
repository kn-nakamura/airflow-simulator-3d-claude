import { useEffect } from 'react';
import './index.css';
import { Layout } from './components/Layout/Layout';
import { useObjectStore } from './store/objectStore';
import { useSimulatorStore } from './store/simulatorStore';
import { setCameraView } from './components/Viewport/CameraController';

function KeyboardHandler() {
  const { selectedId, setTransformMode, removeObject, duplicateObject, undo, redo } =
    useObjectStore();
  const setSimulation = useSimulatorStore((s) => s.setSimulation);
  const simulation = useSimulatorStore((s) => s.simulation);
  const clipboardRef = useObjectStore((s) => s.objects.find((o) => o.id === selectedId));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      switch (e.key.toLowerCase()) {
        case 'w':
          if (!e.ctrlKey) setTransformMode('translate');
          break;
        case 'e':
          setTransformMode('rotate');
          break;
        case 'r':
          if (!e.ctrlKey) setTransformMode('scale');
          break;
        case 'delete':
        case 'backspace':
          if (selectedId) removeObject(selectedId);
          break;
        case ' ':
          e.preventDefault();
          setSimulation({ running: !simulation.running });
          break;
        case 'f':
          setCameraView('reset');
          break;
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            undo();
          }
          break;
        case 'y':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            redo();
          }
          break;
        case 'c':
          if ((e.ctrlKey || e.metaKey) && selectedId) {
            window.__clipboard = selectedId;
          }
          break;
        case 'v':
          if ((e.ctrlKey || e.metaKey) && window.__clipboard) {
            duplicateObject(window.__clipboard);
          }
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedId, simulation.running, setTransformMode, removeObject, setSimulation, undo, redo, duplicateObject]);

  return null;
}

declare global {
  interface Window {
    __clipboard?: string;
  }
}

export default function App() {
  return (
    <>
      <KeyboardHandler />
      <Layout />
    </>
  );
}
