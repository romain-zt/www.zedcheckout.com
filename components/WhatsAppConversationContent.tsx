'use client';

import { useMessages } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

interface Message {
  sender: 'client' | 'zedcheckout';
  time: string;
  text: string;
}

interface WhatsAppConversationContentProps {
  forceStart?: boolean; // Force animation to start immediately
}

export default function WhatsAppConversationContent({ forceStart = false }: WhatsAppConversationContentProps) {
  const messages = useMessages() as any;
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  const [showTyping, setShowTyping] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(forceStart);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Human-like timing arrays (in milliseconds)
  const clientMessageDelays = [1200, 1500, 1800, 2000, 1400, 1600]; // Customer takes time to type
  const zedCheckoutTypingDelays = [300, 400, 500, 600]; // Delay before showing "typing..."
  const zedCheckoutMessageDelays = [900, 1100, 1300, 1000, 1200]; // Business responds fairly quickly

  // Helper to get random delay from array
  const getRandomDelay = (delayArray: number[]) => {
    return delayArray[Math.floor(Math.random() * delayArray.length)];
  };

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

  // Start animation when forceStart changes
  useEffect(() => {
    if (forceStart) {
      setIsVisible(true);
    }
  }, [forceStart]);

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
      // Reset and loop after 3-5 seconds pause (random for human feel)
      const endPauseDelays = [3000, 3500, 4000, 4500, 5000];
      const resetDelay = endPauseDelays[Math.floor(Math.random() * endPauseDelays.length)];
      
      const resetTimeout = setTimeout(() => {
        setVisibleMessages([]);
        setCurrentMessageIndex(0);
        setShowTyping(false);
      }, resetDelay);
      return () => clearTimeout(resetTimeout);
    }

    const nextMessage = whatsappMessages[currentMessageIndex];
    const isZedCheckoutMessage = nextMessage.sender === 'zedcheckout';

    // Show typing indicator before ZedCheckout messages
    if (isZedCheckoutMessage) {
      const typingDelay = getRandomDelay(zedCheckoutTypingDelays);
      const typingDuration = 600; // Time showing "typing..." indicator
      
      const typingTimeout = setTimeout(() => {
        setShowTyping(true);
      }, typingDelay);

      const messageTimeout = setTimeout(() => {
        setShowTyping(false);
        setVisibleMessages(prev => [...prev, currentMessageIndex]);
        setCurrentMessageIndex(prev => prev + 1);
      }, typingDelay + typingDuration);

      return () => {
        clearTimeout(typingTimeout);
        clearTimeout(messageTimeout);
      };
    } else {
      // Client messages - humans take time to type!
      const messageDelay = getRandomDelay(clientMessageDelays);
      
      const messageTimeout = setTimeout(() => {
        setVisibleMessages(prev => [...prev, currentMessageIndex]);
        setCurrentMessageIndex(prev => prev + 1);
      }, messageDelay);

      return () => clearTimeout(messageTimeout);
    }
  }, [currentMessageIndex, whatsappMessages.length, isVisible]);

  return (
    <>
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
      <div ref={scrollContainerRef} className="h-[calc(80dvh_-_50px)] max-h-[600px] overflow-y-auto p-4 space-y-3 bg-[#ECE5DD] scroll-smooth" style={{ scrollbarWidth: 'none' }}>
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
    </>
  );
}
