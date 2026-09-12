import React, { useEffect, useMemo, useRef, useState } from 'react';

interface ScrollSequenceProps {
  manifestUrl?: string;
  height?: string;
}

interface FrameManifest {
  frames: string[];
}

/**
 * Apple-style scroll sequence: scroll progress selects a preloaded canvas frame.
 * The scroll listener only records progress; requestAnimationFrame performs the draw.
 */
export const ScrollSequence: React.FC<ScrollSequenceProps> = ({
  manifestUrl = '/frames/manifest.json',
  height = '400vh',
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const frameIndexRef = useRef(-1);
  const scrollProgressRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const resizeRafRef = useRef<number | null>(null);
  const [manifest, setManifest] = useState<FrameManifest | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [error, setError] = useState(false);

  const mobile = useMemo(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches,
  []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadManifest = async () => {
      try {
        const response = await fetch(manifestUrl, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Manifest request failed: ${response.status}`);
        const data = (await response.json()) as FrameManifest;
        if (!Array.isArray(data.frames) || data.frames.length === 0) {
          setManifest(null);
          return;
        }
        if (!cancelled) setManifest(data);
      } catch {
        if (!cancelled) setError(true);
      }
    };
    loadManifest();
    return () => { cancelled = true; };
  }, [manifestUrl]);

  useEffect(() => {
    if (!manifest?.frames.length || reducedMotion) return;

    let cancelled = false;
    const sourceFrames = manifest.frames;
    const selected = mobile
      ? sourceFrames.filter((_, index) => index % 2 === 0 || index === sourceFrames.length - 1)
      : sourceFrames;

    const images = selected.map((src) => {
      const image = new Image();
      image.decoding = 'async';
      image.src = src.startsWith('/') ? src : `/frames/${src}`;
      return image;
    });

    Promise.all(images.map((image) => new Promise<void>((resolve, reject) => {
      if (image.complete && image.naturalWidth > 0) return resolve();
      image.onload = () => resolve();
      image.onerror = () => reject(new Error(`Failed to load ${image.src}`));
    }))).then(() => {
      if (cancelled) return;
      framesRef.current = images;
      setLoaded(true);
    }).catch(() => {
      if (!cancelled) setError(true);
    });

    return () => {
      cancelled = true;
      framesRef.current = [];
      setLoaded(false);
    };
  }, [manifest, mobile, reducedMotion]);

  useEffect(() => {
    if (!loaded || reducedMotion) return;

    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: true });
    if (!section || !canvas || !ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      frameIndexRef.current = -1;
      scheduleDraw();
    };

    const drawFrame = (index: number) => {
      const image = framesRef.current[index];
      if (!image || !image.naturalWidth) return;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      const x = Math.floor((width - drawWidth) / 2);
      const y = Math.floor((height - drawHeight) / 2);

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(image, x, y, drawWidth, drawHeight);
      frameIndexRef.current = index;
    };

    const scheduleDraw = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        const lastIndex = framesRef.current.length - 1;
        const nextIndex = Math.min(lastIndex, Math.max(0, Math.round(scrollProgressRef.current * lastIndex)));
        if (nextIndex !== frameIndexRef.current) drawFrame(nextIndex);
      });
    };

    const updateProgress = () => {
      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight);
      scrollProgressRef.current = Math.min(1, Math.max(0, -rect.top / scrollable));
      scheduleDraw();
    };

    const onResize = () => {
      if (resizeRafRef.current !== null) return;
      resizeRafRef.current = window.requestAnimationFrame(() => {
        resizeRafRef.current = null;
        resize();
      });
    };

    resize();
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', onResize);
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      if (resizeRafRef.current !== null) window.cancelAnimationFrame(resizeRafRef.current);
      rafRef.current = null;
      resizeRafRef.current = null;
    };
  }, [loaded, reducedMotion]);

  if (!manifest || reducedMotion) return null;

  return (
    <section
      ref={sectionRef}
      className="relative w-full border-y border-[#CC9E33]/20"
      style={{ minHeight: height }}
      aria-label="Interactive HIVE visual sequence"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-transparent to-[#0B0B0F]/60" />
        {!loaded && !error && (
          <div className="absolute inset-0 grid place-items-center bg-[#0B0B0F]/70 backdrop-blur-sm">
            <div className="text-center font-mono text-[10px] uppercase tracking-[0.25em] text-[#CC9E33]">
              Loading visual sequence
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 grid place-items-center bg-[#0B0B0F]/70">
            <div className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-[#CC9E33]">
              Visual sequence unavailable
            </div>
          </div>
        )}
        <div className="absolute left-1/2 top-10 z-10 -translate-x-1/2 text-center">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#E7C226]">
            03 • Interactive Civic Sequence
          </div>
          <p className="mt-2 max-w-md text-xs text-neutral-400">
            Scroll to move through the HIVE visual timeline.
          </p>
        </div>
      </div>
    </section>
  );
};
