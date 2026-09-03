import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CivicNetworkProps {
  nodeCount?: number;
  radius?: number;
  color?: string;
}

export const CivicNetwork: React.FC<CivicNetworkProps> = ({
  nodeCount = 14,
  radius = 5,
  color = '#E7C226',
}) => {
  const groupRef = useRef<THREE.Group>(null);

  const [nodes, linePositions] = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i < nodeCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = radius * (0.6 + 0.4 * Math.random());
      const sinPhi = Math.sin(phi);
      pts.push([
        r * sinPhi * Math.cos(theta),
        r * sinPhi * Math.sin(theta) * 0.6,
        r * Math.cos(phi),
      ]);
    }

    const lines: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dist = Math.hypot(
          pts[i][0] - pts[j][0],
          pts[i][1] - pts[j][1],
          pts[i][2] - pts[j][2]
        );
        if (dist < radius * 0.75) {
          lines.push(...pts[i], ...pts[j]);
        }
      }
    }

    return [pts, new Float32Array(lines)];
  }, [nodeCount, radius]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.04;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.05;
  });

  return (
    <group ref={groupRef}>
      {/* Network Connecting Lines */}
      {linePositions.length > 0 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={linePositions.length / 3}
              array={linePositions}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#CC9E33"
            transparent
            opacity={0.25}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
      )}

      {/* Network Nodes */}
      {nodes.map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
};
