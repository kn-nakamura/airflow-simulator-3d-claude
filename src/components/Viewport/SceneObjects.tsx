import { useRef, useEffect } from 'react';
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
  const meshRef = useRef<THREE.Mesh>(null);
  const { handleClick } = useObjectSelection();
  const selectedId = useObjectStore((s) => s.selectedId);
  const isSelected = selectedId === obj.id;

  if (!obj.visible) return null;

  return (
    <mesh
      ref={meshRef}
      position={obj.position}
      rotation={obj.rotation}
      scale={obj.scale}
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
  );
}

function SelectedTransformControls() {
  const selectedId = useObjectStore((s) => s.selectedId);
  const objects = useObjectStore((s) => s.objects);
  const transformMode = useObjectStore((s) => s.transformMode);
  const updateObject = useObjectStore((s) => s.updateObject);
  const pushUndo = useObjectStore((s) => s.pushUndo);
  const controlsRef = useRef<any>(null);

  const selected = objects.find((o) => o.id === selectedId);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    let dragging = false;
    const onStart = () => {
      dragging = true;
      pushUndo();
    };
    const onChange = () => {
      if (!dragging || !selected) return;
      const obj = controls.object;
      if (!obj) return;
      updateObject(selected.id, {
        position: [obj.position.x, obj.position.y, obj.position.z],
        rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
        scale: [obj.scale.x, obj.scale.y, obj.scale.z],
      });
    };
    const onEnd = () => {
      dragging = false;
    };

    controls.addEventListener('mouseDown', onStart);
    controls.addEventListener('change', onChange);
    controls.addEventListener('mouseUp', onEnd);
    return () => {
      controls.removeEventListener('mouseDown', onStart);
      controls.removeEventListener('change', onChange);
      controls.removeEventListener('mouseUp', onEnd);
    };
  }, [selected, updateObject, pushUndo]);

  if (!selected || selected.locked) return null;

  return (
    <TransformControls
      ref={controlsRef}
      mode={transformMode}
      position={selected.position}
      rotation={selected.rotation}
      scale={selected.scale}
      size={0.7}
    />
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
      <SelectedTransformControls />
    </group>
  );
}
