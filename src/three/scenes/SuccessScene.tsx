import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SuggestionBox } from '../objects/SuggestionBox';
import { ParticleField } from '../effects/ParticleField';

export const SuccessScene: React.FC = () => {
  const capsuleRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (capsuleRef.current) {
      capsuleRef.current.position.y =
        1.6 + Math.sin(state.clock.elapsedTime * 1.5) * 0.12;
      capsuleRef.current.rotation.y += delta * 0.8;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.4;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      ringRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group>
      {/* 1. Base Activated Suggestion Box */}
      <SuggestionBox position={[0, -1.2, 0]} scale={0.9} active={true} pulseGlow={true} />

      {/* 2. Glowing Golden Submission Capsule / Seal Emerging */}
      <group ref={capsuleRef} position={[0, 1.6, 0]}>
        {/* Cylindrical Gold Seal Capsule */}
        <mesh>
          <cylinderGeometry args={[0.32, 0.32, 0.9, 24]} />
          <meshStandardMaterial
            color="#E7C226"
            metalness={0.9}
            roughness={0.15}
            emissive="#A08511"
            emissiveIntensity={0.6}
          />
        </mesh>

        {/* Illuminated Core Band */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.34, 0.34, 0.22, 24]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive="#E7C226"
            emissiveIntensity={2.5}
          />
        </mesh>

        {/* Orbiting Golden Ring */}
        <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[0.6, 0.02, 16, 48]} />
          <meshBasicMaterial color="#E7C226" />
        </mesh>

        {/* Brilliant Radiance Point Light */}
        <pointLight color="#E7C226" intensity={4} distance={4} />
      </group>

      <ParticleField count={150} radius={12} speed={0.1} />
    </group>
  );
};
