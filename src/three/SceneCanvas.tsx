import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraRig } from './cameras/CameraRig';
import { HomeScene } from './scenes/HomeScene';
import { SubmitScene } from './scenes/SubmitScene';
import { SuccessScene } from './scenes/SuccessScene';
import { TrackScene } from './scenes/TrackScene';
import { AdminScene } from './scenes/AdminScene';
import { WorkspaceScene } from './scenes/WorkspaceScene';
import { SceneType, SuggestionStatus } from '../types';

interface SceneCanvasProps {
  sceneType: SceneType;
  currentStatus?: SuggestionStatus;
}

// Simple WebGL availability detector
function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export const SceneCanvas: React.FC<SceneCanvasProps> = ({ sceneType, currentStatus }) => {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasWebGL(isWebGLAvailable());
  }, []);

  if (!hasWebGL || hasError) {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Graceful 2D Fallback with Ambient Lighting */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0F] via-[#12121A] to-[#0B0B0F]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(231,194,38,0.08)_0%,transparent_70%)]" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={() => {
          // Canvas initialized
        }}
        onError={() => setHasError(true)}
      >
        <ambientLight intensity={0.7} />
        {/* Honey Gold Key Light */}
        <directionalLight position={[4, 5, 4]} intensity={1.4} color="#FFF5D1" />
        {/* Amber Rim Light */}
        <directionalLight position={[-4, -3, -2]} intensity={0.8} color="#CC9E33" />
        {/* Soft Point Light */}
        <pointLight position={[0, 2, 3]} intensity={1.2} color="#E7C226" distance={8} />

        <CameraRig sceneType={sceneType} />

        <Suspense fallback={null}>
          {sceneType === 'home' && <HomeScene />}
          {sceneType === 'submit' && <SubmitScene />}
          {sceneType === 'success' && <SuccessScene />}
          {sceneType === 'track' && <TrackScene currentStatus={currentStatus} />}
          {sceneType === 'admin' && <AdminScene />}
          {sceneType === 'suggestions' && <AdminScene />}
          {sceneType === 'workspace' && <WorkspaceScene />}
        </Suspense>
      </Canvas>

      {/* Subtle vignette and gradient blend over the 3D scene to keep HTML text completely legible */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-transparent to-[#0B0B0F]/80 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#0B0B0F_95%)] pointer-events-none" />
    </div>
  );
};
