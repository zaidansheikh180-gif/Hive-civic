import React from 'react';
import { SuggestionBox } from '../objects/SuggestionBox';
import { FloatingCard } from '../objects/FloatingCard';
import { CivicNetwork } from '../objects/CivicNetwork';
import { ParticleField } from '../effects/ParticleField';

export const HomeScene: React.FC = () => {
  return (
    <group>
      {/* 1. Large Central Civic Suggestion Box Monolith */}
      <SuggestionBox position={[0, 0, 0]} scale={1.1} />

      {/* 2. Floating Civic Document Cards drifting around */}
      <FloatingCard
        position={[-2.8, 1.4, -0.8]}
        rotation={[0.2, 0.4, -0.1]}
        scale={0.9}
        speed={0.9}
        offset={0}
      />
      <FloatingCard
        position={[2.6, 0.8, -0.5]}
        rotation={[-0.1, -0.5, 0.15]}
        scale={0.85}
        speed={1.1}
        offset={2}
      />
      <FloatingCard
        position={[-1.9, -1.5, 0.5]}
        rotation={[0.3, 0.2, -0.2]}
        scale={0.75}
        speed={0.8}
        offset={4}
      />
      <FloatingCard
        position={[2.2, -1.3, 0.8]}
        rotation={[-0.2, -0.3, 0.1]}
        scale={0.8}
        speed={1.0}
        offset={1.5}
      />

      {/* 3. Subtle Civic Network Nodes in the background */}
      <CivicNetwork nodeCount={16} radius={6.5} color="#E7C226" />

      {/* 4. Honey-Gold Particle Atmosphere */}
      <ParticleField count={130} radius={16} speed={0.06} />
    </group>
  );
};
