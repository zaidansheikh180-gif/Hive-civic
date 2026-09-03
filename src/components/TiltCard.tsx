import React, { useRef } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  delayIndex?: number;
  staggerMs?: number;
  onClick?: () => void;
  interactive?: boolean;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  delayIndex = 1,
  staggerMs,
  onClick,
  interactive = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Calculate timed stagger in milliseconds
  const calculatedDelay = staggerMs !== undefined ? staggerMs : Math.min((delayIndex - 1) * 85, 900);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // If mobile or touch screen, skip 3D tilt calculation
    if (window.innerWidth < 768) return;

    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within card
    const y = e.clientY - rect.top; // y position within card

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (-10deg to +10deg max)
    const rotateX = ((y - centerY) / centerY) * -9;
    const rotateY = ((x - centerX) / centerX) * 9;

    card.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    // Reset smoothly to resting perspective
    card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        animationDelay: `${calculatedDelay}ms`,
      }}
      className={`relative overflow-hidden tilt-card glass-panel glass-panel-hover p-5 sm:p-6 flex flex-col justify-between animate-card-timed-open ${
        onClick ? 'cursor-pointer hover:border-[#E7C226]/50' : ''
      } ${className}`}
    >
      {/* Timed Golden Sheen Sweep that triggers synchronously with card opening */}
      <div
        className="card-sheen-line"
        style={{
          animationDelay: `${calculatedDelay + 180}ms`,
        }}
      />

      {children}
    </div>
  );
};
