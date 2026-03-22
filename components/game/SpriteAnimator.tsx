'use client';

import { useState, useEffect, useRef } from 'react';

interface SpriteAnimatorProps {
  sheet: string;
  frameW: number;
  frameH?: number;
  frameCount: number;
  fps?: number;
  scale?: number;
  className?: string;
}

export default function SpriteAnimator({
  sheet,
  frameW,
  frameH,
  frameCount,
  fps = 8,
  scale = 2,
  className,
}: SpriteAnimatorProps) {
  const [frame, setFrame] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Actual rendered frame dimensions
  const displayH = (frameH ?? frameW) * scale;
  const displayW = frameW * scale;

  useEffect(() => {
    setFrame(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setFrame((f) => (f + 1) % frameCount);
    }, 1000 / fps);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sheet, frameCount, fps]);

  return (
    <div
      className={className}
      style={{
        width: displayW,
        height: displayH,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={sheet}
        alt=""
        style={{
          position: 'absolute',
          top: 0,
          left: -(frame * displayW),
          width: frameCount * displayW,
          height: displayH,
          imageRendering: 'pixelated',
          display: 'block',
          maxWidth: 'none',
        }}
      />
    </div>
  );
}
