import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DataBars3DProps {
  position?: [number, number, number];
}

const BAR_HEIGHTS = [1.2, 2.4, 1.8, 2.9, 1.5, 3.2, 2.1];

export const DataBars3D: React.FC<DataBars3DProps> = ({ position = [-3, -1.2, -1] }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 0.7) * 0.08;
  });

  return (
    <group ref={groupRef} position={position}>
      {BAR_HEIGHTS.map((h, i) => (
        <group key={i} position={[(i - 3) * 0.55, h / 2, 0]}>
          {/* Solid Bar Body */}
          <mesh>
            <boxGeometry args={[0.3, h, 0.3]} />
            <meshStandardMaterial
              color="#1B1B26"
              metalness={0.7}
              roughness={0.3}
              transparent
              opacity={0.85}
            />
          </mesh>

          {/* Glowing Wireframe Border */}
          <mesh>
            <boxGeometry args={[0.32, h + 0.02, 0.32]} />
            <meshStandardMaterial
              color="#E7C226"
              wireframe
              transparent
              opacity={0.4}
            />
          </mesh>

          {/* Top Illuminating Cap */}
          <mesh position={[0, h / 2 + 0.02, 0]}>
            <boxGeometry args={[0.3, 0.04, 0.3]} />
            <meshStandardMaterial
              color="#E7C226"
              emissive="#E7C226"
              emissiveIntensity={1.2}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};
