import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DataSphereProps {
  radius?: number;
  position?: [number, number, number];
  color?: string;
}

export const DataSphere: React.FC<DataSphereProps> = ({
  radius = 1.4,
  position = [2.5, 0, -1],
  color = '#E7C226',
}) => {
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (outerRef.current) {
      outerRef.current.rotation.y += delta * 0.2;
      outerRef.current.rotation.x += delta * 0.1;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 0.25;
      innerRef.current.rotation.z += delta * 0.15;
    }
  });

  return (
    <group position={position}>
      {/* Outer Geodesic Wireframe */}
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[radius, 1]} />
        <meshStandardMaterial
          color={color}
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Inner Concentric Lattice */}
      <mesh ref={innerRef}>
        <octahedronGeometry args={[radius * 0.65, 0]} />
        <meshStandardMaterial
          color="#CC9E33"
          wireframe
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Core Glowing Orb */}
      <mesh>
        <sphereGeometry args={[radius * 0.2, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
        />
      </mesh>

      <pointLight color={color} intensity={1.8} distance={5} />
    </group>
  );
};
