'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
type QuestionType = 'welcome' | 'multiple' | 'checkbox' | 'scale' | 'text' | 'contact' | 'end' | 'section';

interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  options?: string[];
  scaleLabels?: { min: string; max: string };
  required: boolean;
  followUp?: {
    condition: (value: any) => boolean;
    question: string;
  };
  sectionNumber?: number;
  sectionTitle?: string;
  sectionIcon?: string;
}

interface QuizData {
  [key: string]: any;
}

// Quiz questions configuration
const quizQuestions: Question[] = [
  {
    id: 'welcome',
    type: 'welcome',
    title: 'Audit Checkout en 2 minutes 🔍',
    description: 'Découvrez vos angles morts en optimisation checkout.\n10 questions. Diagnostic personnalisé à la fin.',
    required: false,
  },
  // BLOC 1 - DIAGNOSTIC TECHNIQUE
  {
    id: 'section1',
    type: 'section',
    title: 'Diagnostic Data',
    description: 'Commençons par comprendre votre setup actuel',
    sectionNumber: 1,
    sectionTitle: 'DIAGNOSTIC TECHNIQUE',
    sectionIcon: '📊',
    required: false,
  },
  {
    id: 'q1',
    type: 'checkbox',
    title: 'Quels outils utilisez-vous pour analyser vos conversions checkout ?',
    options: [
      'Google Analytics 4 (GA4)',
      'Hotjar / Clarity / FullStory',
      'Google Optimize / VWO / AB Tasty',
      'Stripe Dashboard / Analytics paiement',
      'Aucun de ces outils',
      'Je ne sais pas',
    ],
    required: true,
  },
  {
    id: 'q2',
    type: 'multiple',
    title: 'Faites-vous régulièrement des A/B tests sur votre checkout ?',
    options: [
      'Oui, au moins 1 test/mois',
      'Parfois (1-2 tests/trimestre)',
      'J\'ai déjà essayé mais c\'est compliqué 🔥',
      'Non, je ne sais pas comment faire',
      'Non, ma plateforme ne le permet pas 🔥🔥',
    ],
    required: true,
  },
  {
    id: 'q3',
    type: 'multiple',
    title: 'À quelle fréquence modifiez-vous votre checkout pour améliorer les conversions ?',
    options: [
      'Chaque semaine (itération rapide)',
      'Chaque mois',
      'Tous les 3-6 mois',
      'Jamais / Rarement',
      'Je voudrais mais je n\'y arrive pas 🔥',
    ],
    required: true,
  },
  {
    id: 'q4',
    type: 'checkbox',
    title: 'Quels événements checkout trackez-vous actuellement ?',
    options: [
      'Début checkout (initiate_checkout)',
      'Ajout infos paiement (add_payment_info)',
      'Abandon checkout (abandon_cart)',
      'Achat finalisé (purchase)',
      'Erreurs formulaire',
      'Je ne tracke pas ces événements 🔥',
      'Je ne sais pas comment faire ça',
    ],
    required: true,
  },
  // BLOC 2 - FRUSTRATIONS SPÉCIFIQUES
  {
    id: 'section2',
    type: 'section',
    title: 'Frustrations Spécifiques',
    description: 'Identifions vos points de blocage',
    sectionNumber: 2,
    sectionTitle: 'FRUSTRATIONS SPÉCIFIQUES',
    sectionIcon: '🔥',
    required: false,
  },
  {
    id: 'q5',
    type: 'scale',
    title: 'Sur une échelle de 1 à 5, êtes-vous satisfait des capacités de personnalisation checkout de votre plateforme actuelle ?',
    scaleLabels: { min: 'Très frustré 😤', max: 'Très satisfait 😊' },
    required: true,
    followUp: {
      condition: (value: number) => value <= 3,
      question: 'Quelle est votre principale limitation ?',
    },
  },
  {
    id: 'q6',
    type: 'checkbox',
    title: 'Avez-vous identifié des points de friction dans votre checkout actuel ?',
    options: [
      'Trop d\'étapes (>2 pages)',
      'Champs formulaire trop nombreux',
      'Pas assez de réassurance (trust badges)',
      'Problèmes mobile',
      'Manque de personnalisation',
      'Temps de chargement lent',
      'Je n\'ai pas encore analysé ça 🔥',
      'Autre',
    ],
    required: true,
  },
  {
    id: 'q7',
    type: 'checkbox',
    title: 'Votre checkout inclut-il des spécificités complexes ?',
    options: [
      'Réservation / Booking avec calendrier',
      'Configurateur produit (personnalisation)',
      'Abonnements / Paiements récurrents',
      'Upsells / Cross-sells',
      'Multi-devises / Multi-langues',
      'Rien de spécifique (vente simple)',
    ],
    required: true,
  },
  // BLOC 3 - QUALIFICATION BUSINESS
  {
    id: 'section3',
    type: 'section',
    title: 'Qualification Business',
    description: 'Dernières questions pour personnaliser votre diagnostic',
    sectionNumber: 3,
    sectionTitle: 'QUALIFICATION BUSINESS',
    sectionIcon: '💼',
    required: false,
  },
  {
    id: 'q8',
    type: 'multiple',
    title: 'Connaissez-vous votre taux de conversion checkout actuel ?',
    options: [
      'Oui, il est < 2%',
      'Oui, il est entre 2-4%',
      'Oui, il est > 4%',
      'Non, je ne le mesure pas 🔥',
    ],
    required: true,
  },
  {
    id: 'q9',
    type: 'multiple',
    title: 'Quel est votre CA annuel e-commerce ?',
    options: [
      'Moins de €50K/an',
      '€50K - €100K/an',
      '€100K - €200K/an',
      '€200K - €500K/an',
      '€500K - €800K/an',
      'Plus de €800K/an',
    ],
    required: true,
  },
  {
    id: 'q10',
    type: 'multiple',
    title: 'Quelle plateforme e-commerce utilisez-vous ?',
    options: [
      'Shopify (Standard)',
      'Shopify Plus',
      'WooCommerce',
      'PrestaShop',
      'Magento',
      'Custom / Autre',
    ],
    required: true,
  },
  {
    id: 'contact',
    type: 'contact',
    title: '✅ Votre diagnostic personnalisé arrive !',
    description: 'Dernière étape pour recevoir:\n→ Votre score d\'optimisation checkout\n→ Vos recommandations prioritaires\n→ Le lead magnet adapté à votre niveau',
    required: true,
  },
];

// Scoring and segmentation logic
function analyzeQuizData(data: QuizData) {
  // Expertise level
  const hasTools = Array.isArray(data.q1) && !data.q1.includes('Aucun de ces outils') && !data.q1.includes('Je ne sais pas');
  const toolCount = hasTools ? data.q1.length : 0;
  const hasTracking = Array.isArray(data.q4) && !data.q4.includes('Je ne tracke pas ces événements 🔥') && !data.q4.includes('Je ne sais pas comment faire ça');
  const doesABTesting = data.q2?.includes('Oui, au moins 1 test/mois');
  
  let expertiseLevel: 'debutant' | 'intermediaire' | 'avance';
  if (!hasTools || !hasTracking) {
    expertiseLevel = 'debutant';
  } else if (toolCount >= 3 && doesABTesting) {
    expertiseLevel = 'avance';
  } else {
    expertiseLevel = 'intermediaire';
  }

  // Frustration score
  const satisfactionScore = data.q5 || 5;
  const frictionCount = Array.isArray(data.q6) ? data.q6.length : 0;
  const platformBlocked = data.q2?.includes('Non, ma plateforme ne le permet pas 🔥🔥');
  
  let frustrationLevel: 'hot_hot_hot' | 'hot' | 'warm';
  if (satisfactionScore <= 2 || platformBlocked) {
    frustrationLevel = 'hot_hot_hot';
  } else if (satisfactionScore === 3 || frictionCount >= 3) {
    frustrationLevel = 'hot';
  } else {
    frustrationLevel = 'warm';
  }

  // Fit score
  const complexityCount = Array.isArray(data.q7) ? data.q7.filter((v: string) => v !== 'Rien de spécifique (vente simple)').length : 0;
  const revenue = data.q9 || '';
  const isShopify = data.q10?.includes('Shopify');
  
  let fitScore: 'golden_lead' | 'perfect_fit' | 'good_fit' | 'low_fit';
  if (isShopify && satisfactionScore <= 2 && complexityCount >= 2 && (revenue.includes('€200K') || revenue.includes('€500K') || revenue.includes('Plus de €800K'))) {
    fitScore = 'golden_lead';
  } else if (complexityCount >= 2 && satisfactionScore <= 3 && (revenue.includes('€100K') || revenue.includes('€200K') || revenue.includes('€500K') || revenue.includes('Plus de €800K'))) {
    fitScore = 'perfect_fit';
  } else if (complexityCount >= 1 && !revenue.includes('Moins de €50K')) {
    fitScore = 'good_fit';
  } else {
    fitScore = 'low_fit';
  }

  // Calculate score
  let score = 0;
  if (hasTools) score += 20;
  if (hasTracking) score += 20;
  if (doesABTesting) score += 15;
  if (satisfactionScore >= 4) score += 20;
  if (complexityCount >= 2) score += 15;
  if (data.q8 && !data.q8.includes('Non, je ne le mesure pas 🔥')) score += 10;

  return {
    expertiseLevel,
    frustrationLevel,
    fitScore,
    score,
    satisfactionScore,
    frustrationText: data.q5_followup || '',
  };
}

export default function QuizQualification() {
  const [currentStep, setCurrentStep] = useState(0);
  const [quizData, setQuizData] = useState<QuizData>({});
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [direction, setDirection] = useState(1);

  const currentQuestion = quizQuestions[currentStep];
  // Calculate progress excluding welcome, section headers, and end screens
  const totalQuestions = quizQuestions.filter(q => 
    q.type !== 'welcome' && q.type !== 'section' && q.type !== 'end' && q.type !== 'contact'
  ).length;
  const answeredQuestions = quizQuestions.slice(0, currentStep).filter(q => 
    q.type !== 'welcome' && q.type !== 'section' && q.type !== 'end' && q.type !== 'contact'
  ).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  const handleAnswer = (questionId: string, value: any) => {
    setQuizData((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    // Check if follow-up is needed
    if (currentQuestion.followUp && !showFollowUp) {
      const shouldShowFollowUp = currentQuestion.followUp.condition(quizData[currentQuestion.id]);
      if (shouldShowFollowUp) {
        setShowFollowUp(true);
        return;
      }
    }

    setShowFollowUp(false);
    setDirection(1);
    
    // Check if we should skip to end screen for low revenue
    if (currentQuestion.id === 'q9' && quizData.q9?.includes('Moins de €50K')) {
      // Skip to end
      setCurrentStep(quizQuestions.length - 1);
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, quizQuestions.length - 1));
  };

  const handleBack = () => {
    if (showFollowUp) {
      setShowFollowUp(false);
      return;
    }
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const canProceed = () => {
    if (!currentQuestion.required) return true;
    
    const value = quizData[currentQuestion.id];
    if (currentQuestion.type === 'checkbox' || currentQuestion.type === 'multiple') {
      return value && (Array.isArray(value) ? value.length > 0 : value);
    }
    if (currentQuestion.type === 'scale') {
      return value !== undefined && value !== null;
    }
    if (currentQuestion.type === 'contact') {
      return quizData.firstName && quizData.lastName && quizData.email;
    }
    return !!value;
  };

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress bar */}
        {currentQuestion.type !== 'welcome' && currentQuestion.type !== 'end' && currentQuestion.type !== 'section' && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                Question {answeredQuestions + 1} / {totalQuestions}
              </span>
              <span className="text-sm font-medium text-blue-600">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* Question Card */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
          >
            {currentQuestion.type === 'welcome' && (
              <WelcomeScreen onStart={handleNext} question={currentQuestion} />
            )}

            {currentQuestion.type === 'section' && (
              <SectionScreen onContinue={handleNext} question={currentQuestion} />
            )}

            {currentQuestion.type === 'multiple' && (
              <MultipleChoiceQuestion
                question={currentQuestion}
                value={quizData[currentQuestion.id]}
                onChange={(value) => handleAnswer(currentQuestion.id, value)}
              />
            )}

            {currentQuestion.type === 'checkbox' && (
              <CheckboxQuestion
                question={currentQuestion}
                value={quizData[currentQuestion.id] || []}
                onChange={(value) => handleAnswer(currentQuestion.id, value)}
              />
            )}

            {currentQuestion.type === 'scale' && (
              <>
                <ScaleQuestion
                  question={currentQuestion}
                  value={quizData[currentQuestion.id]}
                  onChange={(value) => handleAnswer(currentQuestion.id, value)}
                />
                {showFollowUp && currentQuestion.followUp && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {currentQuestion.followUp.question}
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      rows={3}
                      maxLength={100}
                      value={quizData[`${currentQuestion.id}_followup`] || ''}
                      onChange={(e) => handleAnswer(`${currentQuestion.id}_followup`, e.target.value)}
                      placeholder="Décrivez votre principale limitation..."
                    />
                  </motion.div>
                )}
              </>
            )}

            {currentQuestion.type === 'contact' && (
              <ContactForm
                question={currentQuestion}
                data={quizData}
                onChange={handleAnswer}
              />
            )}

            {currentQuestion.type === 'end' && (
              <EndScreen data={quizData} analysis={analyzeQuizData(quizData)} />
            )}

            {/* Navigation buttons */}
            {currentQuestion.type !== 'welcome' && currentQuestion.type !== 'end' && currentQuestion.type !== 'section' && (
              <div className="flex gap-4 mt-8">
                {currentStep > 0 && (
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    ← Retour
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {currentQuestion.type === 'contact' ? 'Recevoir mon diagnostic →' : 'Continuer →'}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Component for welcome screen
function WelcomeScreen({ onStart, question }: { onStart: () => void; question: Question }) {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="mb-6"
      >
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-4xl">
          🔍
        </div>
      </motion.div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{question.title}</h1>
      <p className="text-lg text-gray-600 mb-8 whitespace-pre-line">{question.description}</p>
      <button
        onClick={onStart}
        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium text-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 active:scale-95"
      >
        Démarrer l'audit →
      </button>
    </div>
  );
}

// Component for section screen
function SectionScreen({ onContinue, question }: { onContinue: () => void; question: Question }) {
  const colorMap: { [key: number]: string } = {
    1: 'from-blue-500 to-cyan-500',
    2: 'from-orange-500 to-red-500',
    3: 'from-purple-500 to-indigo-500',
  };
  
  const bgColorMap: { [key: number]: string } = {
    1: 'from-blue-50 to-cyan-50',
    2: 'from-orange-50 to-red-50',
    3: 'from-purple-50 to-indigo-50',
  };

  const sectionNum = question.sectionNumber || 1;
  const gradientColor = colorMap[sectionNum] || colorMap[1];
  const bgGradient = bgColorMap[sectionNum] || bgColorMap[1];

  return (
    <div className={`text-center bg-gradient-to-br ${bgGradient} -m-8 md:-m-12 p-8 md:p-12 rounded-2xl`}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="mb-6"
      >
        <div className={`w-24 h-24 mx-auto bg-gradient-to-br ${gradientColor} rounded-3xl flex items-center justify-center text-5xl shadow-lg`}>
          {question.sectionIcon}
        </div>
      </motion.div>
      
      <div className="mb-3">
        <span className={`inline-block px-4 py-1 bg-gradient-to-r ${gradientColor} text-white rounded-full text-sm font-bold`}>
          PARTIE {question.sectionNumber} / 3
        </span>
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900 mb-3">{question.sectionTitle}</h2>
      <p className="text-lg text-gray-600 mb-8">{question.description}</p>
      
      <button
        onClick={onContinue}
        className={`px-8 py-4 bg-gradient-to-r ${gradientColor} text-white rounded-lg font-medium text-lg hover:shadow-lg transition-all transform hover:scale-105 active:scale-95`}
      >
        C'est parti →
      </button>
    </div>
  );
}

// Component for multiple choice questions
function MultipleChoiceQuestion({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{question.title}</h2>
      <div className="space-y-3">
        {question.options?.map((option, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(option)}
            className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
              value === option
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center">
              <div
                className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                  value === option ? 'border-blue-500' : 'border-gray-300'
                }`}
              >
                {value === option && <div className="w-3 h-3 rounded-full bg-blue-500" />}
              </div>
              <span className="font-medium text-gray-800">{option}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Component for checkbox questions
function CheckboxQuestion({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const handleToggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{question.title}</h2>
      <p className="text-sm text-gray-500 mb-6">Plusieurs réponses possibles</p>
      <div className="space-y-3">
        {question.options?.map((option, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleToggle(option)}
            className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
              value.includes(option)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center">
              <div
                className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                  value.includes(option) ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}
              >
                {value.includes(option) && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z" />
                  </svg>
                )}
              </div>
              <span className="font-medium text-gray-800">{option}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Component for scale questions
function ScaleQuestion({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-8">{question.title}</h2>
      <div className="space-y-6">
        <div className="flex justify-between items-center gap-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <motion.button
              key={num}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange(num)}
              className={`w-16 h-16 rounded-full font-bold text-xl transition-all ${
                value === num
                  ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {num}
            </motion.button>
          ))}
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{question.scaleLabels?.min}</span>
          <span>{question.scaleLabels?.max}</span>
        </div>
      </div>
    </div>
  );
}

// Component for contact form
function ContactForm({
  question,
  data,
  onChange,
}: {
  question: Question;
  data: QuizData;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">{question.title}</h2>
      <p className="text-gray-600 mb-6 whitespace-pre-line">{question.description}</p>
      <div className="text-xs text-gray-500 mb-6">💡 Envoi immédiat par email</div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prénom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.firstName || ''}
              onChange={(e) => onChange('firstName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Jean"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.lastName || ''}
              onChange={(e) => onChange('lastName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Dupont"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={data.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="jean.dupont@exemple.fr"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Téléphone <span className="text-gray-400">(optionnel)</span>
          </label>
          <input
            type="tel"
            value={data.phone || ''}
            onChange={(e) => onChange('phone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="+33 6 12 34 56 78"
          />
        </div>
      </div>
    </div>
  );
}

// Component for end screen
function EndScreen({
  data,
  analysis,
}: {
  data: QuizData;
  analysis: ReturnType<typeof analyzeQuizData>;
}) {
  const getEndScreenContent = () => {
    if (data.q9?.includes('Moins de €50K')) {
      return {
        emoji: '🎯',
        title: 'Votre score: Débutant (20/100)',
        message: 'Bonne nouvelle: Vous avez 80 points de progression possible !',
        issues: [
          '❌ Analytics checkout non configuré',
          '❌ Pas de tracking événements',
          '❌ Pas d\'A/B testing',
        ],
        action: '📥 Guide "Analytics Checkout Essentiel"',
        actionDesc: '→ Installez les 5 événements critiques en 30min\n→ Template GA4 prêt à l\'emploi',
        primaryCTA: 'Recevoir le guide →',
        secondaryCTA: 'Réserver un call de 15min (gratuit) →',
        color: 'from-blue-500 to-blue-600',
      };
    }

    if (analysis.expertiseLevel === 'avance' && analysis.frustrationLevel === 'hot_hot_hot') {
      return {
        emoji: '🔥',
        title: `Votre score: Avancé frustré (${analysis.score}/100)`,
        message: 'Vous êtes bon... mais votre plateforme vous limite.',
        issues: [
          '✅ Analytics + tracking OK',
          '✅ Process optimisation en place',
          `❌ Plateforme trop restrictive (score ${analysis.satisfactionScore}/5)`,
          '❌ Impossible de tester vos idées',
        ],
        frustration: analysis.frustrationText,
        action: '→ Audit checkout personnalisé (gratuit)',
        actionDesc: '→ On analyse vos limitations précises\n→ Démo comment débloquer +20-40% conversions',
        primaryCTA: 'Réserver l\'audit (15min) →',
        secondaryCTA: 'Recevoir "7 Fuites Checkout Plateforme" →',
        color: 'from-red-500 to-orange-500',
      };
    }

    // Intermediaire
    return {
      emoji: '💡',
      title: `Votre score: Intermédiaire (${analysis.score}/100)`,
      message: 'Vous avez les bases, mais vous n\'itérez pas assez.',
      issues: [
        '✅ Analytics installé',
        '❌ Pas de framework A/B testing',
        '❌ Optimisations ad-hoc (pas systématique)',
      ],
      action: '📥 Framework "A/B Testing Checkout"',
      actionDesc: '→ 12 tests prioritaires à lancer\n→ Checklist validation statistique\n→ Template tracking résultats',
      primaryCTA: 'Recevoir le framework →',
      secondaryCTA: 'Demander un audit (gratuit) →',
      color: 'from-purple-500 to-blue-500',
    };
  };

  const content = getEndScreenContent();

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="mb-6"
      >
        <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${content.color} rounded-2xl flex items-center justify-center text-4xl`}>
          {content.emoji}
        </div>
      </motion.div>

      <h2 className="text-3xl font-bold text-gray-900 mb-4">{content.title}</h2>
      <p className="text-lg text-gray-600 mb-6">{content.message}</p>

      <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
        {content.frustration && (
          <div className="mb-4 p-3 bg-orange-50 border-l-4 border-orange-500 text-sm">
            <strong>Vous avez identifié:</strong> {content.frustration}
          </div>
        )}
        <div className="space-y-2 mb-4">
          {content.issues.map((issue, index) => (
            <div key={index} className="text-sm font-medium text-gray-700">
              {issue}
            </div>
          ))}
        </div>
        <div className="border-t pt-4">
          <div className="font-bold text-gray-900 mb-2">{content.action}</div>
          <div className="text-sm text-gray-600 whitespace-pre-line">{content.actionDesc}</div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          className={`w-full px-6 py-4 bg-gradient-to-r ${content.color} text-white rounded-lg font-medium text-lg hover:shadow-lg transition-all transform hover:scale-105 active:scale-95`}
        >
          {content.primaryCTA}
        </button>
        <button className="w-full px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all">
          {content.secondaryCTA}
        </button>
      </div>
    </div>
  );
}

