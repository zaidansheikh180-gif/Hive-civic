'use client';
import { ReactNode, useRef, useState } from 'react';
import {
  motion,
  useInView,
  useReducedMotion,
  Variant,
  Transition,
  UseInViewOptions,
} from 'motion/react';

export type InViewProps = {
  children: ReactNode;
  variants?: {
    hidden: Variant;
    visible: Variant;
  };
  transition?: Transition;
  viewOptions?: UseInViewOptions;
  as?: React.ElementType;
  once?: boolean;
  className?: string;
};

const defaultVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export function InView({
  children,
  variants = defaultVariants,
  transition,
  viewOptions,
  as = 'div',
  once,
  className
}: InViewProps) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const isInView = useInView(ref, viewOptions);

  const [isViewed, setIsViewed] = useState(false);

  // Motion-Primitives upstream dynamic tag type needs a React 19 compatibility cast.
  const MotionComponent = motion.create(as as React.ElementType) as React.ComponentType<any>;
  const safeVariants = reduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : variants;

  return (
    <MotionComponent
      ref={ref}
      className={className}
      initial='hidden'
      onAnimationComplete={() => {
        if (once && !isViewed) setIsViewed(true);
      }}
      animate={(isInView || isViewed) ? "visible" : "hidden"}

      variants={safeVariants}
      transition={transition}
    >
      {children}
    </MotionComponent>
  );
}
