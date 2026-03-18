import { useMemo } from 'react';
import * as THREE from 'three';
import { useSimulatorStore } from '../../store/simulatorStore';

export function WindArrow() {
  const wind = useSimulatorStore((s) => s.wind);

  const { direction, rotation } = useMemo(() => {
    const az = (wind.azimuth * Math.PI) / 180;
    const el = (wind.elevation * Math.PI) / 180;
    const dir = new THREE.Vector3(
      -Math.sin(az) * Math.cos(el),
      Math.sin(el),
      -Math.cos(az) * Math.cos(el),
    );
    const rot = new THREE.Euler(0, 0, 0);
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 0, -1), dir);
    rot.setFromQuaternion(q);
    return { direction: dir, rotation: rot };
  }, [wind.azimuth, wind.elevation]);

  const arrowLength = Math.max(1, wind.speed / 5);

  return (
    <group position={[-14, 6, 0]}>
      <mesh rotation={rotation}>
        <cylinderGeometry args={[0.08, 0.08, arrowLength, 8]} />
        <meshStandardMaterial color="#38bdf8" />
      </mesh>
      <mesh
        position={direction.clone().multiplyScalar(arrowLength / 2)}
        rotation={rotation}
      >
        <coneGeometry args={[0.2, 0.5, 8]} />
        <meshStandardMaterial color="#38bdf8" />
      </mesh>
    </group>
  );
}
