import type { Locale } from './types';

const copy = {
  confirmation: {
    fr: {
      subject: (serviceName: string) => `Réservation confirmée — ${serviceName}`,
      preview: (serviceName: string) => `Votre réservation pour ${serviceName} est confirmée`,
      heading: 'Réservation confirmée',
      greeting: (name: string) => `Bonjour ${name},`,
      intro: 'Votre réservation est confirmée. Voici les détails :',
      serviceLabel: 'Soin',
      practitionerLabel: 'Praticien(ne)',
      roomLabel: 'Salle',
      dateTimeLabel: 'Date et heure',
      addressLabel: 'Adresse',
      contactLabel: 'Contact',
      addToCalendar: 'Ajouter au calendrier',
      googleCalendar: 'Google Calendar',
      appleCalendar: 'Apple Calendar',
      downloadIcs: 'Télécharger (.ics)',
      manageBooking: 'Gérer ma réservation',
      policyHeading: 'Conditions d\'annulation',
      footer: 'À bientôt !',
    },
    en: {
      subject: (serviceName: string) => `Booking confirmed — ${serviceName}`,
      preview: (serviceName: string) => `Your booking for ${serviceName} is confirmed`,
      heading: 'Booking confirmed',
      greeting: (name: string) => `Hi ${name},`,
      intro: 'Your booking is confirmed. Here are the details:',
      serviceLabel: 'Service',
      practitionerLabel: 'Practitioner',
      roomLabel: 'Room',
      dateTimeLabel: 'Date & time',
      addressLabel: 'Address',
      contactLabel: 'Contact',
      addToCalendar: 'Add to calendar',
      googleCalendar: 'Google Calendar',
      appleCalendar: 'Apple Calendar',
      downloadIcs: 'Download (.ics)',
      manageBooking: 'Manage my booking',
      policyHeading: 'Cancellation policy',
      footer: 'See you soon!',
    },
  },
  reminder: {
    fr: {
      subject: (serviceName: string) => `Rappel — ${serviceName} demain`,
      preview: (serviceName: string) => `Votre rendez-vous pour ${serviceName} est demain`,
      heading: 'Votre rendez-vous est demain',
      greeting: (name: string) => `Bonjour ${name},`,
      intro: (hoursUntil: number) =>
        `Petit rappel : votre rendez-vous est dans ${hoursUntil}h.`,
      serviceLabel: 'Soin',
      practitionerLabel: 'Praticien(ne)',
      roomLabel: 'Salle',
      dateTimeLabel: 'Date et heure',
      addressLabel: 'Adresse',
      contactLabel: 'Contact',
      addToCalendar: 'Ajouter au calendrier',
      googleCalendar: 'Google Calendar',
      appleCalendar: 'Apple Calendar',
      downloadIcs: 'Télécharger (.ics)',
      manageBooking: 'Gérer ma réservation',
      policyHeading: 'Conditions d\'annulation',
      footer: 'À demain !',
    },
    en: {
      subject: (serviceName: string) => `Reminder — ${serviceName} tomorrow`,
      preview: (serviceName: string) => `Your appointment for ${serviceName} is tomorrow`,
      heading: 'Your appointment is tomorrow',
      greeting: (name: string) => `Hi ${name},`,
      intro: (hoursUntil: number) =>
        `Just a reminder: your appointment is in ${hoursUntil} hours.`,
      serviceLabel: 'Service',
      practitionerLabel: 'Practitioner',
      roomLabel: 'Room',
      dateTimeLabel: 'Date & time',
      addressLabel: 'Address',
      contactLabel: 'Contact',
      addToCalendar: 'Add to calendar',
      googleCalendar: 'Google Calendar',
      appleCalendar: 'Apple Calendar',
      downloadIcs: 'Download (.ics)',
      manageBooking: 'Manage my booking',
      policyHeading: 'Cancellation policy',
      footer: 'See you tomorrow!',
    },
  },
  cancellation: {
    fr: {
      subject: (serviceName: string) => `Annulation — ${serviceName}`,
      preview: (serviceName: string) => `Votre réservation pour ${serviceName} a été annulée`,
      heading: 'Réservation annulée',
      greeting: (name: string) => `Bonjour ${name},`,
      intro: 'Votre réservation a été annulée. Voici le récapitulatif :',
      serviceLabel: 'Soin',
      dateTimeLabel: 'Date et heure',
      refundHeading: 'Détail du remboursement',
      toCardLabel: 'Remboursé sur carte',
      toPackLabel: 'Crédité sur votre Pack',
      toGiftCardLabel: 'Crédité sur carte cadeau',
      totalLabel: 'Total remboursé',
      noRefund: 'Aucun remboursement applicable.',
      footer: 'Une question ? Répondez à cet email.',
    },
    en: {
      subject: (serviceName: string) => `Cancellation — ${serviceName}`,
      preview: (serviceName: string) => `Your booking for ${serviceName} has been cancelled`,
      heading: 'Booking cancelled',
      greeting: (name: string) => `Hi ${name},`,
      intro: 'Your booking has been cancelled. Here\'s a summary:',
      serviceLabel: 'Service',
      dateTimeLabel: 'Date & time',
      refundHeading: 'Refund breakdown',
      toCardLabel: 'Refunded to card',
      toPackLabel: 'Credited to your Pack',
      toGiftCardLabel: 'Credited to gift card',
      totalLabel: 'Total refunded',
      noRefund: 'No refund applicable.',
      footer: 'Questions? Reply to this email.',
    },
  },
} as const;

export function getConfirmationCopy(locale: Locale) {
  return copy.confirmation[locale];
}

export function getReminderCopy(locale: Locale) {
  return copy.reminder[locale];
}

export function getCancellationCopy(locale: Locale) {
  return copy.cancellation[locale];
}
