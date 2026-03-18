import { Grid } from '@react-three/drei';

export function GridFloor() {
  return (
    <Grid
      args={[32, 32]}
      cellSize={1}
      cellThickness={0.5}
      cellColor="#1e293b"
      sectionSize={4}
      sectionThickness={1}
      sectionColor="#334155"
      fadeDistance={50}
      fadeStrength={1}
      position={[0, -0.01, 0]}
      infiniteGrid
    />
  );
}
