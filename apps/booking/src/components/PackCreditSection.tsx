'use client';

import { useState, useCallback } from 'react';
import { Button, Card, Input, Spinner, Badge } from '@zedslot/ui';
import { formatPrice, type Locale } from '@/lib/locale';

interface PackCreditSectionProps {
  email: string;
  locale: Locale;
  isAuthenticated: boolean;
  balance: { packCreditCents: number; giftCardBalanceCents: number } | null;
  useCredit: boolean;
  servicePriceCents: number;
  onAuthComplete: (balance: { packCreditCents: number; giftCardBalanceCents: number }) => void;
  onToggleCredit: (use: boolean) => void;
}

type AuthState = 'idle' | 'sending' | 'sent' | 'verifying' | 'error';

const labels = {
  fr: {
    title: 'Utiliser mon crédit',
    triggerAuth: 'J\'ai un forfait prépayé',
    sendingLink: 'Envoi du lien...',
    checkEmail: 'Vérifiez votre boîte email',
    checkEmailDesc: 'Cliquez sur le lien reçu pour accéder à votre solde',
    verifying: 'Vérification...',
    errorSending: 'Erreur lors de l\'envoi. Réessayer.',
    balance: 'Votre solde',
    packCredit: 'Crédit forfait',
    giftCard: 'Carte cadeau',
    useCredit: 'Utiliser mon crédit',
    noBalance: 'Aucun crédit disponible',
    coversTotal: 'Couvre le total — pas besoin de carte',
    remaining: 'Reste à payer par carte',
  },
  en: {
    title: 'Use my credit',
    triggerAuth: 'I have a prepaid pack',
    sendingLink: 'Sending link...',
    checkEmail: 'Check your email',
    checkEmailDesc: 'Click the link to access your balance',
    verifying: 'Verifying...',
    errorSending: 'Error sending link. Try again.',
    balance: 'Your balance',
    packCredit: 'Pack credit',
    giftCard: 'Gift card',
    useCredit: 'Use my credit',
    noBalance: 'No credit available',
    coversTotal: 'Covers the total — no card needed',
    remaining: 'Remaining to pay by card',
  },
};

export function PackCreditSection({
  email,
  locale,
  isAuthenticated,
  balance,
  useCredit,
  servicePriceCents,
  onAuthComplete,
  onToggleCredit,
}: PackCreditSectionProps) {
  const t = labels[locale];
  const [authState, setAuthState] = useState<AuthState>('idle');
  const [pollInterval, setPollInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  const handleRequestMagicLink = useCallback(async () => {
    setAuthState('sending');
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, returnTo: '/' }),
      });

      if (!res.ok) {
        setAuthState('error');
        return;
      }

      setAuthState('sent');

      // Poll for session cookie (user clicks magic link in email)
      const interval = setInterval(async () => {
        try {
          const balanceRes = await fetch('/api/customer/balance');
          if (balanceRes.ok) {
            const data = await balanceRes.json();
            clearInterval(interval);
            setPollInterval(null);
            onAuthComplete({
              packCreditCents: data.packCreditCents,
              giftCardBalanceCents: data.giftCardBalanceCents,
            });
            setAuthState('idle');
          }
        } catch {
          // Keep polling
        }
      }, 3000);
      setPollInterval(interval);
    } catch {
      setAuthState('error');
    }
  }, [email, onAuthComplete]);

  // Authenticated: show balance
  if (isAuthenticated && balance) {
    const totalCredit = balance.packCreditCents + balance.giftCardBalanceCents;

    if (totalCredit === 0) {
      return (
        <section aria-label={t.title}>
          <Card variant="muted" padding="md">
            <p className="text-sm text-navy/60">{t.noBalance}</p>
          </Card>
        </section>
      );
    }

    const creditToApply = Math.min(totalCredit, servicePriceCents);
    const cardRemaining = servicePriceCents - creditToApply;

    return (
      <section aria-label={t.title}>
        <h2 className="mb-3 text-lg font-semibold">{t.balance}</h2>
        <Card variant={useCredit ? 'selected' : 'default'} padding="md">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                {balance.packCreditCents > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-navy/60">{t.packCredit}:</span>
                    <span className="font-medium">{formatPrice(balance.packCreditCents, locale)}</span>
                  </div>
                )}
                {balance.giftCardBalanceCents > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-navy/60">{t.giftCard}:</span>
                    <span className="font-medium">{formatPrice(balance.giftCardBalanceCents, locale)}</span>
                  </div>
                )}
              </div>
            </div>

            <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={useCredit}
                onChange={(e) => onToggleCredit(e.target.checked)}
                className="h-5 w-5 rounded border-navy/30 text-navy accent-navy"
              />
              <span className="font-medium">{t.useCredit}</span>
            </label>

            {useCredit && (
              <div className="text-sm">
                {cardRemaining === 0 ? (
                  <Badge variant="success">{t.coversTotal}</Badge>
                ) : (
                  <p className="text-navy/60">
                    {t.remaining}: <span className="font-medium text-navy">{formatPrice(cardRemaining, locale)}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>
      </section>
    );
  }

  // Not authenticated: show auth trigger
  return (
    <section aria-label={t.title}>
      <Card variant="muted" padding="md">
        {authState === 'idle' && (
          <Button
            variant="ghost"
            size="md"
            fullWidth
            onClick={handleRequestMagicLink}
          >
            {t.triggerAuth}
          </Button>
        )}

        {authState === 'sending' && (
          <div className="flex items-center justify-center gap-2 py-2">
            <Spinner size="sm" />
            <span className="text-sm">{t.sendingLink}</span>
          </div>
        )}

        {authState === 'sent' && (
          <div className="flex flex-col items-center gap-2 py-2 text-center">
            <p className="font-medium">{t.checkEmail}</p>
            <p className="text-sm text-navy/60">{t.checkEmailDesc}</p>
            <Spinner size="sm" />
          </div>
        )}

        {authState === 'error' && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-red-600">{t.errorSending}</p>
            <Button variant="ghost" size="sm" onClick={handleRequestMagicLink}>
              {locale === 'fr' ? 'Réessayer' : 'Retry'}
            </Button>
          </div>
        )}
      </Card>
    </section>
  );
}
