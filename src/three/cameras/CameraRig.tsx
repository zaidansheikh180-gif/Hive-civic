import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SceneType } from '../../types';

interface CameraRigProps {
  sceneType: SceneType;
}

export const CameraRig: React.FC<CameraRigProps> = ({ sceneType }) => {
  const mouse = useRef({ x: 0, y: 0 });
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Determine base camera position by scene
  const targetPos = useRef(new THREE.Vector3(0, 0, 7));

  useEffect(() => {
    switch (sceneType) {
      case 'home':
        targetPos.current.set(0, 0.2, 6.8);
        break;
      case 'submit':
        targetPos.current.set(1.5, 0.4, 6.2);
        break;
      case 'success':
        targetPos.current.set(0, 0.3, 5.5);
        break;
      case 'track':
        targetPos.current.set(-0.8, 0.2, 6.5);
        break;
      case 'admin':
        targetPos.current.set(1.2, 0.5, 7.2);
        break;
      case 'suggestions':
        targetPos.current.set(-1.0, 0.3, 7.0);
        break;
      case 'workspace':
        targetPos.current.set(0.6, 0.2, 5.8);
        break;
      default:
        targetPos.current.set(0, 0, 7);
    }
  }, [sceneType]);

  useFrame((state, delta) => {
    const isReduced = reducedMotion.current;
    const factor = Math.min(delta * 2.5, 0.15);

    // Parallax displacement
    const parallaxX = isReduced ? 0 : mouse.current.x * 0.4;
    const parallaxY = isReduced ? 0 : mouse.current.y * 0.3;

    // Subtle idle float
    const idleFloatY = isReduced ? 0 : Math.sin(state.clock.elapsedTime * 0.6) * 0.08;

    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      targetPos.current.x + parallaxX,
      factor
    );
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      targetPos.current.y + parallaxY + idleFloatY,
      factor
    );
    state.camera.position.z = THREE.MathUtils.lerp(
      state.camera.position.z,
      targetPos.current.z,
      factor
    );

    state.camera.lookAt(0, 0, 0);
  });

  return null;
};
