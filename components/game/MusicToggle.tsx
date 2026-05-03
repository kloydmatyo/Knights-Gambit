'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MusicToggleProps {
  position?: 'top-right' | 'bottom-left';
}

export default function MusicToggle({ position = 'top-right' }: MusicToggleProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('musicMuted');
    if (saved !== null) {
      setIsMuted(saved === 'true');
    }
  }, []);

  const toggleMusic = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    localStorage.setItem('musicMuted', String(newMuted));
    // Dispatch custom event so MusicManager can listen
    window.dispatchEvent(new CustomEvent('musicToggle', { detail: { muted: newMuted } }));
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) return null;

  const positionStyles = position === 'bottom-left' 
    ? { left: '1rem', bottom: '1rem', top: 'auto', right: 'auto' }
    : { right: '1rem', top: '1rem', left: 'auto', bottom: 'auto' };

  return (
    <motion.button
      onClick={toggleMusic}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed z-50 w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all"
      style={{
        ...positionStyles,
        background: isMuted 
          ? 'linear-gradient(135deg, #4a4a4a 0%, #2a2a2a 100%)'
          : 'linear-gradient(135deg, #d4a030 0%, #8a6020 100%)',
        border: isMuted ? '2px solid #666' : '2px solid #e8a030',
      }}
      title={isMuted ? 'Unmute Music' : 'Mute Music'}
    >
      {isMuted ? '🔇' : '🎵'}
    </motion.button>
  );
}

// Hook to get current mute state
export function useMusicMuted() {
  const [isMuted, setIsMuted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load initial state
    const saved = localStorage.getItem('musicMuted');
    if (saved !== null) {
      setIsMuted(saved === 'true');
    }

    // Listen for changes
    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent<{ muted: boolean }>;
      setIsMuted(customEvent.detail.muted);
    };

    window.addEventListener('musicToggle', handleToggle);
    return () => window.removeEventListener('musicToggle', handleToggle);
  }, []);

  // Return false during SSR to avoid hydration mismatch
  return mounted ? isMuted : false;
}
