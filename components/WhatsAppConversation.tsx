'use client';

import { useMessages } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

interface Message {
  sender: 'client' | 'zedcheckout';
  time: string;
  text: string;
}

export default function WhatsAppConversation() {
  const messages = useMessages() as any;
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  const [showTyping, setShowTyping] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load messages from translations
  const whatsappMessages: Message[] = [];
  const messagesArray = messages?.whatsapp?.messages;
  
  if (Array.isArray(messagesArray)) {
    messagesArray.forEach((msg: any) => {
      if (msg?.sender && msg?.time && msg?.text) {
        whatsappMessages.push({
          sender: msg.sender as 'client' | 'zedcheckout',
          time: msg.time,
          text: msg.text
        });
      }
    });
  }

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

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [visibleMessages, showTyping]);

  useEffect(() => {
    // Only run animation if component is visible
    if (!isVisible) return;
    if (currentMessageIndex >= whatsappMessages.length) {
      // Reset and loop after a pause
      const resetTimeout = setTimeout(() => {
        setVisibleMessages([]);
        setCurrentMessageIndex(0);
        setShowTyping(false);
      }, 3000);
      return () => clearTimeout(resetTimeout);
    }

    const nextMessage = whatsappMessages[currentMessageIndex];
    const isZedCheckoutMessage = nextMessage.sender === 'zedcheckout';

    // Show typing indicator before ZedCheckout messages
    if (isZedCheckoutMessage) {
      const typingTimeout = setTimeout(() => {
        setShowTyping(true);
      }, 500);

      const messageTimeout = setTimeout(() => {
        setShowTyping(false);
        setVisibleMessages(prev => [...prev, currentMessageIndex]);
        setCurrentMessageIndex(prev => prev + 1);
      }, 1300); // 500ms delay + 800ms typing

      return () => {
        clearTimeout(typingTimeout);
        clearTimeout(messageTimeout);
      };
    } else {
      // Client messages appear immediately
      const messageTimeout = setTimeout(() => {
        setVisibleMessages(prev => [...prev, currentMessageIndex]);
        setCurrentMessageIndex(prev => prev + 1);
      }, 1500);

      return () => clearTimeout(messageTimeout);
    }
  }, [currentMessageIndex, whatsappMessages.length, isVisible]);

  return (
    <div ref={containerRef} className="max-w-[380px] border border-black border-8 relative w-full h-full mx-auto rounded-2xl bg-[#ECE5DD] shadow-lg overflow-hidden">
      {/* iPhone notch */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 90,
          height: 24,
          zIndex: 20,
          pointerEvents: 'none',
          backgroundColor: '#000',
          borderRadius: '0 0 10px 10px',
        }}
      />
      
      {/* WhatsApp header */}
      <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg">
          💆‍♀️
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">Spa Beauté</p>
          <p className="text-white/70 text-xs">En ligne</p>
        </div>
      </div>

      {/* Messages container - fixed height with scroll */}
      <div ref={scrollContainerRef} className="h-[600px] overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {visibleMessages.map((msgIndex) => {
            const message = whatsappMessages[msgIndex];
            const isClient = message.sender === 'client';

            return (
              <motion.div
                key={msgIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
                    isClient
                      ? 'bg-white text-gray-900'
                      : 'bg-[#25D366] text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line leading-relaxed">
                    {message.text}
                  </p>
                </div>
                <span className="text-xs text-gray-500 mt-1 px-1">
                  {message.time}
                </span>
              </motion.div>
            );
          })}

          {showTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start"
            >
              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <motion.div
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0.2,
                    }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0.4,
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
