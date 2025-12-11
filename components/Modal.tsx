'use client';

import { useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  children, 
  maxWidth = 'md',
  showCloseButton = true 
}: ModalProps) {
  
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const maxWidthClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 pointer-events-none overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 1, y: "100%" }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1, y: "100%" }}
              style={{ scrollbarWidth: 'none' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={`relative bg-white rounded-xl p-4 sm:p-8 w-full ${maxWidthClasses[maxWidth]} shadow-2xl pointer-events-auto max-h-[88vh] sm:max-h-[80vh] overflow-y-auto text-sm`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="sticky top-0 ml-auto mb-2 sm:mb-0 sm:absolute sm:top-6 sm:right-6 w-9 h-9 flex items-center justify-center rounded-full bg-[#1E2A47]/5 sm:bg-transparent text-[#1E2A47]/60 hover:text-[#1E2A47] hover:bg-[#1E2A47]/10 active:scale-90 transition-all z-10"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}

              {/* Content */}
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
