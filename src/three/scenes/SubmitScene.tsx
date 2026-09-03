import React from 'react';
import { SuggestionBox } from '../objects/SuggestionBox';
import { FloatingCard } from '../objects/FloatingCard';
import { ParticleField } from '../effects/ParticleField';

export const SubmitScene: React.FC = () => {
  return (
    <group>
      {/* Positioned slightly offset to frame the glass submission form panel cleanly */}
      <SuggestionBox position={[2.8, 0.2, -1.2]} scale={1.05} active={true} pulseGlow={true} />

      {/* Floating Civic Documents hovering near intake */}
      <FloatingCard
        position={[-3.2, 1.2, -1.5]}
        rotation={[0.3, 0.5, -0.2]}
        scale={0.9}
        speed={0.8}
        offset={1}
      />
      <FloatingCard
        position={[1.8, 1.8, -0.5]}
        rotation={[-0.2, -0.4, 0.2]}
        scale={0.7}
        speed={1.2}
        offset={3}
      />
      <FloatingCard
        position={[-2.5, -1.6, -0.8]}
        rotation={[0.15, 0.3, 0.1]}
        scale={0.75}
        speed={0.9}
        offset={2.5}
      />

      <ParticleField count={110} radius={14} speed={0.08} />
    </group>
  );
};
