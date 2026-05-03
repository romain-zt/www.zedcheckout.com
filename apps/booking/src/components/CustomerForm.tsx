'use client';

import { useState, type FormEvent } from 'react';
import { Input, Button } from '@zedslot/ui';
import type { Locale } from '@/lib/locale';
import type { CustomerData } from './BookingFlow';

interface CustomerFormProps {
  locale: Locale;
  onSubmit: (data: CustomerData) => void;
  disabled: boolean;
}

const labels = {
  fr: {
    title: 'Vos coordonnées',
    name: 'Nom complet',
    email: 'Email',
    phone: 'Téléphone (optionnel)',
    submit: 'Continuer',
    nameRequired: 'Veuillez entrer votre nom',
    emailRequired: 'Veuillez entrer un email valide',
    namePlaceholder: 'Marie Dupont',
    emailPlaceholder: 'marie@email.com',
    phonePlaceholder: '+33 6 12 34 56 78',
  },
  en: {
    title: 'Your details',
    name: 'Full name',
    email: 'Email',
    phone: 'Phone (optional)',
    submit: 'Continue',
    nameRequired: 'Please enter your name',
    emailRequired: 'Please enter a valid email',
    namePlaceholder: 'Jane Smith',
    emailPlaceholder: 'jane@email.com',
    phonePlaceholder: '+1 234 567 8900',
  },
};

export function CustomerForm({ locale, onSubmit, disabled }: CustomerFormProps) {
  const t = labels[locale];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const newErrors: { name?: string; email?: string } = {};

    if (!name.trim()) newErrors.name = t.nameRequired;
    if (!email.trim() || !email.includes('@')) newErrors.email = t.emailRequired;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit({ name: name.trim(), email: email.trim(), phone: phone.trim() });
  }

  return (
    <section aria-label={t.title}>
      <h2 className="mb-3 text-lg font-semibold">{t.title}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          label={t.name}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.namePlaceholder}
          error={errors.name}
          required
          disabled={disabled}
          autoComplete="name"
        />
        <Input
          label={t.email}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.emailPlaceholder}
          error={errors.email}
          required
          disabled={disabled}
          autoComplete="email"
        />
        <Input
          label={t.phone}
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t.phonePlaceholder}
          disabled={disabled}
          autoComplete="tel"
        />
        {!disabled && (
          <Button type="submit" variant="primary" size="lg" fullWidth className="mt-2">
            {t.submit}
          </Button>
        )}
      </form>
    </section>
  );
}
