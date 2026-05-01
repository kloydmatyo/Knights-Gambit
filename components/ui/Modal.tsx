'use client';

import { useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export default function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-75 z-40"
          />

          {/* Modal Container - Fixed Centering */}
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
            style={{ pointerEvents: 'none' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                'rounded-xl shadow-2xl',
                'w-full max-w-2xl max-h-[90vh] overflow-y-auto',
                'p-4 sm:p-6',
                className
              )}
              style={{
                pointerEvents: 'auto',
                background: 'rgba(20,12,4,0.97)',
                border: '2px solid #5a3e28',
                boxShadow: '0 0 0 1px rgba(255,180,80,0.06), 0 24px 64px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,180,80,0.05)',
                overflowX: 'hidden',
              }}
            >
              {title && (
                <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: '1px solid #3d2a14' }}>
                  <h2 className="text-2xl font-bold" style={{ color: '#d4a030' }}>{title}</h2>
                  <button onClick={onClose} className="transition-colors text-2xl" style={{ color: '#8a6a4a' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#d4a030')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#8a6a4a')}>
                    ×
                  </button>
                </div>
              )}
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
