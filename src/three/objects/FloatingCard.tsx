import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FloatingCardProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  color?: string;
  speed?: number;
  offset?: number;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  position,
  rotation = [0, 0, 0],
  scale = 1,
  color = '#E7C226',
  speed = 1,
  offset = 0,
}) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * speed + offset;
    meshRef.current.position.y = position[1] + Math.sin(t * 1.2) * 0.15;
    meshRef.current.rotation.x = rotation[0] + Math.sin(t * 0.9) * 0.08;
    meshRef.current.rotation.y = rotation[1] + Math.cos(t * 0.8) * 0.1;
    meshRef.current.rotation.z = rotation[2] + Math.sin(t * 0.7) * 0.05;
  });

  return (
    <group ref={meshRef} position={position} rotation={rotation} scale={scale}>
      {/* Document Card Base */}
      <mesh castShadow>
        <boxGeometry args={[0.9, 1.2, 0.02]} />
        <meshStandardMaterial
          color="#161622"
          metalness={0.4}
          roughness={0.3}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Golden Document Border */}
      <mesh>
        <boxGeometry args={[0.92, 1.22, 0.024]} />
        <meshStandardMaterial
          color={color}
          wireframe
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Simulated Document Text Ribbons (Emissive lines) */}
      <mesh position={[-0.1, 0.35, 0.015]}>
        <planeGeometry args={[0.55, 0.05]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0.15, 0.015]}>
        <planeGeometry args={[0.7, 0.03]} />
        <meshBasicMaterial color="#CC9E33" transparent opacity={0.45} />
      </mesh>
      <mesh position={[0, 0.02, 0.015]}>
        <planeGeometry args={[0.7, 0.03]} />
        <meshBasicMaterial color="#CC9E33" transparent opacity={0.35} />
      </mesh>
      <mesh position={[-0.15, -0.11, 0.015]}>
        <planeGeometry args={[0.4, 0.03]} />
        <meshBasicMaterial color="#CC9E33" transparent opacity={0.3} />
      </mesh>
    </group>
  );
};
