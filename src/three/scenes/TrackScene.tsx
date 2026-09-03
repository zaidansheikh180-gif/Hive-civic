import React from 'react';
import { StatusTimeline3D } from '../objects/StatusTimeline3D';
import { ParticleField } from '../effects/ParticleField';
import { CivicNetwork } from '../objects/CivicNetwork';
import { SuggestionStatus } from '../../types';

interface TrackSceneProps {
  currentStatus?: SuggestionStatus;
}

export const TrackScene: React.FC<TrackSceneProps> = ({ currentStatus = 'under_review' }) => {
  return (
    <group position={[0, 0.4, 0]}>
      {/* 3D Spatial Status Timeline Journey Nodes */}
      <StatusTimeline3D currentStatus={currentStatus} />

      {/* Subtle Civic Network Background Nodes */}
      <CivicNetwork nodeCount={12} radius={7.5} color="#A08511" />

      {/* Ambient Particle Field */}
      <ParticleField count={100} radius={15} speed={0.04} />
    </group>
  );
};
