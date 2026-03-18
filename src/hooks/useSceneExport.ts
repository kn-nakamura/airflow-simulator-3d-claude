import { useCallback } from 'react';
import { useObjectStore } from '../store/objectStore';
import { useSimulatorStore } from '../store/simulatorStore';
import { serializeScene, deserializeScene, encodeSceneToURL, exportFieldToCSV } from '../utils/sceneSerializer';

export function useSceneExport() {
  const objects = useObjectStore((s) => s.objects);
  const setObjects = useObjectStore((s) => s.setObjects);
  const { wind, visualization, simulation, fieldData, setWind, setVisualization, setSimulation } =
    useSimulatorStore();

  const saveScene = useCallback(() => {
    const json = serializeScene(objects, wind, visualization, simulation);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'airflow-scene.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [objects, wind, visualization, simulation]);

  const loadScene = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = deserializeScene(e.target?.result as string);
          setObjects(data.objects);
          setWind(data.wind);
          setVisualization(data.visualization);
          setSimulation(data.simulation);
        } catch (err) {
          console.error('Failed to load scene:', err);
        }
      };
      reader.readAsText(file);
    },
    [setObjects, setWind, setVisualization, setSimulation],
  );

  const shareURL = useCallback(() => {
    const url = encodeSceneToURL({ objects, wind, visualization, simulation });
    navigator.clipboard.writeText(url).catch(() => {});
    return url;
  }, [objects, wind, visualization, simulation]);

  const exportCSV = useCallback(
    (type: 'velocity' | 'pressure') => {
      if (!fieldData) return;
      let csv: string;
      if (type === 'velocity') {
        const speeds = new Float32Array(fieldData.u.length);
        for (let i = 0; i < speeds.length; i++) {
          speeds[i] = Math.sqrt(
            fieldData.u[i] * fieldData.u[i] + fieldData.v[i] * fieldData.v[i],
          );
        }
        csv = exportFieldToCSV(speeds, fieldData.gridSize, 'speed_ms');
      } else {
        csv = exportFieldToCSV(fieldData.pressure, fieldData.gridSize, 'pressure');
      }
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-field.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [fieldData],
  );

  const takeScreenshot = useCallback(async () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'airflow-screenshot.png';
    a.click();
  }, []);

  return { saveScene, loadScene, shareURL, exportCSV, takeScreenshot };
}
