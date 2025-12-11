'use client';

import { useMessages } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { Package } from 'lucide-react';
import WhatsAppConversationContent from './WhatsAppConversationContent';

type Phase = 'cold' | 'transition' | 'warm';

export default function WhatsAppTransformationDemo() {
  const messages = useMessages() as any;
  const [phase, setPhase] = useState<Phase>('cold');
  const [isVisible, setIsVisible] = useState(false);
  const [conversationKey, setConversationKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect when component is visible in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [isVisible]);

  // Phase cycle management
  useEffect(() => {
    if (!isVisible) return;

    let timer: NodeJS.Timeout;

    if (phase === 'cold') {
      // Show cold state for 3 seconds
      timer = setTimeout(() => setPhase('transition'), 500);
    } else if (phase === 'transition') {
      // Transition lasts 1 second
      timer = setTimeout(() => {
        setPhase('warm');
        // Reset conversation to force restart
        setConversationKey(prev => prev + 1);
      }, 1500);
    } else if (phase === 'warm') {
      // Show warm state for 40 seconds (conversation + 3-5s end pause)
      timer = setTimeout(() => setPhase('cold'), 40000);
    }

    return () => clearTimeout(timer);
  }, [phase, isVisible]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Phone frame container */}
      <div className="max-w-[380px] border-8 border-black relative w-full h-full mx-auto rounded-2xl overflow-hidden shadow-lg">
        {/* iPhone notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[90px] h-6 z-20 bg-black rounded-b-xl pointer-events-none" />

        {/* Content area */}
        <div className="h-[80dvh] max-h-[650px] relative overflow-hidden">
          <AnimatePresence mode="wait">
            {/* COLD STATE */}
            {phase === 'cold' && (
              <motion.div
                key="cold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-white"
              >
                <div className="p-4 space-y-3 grayscale opacity-40">
                  {/* Header */}
                  <div className="text-xs text-gray-600 font-semibold border-b border-gray-200 pb-2">
                    {messages?.whatsapp?.cart?.title || 'Votre panier (3 articles)'}
                  </div>

                  {/* Cart items */}
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex gap-3 py-2 border-b border-gray-100">
                      {/* Product image placeholder */}
                      <div className="w-16 h-16 bg-gray-300 rounded flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>

                      {/* Product info */}
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-gray-300 rounded w-24" />
                        <div className="h-2 bg-gray-200 rounded w-16" />
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-6 w-16 bg-gray-200 rounded border border-gray-300" />
                          <div className="text-xs text-gray-500">×1</div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-sm text-gray-600 font-semibold">€{25 + item * 10}</div>
                    </div>
                  ))}

                  {/* Total */}
                  <div className="flex justify-between items-center pt-2 border-t-2 border-gray-300">
                    <div className="text-sm text-gray-600 font-semibold">
                      {messages?.whatsapp?.cart?.total || 'Total'}
                    </div>
                    <div className="text-base text-gray-700 font-bold">€85.00</div>
                  </div>

                  {/* Cold CTA button */}
                  <button className="w-full py-3 bg-gray-400 text-white text-sm font-semibold rounded border border-gray-500 mt-4">
                    {messages?.whatsapp?.cart?.cta || 'Continuer vers le paiement'} →
                  </button>
                </div>
              </motion.div>
            )}

            {/* TRANSITION STATE */}
            {phase === 'transition' && (
              <motion.div
                key="transition"
                className="absolute inset-0 bg-[#ECE5DD]"
              >
                {/* Ripple/wave effect sweeping top to bottom */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-[#25D366]/40 to-transparent"
                  initial={{ y: '-100%' }}
                  animate={{ y: '100%' }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                />

                {/* "BING" pulse effect */}
                <motion.div
                  className="absolute inset-0 bg-[#25D366]"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0, 0.4, 0], scale: [0.8, 1.3, 1] }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />

                {/* Subtle glitch lines */}
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.3, repeat: 2 }}
                >
                  <div className="absolute top-1/4 left-0 right-0 h-[2px] bg-white/50" />
                  <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/50" />
                  <div className="absolute top-3/4 left-0 right-0 h-[2px] bg-white/50" />
                </motion.div>
              </motion.div>
            )}

            {/* WARM STATE */}
            {phase === 'warm' && (
              <motion.div
                key="warm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="absolute inset-0"
              >
                <WhatsAppConversationContent key={conversationKey} forceStart={true} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
