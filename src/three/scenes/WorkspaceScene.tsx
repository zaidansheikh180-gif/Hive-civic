import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ParticleField } from '../effects/ParticleField';
import { CivicNetwork } from '../objects/CivicNetwork';

export const WorkspaceScene: React.FC = () => {
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!ringsRef.current) return;
    ringsRef.current.rotation.z += delta * 0.15;
    ringsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.2;
  });

  return (
    <group>
      {/* Investigation Dossier Target Ring in background */}
      <group ref={ringsRef} position={[2.6, 0.2, -1.8]}>
        <mesh>
          <ringGeometry args={[1.6, 1.64, 48]} />
          <meshBasicMaterial color="#E7C226" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <ringGeometry args={[1.3, 1.33, 48]} />
          <meshBasicMaterial color="#CC9E33" transparent opacity={0.25} side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <ringGeometry args={[0.9, 0.93, 32]} />
          <meshBasicMaterial color="#A08511" transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>
      </group>

      <CivicNetwork nodeCount={10} radius={6} color="#A08511" />
      <ParticleField count={80} radius={14} speed={0.04} />
    </group>
  );
};
