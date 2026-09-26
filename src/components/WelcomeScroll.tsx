import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

/** Smooth wheel/anchor scrolling is reserved for the public long-form About page. */
export const WelcomeScroll = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname !== '/') return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lenis: Lenis | null = null;

    const syncMotion = () => {
      lenis?.destroy();
      lenis = null;
      if (!preference.matches) {
        lenis = new Lenis({ autoRaf: true, anchors: true, smoothWheel: true, wheelMultiplier: 0.9 });
      }
    };

    syncMotion();
    preference.addEventListener('change', syncMotion);
    return () => {
      preference.removeEventListener('change', syncMotion);
      lenis?.destroy();
    };
  }, [pathname]);

  return null;
};
