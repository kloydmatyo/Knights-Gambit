'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

const LPCCharacterCreator = dynamic(
  () => import('@/components/game/LPCCharacterCreator'),
  { ssr: false, loading: () => <div className="text-amber-400 text-sm animate-pulse text-center py-16">Loading character creator...</div> }
);

// 3" × 3" at 300 DPI = 900 × 900 px
const STICKER_PX = 900;

export default function StickerPage() {
  const [spriteDataUrl, setSpriteDataUrl] = useState<string | null>(null);
  const [fullSheetUrl, setFullSheetUrl] = useState<string | null>(null);
  const [step, setStep] = useState<'create' | 'preview'>('create');
  const previewRef = useRef<HTMLCanvasElement>(null);

  function handleConfirm(dataUrl: string, fullSheet?: string) {
    setSpriteDataUrl(dataUrl);
    if (fullSheet) setFullSheetUrl(fullSheet);
    setStep('preview');
  }

  async function handleDownload() {
    if (!fullSheetUrl) return;

    // Draw the south-facing walk frame at 900×900 for print quality
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const out = document.createElement('canvas');
      out.width = STICKER_PX;
      out.height = STICKER_PX;
      const ctx = out.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, STICKER_PX, STICKER_PX);

      // Walk south: row 10 (8+2), frame 1 — each frame is 64px on the sheet
      const FRAME = 64;
      const srcX = 1 * FRAME;
      const srcY = 10 * FRAME;
      ctx.drawImage(img, srcX, srcY, FRAME, FRAME, 0, 0, STICKER_PX, STICKER_PX);

      const link = document.createElement('a');
      link.download = 'dicebound-character-sticker.png';
      link.href = out.toDataURL('image/png');
      link.click();
    };
    img.src = fullSheetUrl;
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-10 px-4"
      style={{ background: 'radial-gradient(ellipse at center, #2a1808 0%, #0e0804 100%)' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8">
        <h1 className="text-3xl font-black mb-1" style={{ color: '#d4a030' }}>
          🎨 Character Sticker Creator
        </h1>
        <p className="text-sm" style={{ color: '#6a4a2a' }}>
          Design your character and download a print-ready 3″ × 3″ sticker
        </p>
        <a href="/" className="text-xs underline mt-2 inline-block transition-colors"
          style={{ color: '#5a3a1a' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#d4a030')}
          onMouseLeave={e => (e.currentTarget.style.color = '#5a3a1a')}>
          ← Back to home
        </a>
      </motion.div>

      {step === 'create' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="w-full flex justify-center">
          <LPCCharacterCreator onConfirm={handleConfirm} />
        </motion.div>
      )}

      {step === 'preview' && spriteDataUrl && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6">

          {/* Sticker preview */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6a4a2a' }}>
              Preview (3″ × 3″)
            </p>
            <div className="rounded-xl overflow-hidden shadow-2xl"
              style={{
                width: 288, height: 288, // 3" at 96dpi for screen preview
                border: '3px solid #5a3e28',
                background: '#ffffff',
                imageRendering: 'pixelated',
              }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={spriteDataUrl} alt="Your character sticker"
                style={{ width: '100%', height: '100%', imageRendering: 'pixelated', objectFit: 'contain' }} />
            </div>
            <p className="text-[10px]" style={{ color: '#4a3020' }}>
              Export: 900 × 900 px · 300 DPI · PNG
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => setStep('create')}
              className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95"
              style={{
                background: 'rgba(20,12,4,0.9)',
                border: '2px solid #5a3e28',
                color: '#d4a030',
              }}>
              ← Redesign
            </button>
            <button onClick={handleDownload}
              className="px-8 py-2.5 rounded-xl font-black text-sm transition-all active:scale-95 shadow-lg"
              style={{
                background: 'linear-gradient(180deg,#c8621a,#8a3e0a)',
                border: '1px solid #e8821a',
                borderBottom: '3px solid #4a1e04',
                color: 'white',
                textShadow: '0 1px 2px rgba(0,0,0,0.6)',
              }}>
              ⬇ Download PNG
            </button>
          </div>

          <p className="text-xs text-center max-w-xs" style={{ color: '#4a3020' }}>
            White background included. Print at 3″ × 3″ for a perfect sticker size.
          </p>
        </motion.div>
      )}
    </div>
  );
}
