import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SuggestionBoxProps {
  position?: [number, number, number];
  scale?: number;
  active?: boolean;
  pulseGlow?: boolean;
}

export const SuggestionBox: React.FC<SuggestionBoxProps> = ({
  position = [0, 0, 0],
  scale = 1,
  active = false,
  pulseGlow = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const glowLightRef = useRef<THREE.PointLight>(null);
  const slotMeshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    // Gentle idle rotation
    groupRef.current.rotation.y += delta * 0.15;
    groupRef.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.12;

    if (glowLightRef.current) {
      const baseIntensity = active || pulseGlow ? 3.5 : 1.8;
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.6;
      glowLightRef.current.intensity = baseIntensity + (pulseGlow ? pulse : 0);
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* 1. Main Monolith Body: Deep matte charcoal */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.2, 2.8, 1.8]} />
        <meshStandardMaterial
          color="#14141B"
          metalness={0.85}
          roughness={0.25}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* 2. Beveled Gold Corner Trim Wireframe */}
      <mesh>
        <boxGeometry args={[2.24, 2.84, 1.84]} />
        <meshStandardMaterial
          color="#E7C226"
          wireframe
          transparent
          opacity={0.45}
        />
      </mesh>

      {/* 3. Honey-Gold Top Crown & Trim */}
      <mesh position={[0, 1.42, 0]}>
        <boxGeometry args={[2.3, 0.08, 1.9]} />
        <meshStandardMaterial
          color="#CC9E33"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* 4. Suggestion Intake Slot (Glowing aperture) */}
      <mesh ref={slotMeshRef} position={[0, 0.7, 0.92]}>
        <boxGeometry args={[1.3, 0.12, 0.06]} />
        <meshStandardMaterial
          color="#E7C226"
          emissive="#E7C226"
          emissiveIntensity={active ? 2.8 : 1.5}
        />
      </mesh>

      {/* 5. Glowing Hexagonal Civic Seal Badge */}
      <mesh position={[0, 0, 0.92]}>
        <cylinderGeometry args={[0.35, 0.35, 0.04, 6]} />
        <meshStandardMaterial
          color="#CC9E33"
          emissive="#A08511"
          emissiveIntensity={0.6}
          metalness={0.95}
          roughness={0.15}
        />
      </mesh>

      {/* Inner illuminated point light projecting through the intake slot */}
      <pointLight
        ref={glowLightRef}
        position={[0, 0.7, 1.2]}
        color="#E7C226"
        intensity={2.2}
        distance={4.5}
        decay={2}
      />
    </group>
  );
};
