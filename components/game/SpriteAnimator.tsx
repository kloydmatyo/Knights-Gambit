'use client';

import { useEffect, useRef } from 'react';

interface SpriteAnimatorProps {
  sheet: string;
  frameW: number;
  frameH?: number;
  frameCount: number;
  fps?: number;
  loop?: boolean;
  scale?: number;
  className?: string;
}

export default function SpriteAnimator({
  sheet,
  frameW,
  frameH,
  frameCount,
  fps = 8,
  loop = true,
  scale = 2,
  className,
}: SpriteAnimatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef(0);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const displayH = (frameH ?? frameW) * scale;
  const displayW = frameW * scale;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = displayW;
    canvas.height = displayH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    // Load image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      frameRef.current = 0;
      lastTimeRef.current = 0;
      
      function draw(now: number) {
        if (!ctx || !imgRef.current) {
          rafRef.current = requestAnimationFrame(draw);
          return;
        }

        // Update frame based on FPS
        if (now - lastTimeRef.current > 1000 / fps) {
          lastTimeRef.current = now;
          
          if (loop || frameRef.current < frameCount - 1) {
            frameRef.current = (frameRef.current + 1) % frameCount;
          }
        }

        // Clear and draw current frame
        ctx.clearRect(0, 0, displayW, displayH);
        ctx.drawImage(
          imgRef.current,
          frameRef.current * frameW, 0, frameW, frameH ?? frameW,
          0, 0, displayW, displayH
        );

        rafRef.current = requestAnimationFrame(draw);
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    img.src = sheet;

    return () => {
      cancelAnimationFrame(rafRef.current);
      imgRef.current = null;
    };
  }, [sheet, frameW, frameH, frameCount, fps, loop, scale, displayW, displayH]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: displayW,
        height: displayH,
        imageRendering: 'pixelated',
      }}
    />
  );
}
