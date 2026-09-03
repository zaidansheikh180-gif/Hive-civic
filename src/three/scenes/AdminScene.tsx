import React from 'react';
import { DataSphere } from '../objects/DataSphere';
import { DataBars3D } from '../objects/DataBars3D';
import { CivicNetwork } from '../objects/CivicNetwork';
import { ParticleField } from '../effects/ParticleField';

export const AdminScene: React.FC = () => {
  return (
    <group>
      {/* 3D Data Analytics Sphere */}
      <DataSphere position={[3.2, 0.4, -1.5]} radius={1.5} color="#E7C226" />

      {/* 3D Statistical Data Pillars */}
      <DataBars3D position={[-3.4, -1.0, -1.8]} />

      {/* Background Civic Governance Graph */}
      <CivicNetwork nodeCount={14} radius={6.5} color="#CC9E33" />

      {/* Atmospheric Particles */}
      <ParticleField count={90} radius={16} speed={0.04} />
    </group>
  );
};
