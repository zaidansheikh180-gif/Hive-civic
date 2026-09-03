import React, { useEffect, useRef, useState } from 'react';

interface ClickRipple {
  id: number;
  x: number;
  y: number;
}

export const CustomCursor: React.FC = () => {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const gridMaskRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState<ClickRipple[]>([]);

  // Smooth lerp coordinates for organic floating beam & ring
  const mousePos = useRef({ x: -500, y: -500 });
  const lerpPos = useRef({ x: -500, y: -500 });
  const rafId = useRef<number | null>(null);
  const hoveredRef = useRef(false);

  useEffect(() => {
    // Only enable cursor reveal on devices with a mouse / fine pointer
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isFinePointer) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      // Expose CSS variables to root for surface highlights
      document.documentElement.style.setProperty('--cursor-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${e.clientY}px`);

      // Detect hover over interactive elements to bloom the reveal spotlight
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = Boolean(
          target.closest('button') ||
          target.closest('a') ||
          target.closest('input') ||
          target.closest('select') ||
          target.closest('textarea') ||
          target.closest('.btn-cut') ||
          target.closest('.btn-cut-border') ||
          target.closest('.tilt-card') ||
          target.closest('.glass-panel') ||
          target.closest('[role="button"]') ||
          target.getAttribute('data-cursor-hover') === 'true'
        );
        hoveredRef.current = interactive;
        setIsHovered(interactive);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    const handleMouseDown = (e: MouseEvent) => {
      const newRipple: ClickRipple = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
      };

      setRipples((prev) => [...prev.slice(-4), newRipple]);

      // Trigger fail-safe Motion animation on next tick if Motion library exists
      setTimeout(() => {
        const el = document.getElementById(`ripple-${newRipple.id}`);
        if (el) {
          const motion = window.Motion ? window.Motion : null;
          if (motion) {
            /* Use motion.animate for JS animations */
            motion.animate(
              el,
              {
                transform: ['translate(-50%, -50%) scale(0.1)', 'translate(-50%, -50%) scale(3.5)'],
                opacity: [0.85, 0],
              },
              { duration: 0.65, easing: [0.16, 1, 0.3, 1] }
            );
          } else {
            /* Fallback to existing CSS animations */
          }
        }
      }, 10);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Render loop for smooth cursor reveal spotlight and custom ring
    const render = () => {
      const lerpFactor = 0.18;
      lerpPos.current.x += (mousePos.current.x - lerpPos.current.x) * lerpFactor;
      lerpPos.current.y += (mousePos.current.y - lerpPos.current.y) * lerpFactor;

      const lx = Math.round(lerpPos.current.x);
      const ly = Math.round(lerpPos.current.y);

      const radius = hoveredRef.current ? 480 : 360;
      const coreAlpha = hoveredRef.current ? 0.16 : 0.09;
      const amberAlpha = hoveredRef.current ? 0.12 : 0.06;

      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(circle ${radius}px at ${lx}px ${ly}px, rgba(231, 194, 38, ${coreAlpha}) 0%, rgba(160, 133, 17, ${amberAlpha}) 45%, transparent 75%)`;
      }

      if (gridMaskRef.current) {
        const maskStyle = `radial-gradient(circle ${radius - 40}px at ${lx}px ${ly}px, black 25%, transparent 75%)`;
        gridMaskRef.current.style.maskImage = maskStyle;
        gridMaskRef.current.style.webkitMaskImage = maskStyle;
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${lx}px, ${ly}px) translate(-50%, -50%)`;
      }

      rafId.current = requestAnimationFrame(render);
    };

    rafId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isVisible]);

  // Clean up ripples when done
  const handleRippleEnd = (id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <>
      <div
        className="cursor-reveal-container"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      >
        {/* 1. Dynamic Civic Grid Matrix Reveal Layer (revealed only under cursor) */}
        <div ref={gridMaskRef} className="cursor-reveal-grid" />

        {/* 2. Ambient Civic Spotlight Halo Beam (Golden Ratio illumination) */}
        <div
          ref={spotlightRef}
          className="absolute inset-0 pointer-events-none transition-all duration-300"
        />

        {/* 3. Click Reveal Shockwave Ripples */}
        {ripples.map((ripple) => (
          <div
            key={ripple.id}
            id={`ripple-${ripple.id}`}
            className="cursor-click-ripple"
            onAnimationEnd={() => handleRippleEnd(ripple.id)}
            style={{
              left: `${ripple.x}px`,
              top: `${ripple.y}px`,
              width: '60px',
              height: '60px',
            }}
          />
        ))}
      </div>

      {/* 4. Custom Cursor Ring: Initial ring border --deep-amber, hover state --muted-gold */}
      <div
        ref={ringRef}
        id="custom-cursor-ring"
        className={`fixed top-0 left-0 rounded-full pointer-events-none transition-all duration-200 ease-out z-[9998] ${
          isHovered
            ? 'w-[50px] h-[50px] border-2 border-[var(--muted-gold)] bg-[var(--honey)]/10 shadow-[0_0_18px_rgba(204,158,51,0.5)]'
            : 'w-[36px] h-[36px] border border-[var(--deep-amber)] bg-transparent shadow-[0_0_12px_rgba(160,133,17,0.35)]'
        }`}
        style={{
          opacity: isVisible ? 1 : 0,
        }}
      />
    </>
  );
};

export const CursorReveal = CustomCursor;

