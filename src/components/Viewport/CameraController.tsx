import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

// Global camera ref for external control
let cameraRef: THREE.Camera | null = null;
let controlsRef: any = null;

export function getCameraRef() {
  return { camera: cameraRef, controls: controlsRef };
}

export function setCameraView(view: 'reset' | 'top' | 'front' | 'side') {
  const { camera, controls } = getCameraRef();
  if (!camera || !controls) return;

  switch (view) {
    case 'reset':
      camera.position.set(15, 12, 15);
      break;
    case 'top':
      camera.position.set(0, 25, 0.01);
      break;
    case 'front':
      camera.position.set(0, 5, 20);
      break;
    case 'side':
      camera.position.set(20, 5, 0);
      break;
  }
  controls.target.set(0, 0, 0);
  controls.update();
}

export function CameraController() {
  const { camera } = useThree();
  const controls = useThree((s) => s.controls);

  useEffect(() => {
    cameraRef = camera;
    controlsRef = controls;
  }, [camera, controls]);

  return null;
}
