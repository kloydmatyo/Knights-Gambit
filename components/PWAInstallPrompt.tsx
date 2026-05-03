'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after 30 seconds
      setTimeout(() => setShowPrompt(true), 30000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if dismissed before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSince = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) {
        setShowPrompt(false);
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (isInstalled || !showPrompt || !deferredPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md"
      >
        <div
          className="rounded-xl p-4 shadow-2xl backdrop-blur-sm"
          style={{
            background: 'rgba(14, 10, 6, 0.95)',
            border: '2px solid #5a3e28',
            boxShadow: '0 0 0 1px rgba(255,180,80,0.08), 0 12px 48px rgba(0,0,0,0.9)',
          }}
        >
          <div className="flex items-start gap-3">
            <div className="text-4xl">🎲</div>
            <div className="flex-1">
              <h3 className="font-black text-sm mb-1" style={{ color: '#d4a855' }}>
                Install Dicebound
              </h3>
              <p className="text-xs leading-relaxed mb-3" style={{ color: '#8a7060' }}>
                Add to your home screen for a better experience. Play offline, faster loading, and full-screen mode!
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleInstall}
                  className="flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(180deg, #c8860a, #9a6008)',
                    border: '1px solid #e8a030',
                    color: '#fff8e8',
                    textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                  }}
                >
                  Install
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-3 py-2 rounded-lg font-bold text-xs transition-all active:scale-95"
                  style={{
                    background: 'rgba(30, 18, 6, 0.8)',
                    border: '1px solid #3d2a14',
                    color: '#8a7060',
                  }}
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
