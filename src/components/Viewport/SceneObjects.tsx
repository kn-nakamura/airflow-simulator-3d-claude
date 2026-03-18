import { useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { TransformControls } from '@react-three/drei';
import { useObjectStore } from '../../store/objectStore';
import { useObjectSelection } from '../../hooks/useObjectSelection';
import type { SceneObject, ShapeType } from '../../types';

function ShapeGeometry({ shape }: { shape: ShapeType }) {
  switch (shape) {
    case 'box':
      return <boxGeometry args={[1, 1, 1]} />;
    case 'sphere':
      return <sphereGeometry args={[0.5, 32, 32]} />;
    case 'cylinder':
      return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
    case 'cone':
      return <coneGeometry args={[0.5, 1, 32]} />;
    case 'torus':
      return <torusGeometry args={[0.5, 0.2, 16, 32]} />;
  }
}

function SceneObjectMesh({ obj }: { obj: SceneObject }) {
  // Use callback ref so TransformControls re-renders when mesh mounts
  const [mesh, setMesh] = useState<THREE.Mesh | null>(null);
  const draggingRef = useRef(false);
  const { handleClick } = useObjectSelection();
  const selectedId = useObjectStore((s) => s.selectedId);
  const transformMode = useObjectStore((s) => s.transformMode);
  const updateObject = useObjectStore((s) => s.updateObject);
  const pushUndo = useObjectStore((s) => s.pushUndo);
  const isSelected = selectedId === obj.id;

  // Sync mesh position from store when NOT dragging (to handle undo/redo/input changes)
  useEffect(() => {
    if (!mesh || draggingRef.current) return;
    mesh.position.set(...obj.position);
    mesh.rotation.set(...obj.rotation);
    mesh.scale.set(...obj.scale);
  }, [mesh, obj.position, obj.rotation, obj.scale]);

  const handleChange = useCallback(() => {
    if (!mesh || !draggingRef.current) return;
    updateObject(obj.id, {
      position: [mesh.position.x, mesh.position.y, mesh.position.z],
      rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z],
      scale: [mesh.scale.x, mesh.scale.y, mesh.scale.z],
    });
  }, [mesh, obj.id, updateObject]);

  const handleMouseDown = useCallback(() => {
    draggingRef.current = true;
    pushUndo();
  }, [pushUndo]);

  const handleMouseUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  if (!obj.visible) return null;

  return (
    <>
      <mesh
        ref={setMesh}
        onClick={(e) => handleClick(obj.id, e)}
      >
        <ShapeGeometry shape={obj.shape} />
        <meshStandardMaterial
          color={obj.color}
          roughness={obj.roughness}
          metalness={0.1}
          transparent
          opacity={0.85}
        />
        {isSelected && (
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(1.05, 1.05, 1.05)]} />
            <lineBasicMaterial color="#38bdf8" linewidth={2} />
          </lineSegments>
        )}
      </mesh>
      {isSelected && !obj.locked && mesh && (
        <TransformControls
          object={mesh}
          mode={transformMode}
          size={0.7}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onChange={handleChange}
        />
      )}
    </>
  );
}

export function SceneObjects() {
  const objects = useObjectStore((s) => s.objects);
  const { handleMiss } = useObjectSelection();

  return (
    <group onPointerMissed={handleMiss}>
      {objects.map((obj) => (
        <SceneObjectMesh key={obj.id} obj={obj} />
      ))}
    </group>
  );
}
