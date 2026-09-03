import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SuggestionStatus } from '../../types';

interface StatusTimeline3DProps {
  currentStatus: SuggestionStatus;
}

const STAGES: { key: SuggestionStatus; label: string; x: number; y: number }[] = [
  { key: 'submitted', label: 'SUBMITTED', x: -3.6, y: 1.0 },
  { key: 'under_review', label: 'UNDER REVIEW', x: -1.8, y: 0.5 },
  { key: 'accepted', label: 'ACCEPTED', x: 0.0, y: 0.0 },
  { key: 'planned', label: 'PLANNED', x: 1.8, y: -0.5 },
  { key: 'implemented', label: 'IMPLEMENTED', x: 3.6, y: -1.0 },
];

const STAGE_ORDER: SuggestionStatus[] = [
  'submitted',
  'under_review',
  'accepted',
  'planned',
  'implemented',
];

export const StatusTimeline3D: React.FC<StatusTimeline3DProps> = ({ currentStatus }) => {
  const groupRef = useRef<THREE.Group>(null);
  const activeNodeRef = useRef<THREE.PointLight>(null);

  const isRejected = currentStatus === 'rejected';
  const currentIndex = isRejected
    ? 1 // Rejected branches from under_review
    : STAGE_ORDER.indexOf(currentStatus);

  useFrame((state) => {
    if (!groupRef.current) return;
    // Gentle floating sway
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.04;

    if (activeNodeRef.current) {
      activeNodeRef.current.intensity =
        2.5 + Math.sin(state.clock.elapsedTime * 4) * 0.8;
    }
  });

  const rejectedBranchPoints = useMemo(
    () => new Float32Array([0, 1.7, 0, 0, 0, 0]),
    []
  );

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 1. Main Connecting Conduit Line segments */}
      {STAGES.map((stage, idx) => {
        if (idx === STAGES.length - 1) return null;
        const nextStage = STAGES[idx + 1];
        const isCompletedStep = !isRejected && currentIndex > idx;
        const isActiveStep = !isRejected && currentIndex === idx;

        const lineArray = new Float32Array([
          stage.x,
          stage.y,
          0,
          nextStage.x,
          nextStage.y,
          0,
        ]);

        return (
          <line key={`conduit-${idx}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={lineArray}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial
              color={
                isCompletedStep
                  ? '#10B981'
                  : isActiveStep
                  ? '#E7C226'
                  : '#333340'
              }
              transparent
              opacity={isCompletedStep || isActiveStep ? 0.9 : 0.4}
            />
          </line>
        );
      })}

      {/* 2. Normal Timeline Stage Nodes */}
      {STAGES.map((stage, idx) => {
        const isCurrent = !isRejected && stage.key === currentStatus;
        const isPassed = !isRejected && currentIndex > idx;
        const color = isCurrent ? '#E7C226' : isPassed ? '#10B981' : '#3A3A4A';

        return (
          <group key={stage.key} position={[stage.x, stage.y, 0]}>
            {/* Outer Halo Ring */}
            <mesh>
              <ringGeometry args={[0.22, 0.28, 24]} />
              <meshBasicMaterial
                color={color}
                side={THREE.DoubleSide}
                transparent
                opacity={isCurrent ? 0.9 : isPassed ? 0.6 : 0.2}
              />
            </mesh>

            {/* Core Node Sphere */}
            <mesh>
              <sphereGeometry args={[isCurrent ? 0.16 : 0.11, 16, 16]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={isCurrent ? 1.8 : isPassed ? 0.8 : 0.1}
                roughness={0.2}
              />
            </mesh>

            {/* Active Stage Beacon Light */}
            {isCurrent && (
              <pointLight
                ref={activeNodeRef}
                color="#E7C226"
                intensity={3}
                distance={3}
              />
            )}
          </group>
        );
      })}

      {/* 3. Alternate Terminal Branch for REJECTED status */}
      {isRejected && (
        <group position={[-1.8, -1.2, 0]}>
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={rejectedBranchPoints}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#EF4444" transparent opacity={0.9} />
          </line>

          {/* Rejected Node */}
          <mesh>
            <ringGeometry args={[0.24, 0.32, 24]} />
            <meshBasicMaterial
              color="#EF4444"
              side={THREE.DoubleSide}
              transparent
              opacity={0.8}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshStandardMaterial
              color="#EF4444"
              emissive="#EF4444"
              emissiveIntensity={1.8}
            />
          </mesh>
          <pointLight color="#EF4444" intensity={2.5} distance={3} />
        </group>
      )}
    </group>
  );
};
