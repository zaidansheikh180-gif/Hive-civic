import React, { forwardRef, useEffect, useRef } from 'react';
import { Link, LinkProps } from 'react-router-dom';

/** Adapted from the Originkit Light Glass Button supplied by the project owner.
 * Keep the native button/link element so form semantics, keyboard and focus survive.
 */
function useGlassLight<T extends HTMLElement>(externalRef?: React.ForwardedRef<T>) {
  const ref = useRef<T | null>(null);
  const motion = useRef<number | null>(null);
  const reduced = useRef(false);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { reduced.current = query.matches; };
    update(); query.addEventListener('change', update);
    return () => { query.removeEventListener('change', update); if (motion.current !== null) cancelAnimationFrame(motion.current); };
  }, []);
  const assign = (node: T | null) => {
    ref.current = node;
    if (typeof externalRef === 'function') externalRef(node);
    else if (externalRef) externalRef.current = node;
  };
  const onPointerMove = (event: React.PointerEvent<T>) => {
    if (reduced.current || event.pointerType !== 'mouse') return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    if (motion.current !== null) cancelAnimationFrame(motion.current);
    motion.current = requestAnimationFrame(() => {
      el.style.setProperty('--glass-x', `${x}%`);
      el.style.setProperty('--glass-y', `${y}%`);
      motion.current = null;
    });
  };
  return { assign, onPointerMove };
}

export const LiquidGlassButton = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  function LiquidGlassButton({ className = '', onPointerMove, children, ...props }, ref) {
    const glass = useGlassLight<HTMLButtonElement>(ref);
    return <button {...props} ref={glass.assign} className={`hive-glass ${className}`}
      onPointerMove={event => { glass.onPointerMove(event); onPointerMove?.(event); }}>
      {children}
    </button>;
  }
);

export const LiquidGlassLink = forwardRef<HTMLAnchorElement, LinkProps>(
  function LiquidGlassLink({ className = '', onPointerMove, children, ...props }, ref) {
    const glass = useGlassLight<HTMLAnchorElement>(ref);
    return <Link {...props} ref={glass.assign} className={`hive-glass ${className}`}
      onPointerMove={event => { glass.onPointerMove(event); onPointerMove?.(event); }}>
      {children}
    </Link>;
  }
);
