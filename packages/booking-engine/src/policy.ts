import type { Booking, Policy, CancellationOutcome } from '@zedslot/domain';

export function applyPolicy(
  booking: Booking,
  policy: Policy,
  now: Date,
): CancellationOutcome {
  const hoursUntilStart =
    (booking.startsAt.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilStart >= policy.freeCancelHours) {
    return { type: 'FREE_CANCEL' };
  }

  if (policy.lateCancelBehavior === 'credit') {
    return { type: 'LATE_CANCEL_CREDIT' };
  }

  return { type: 'LATE_CANCEL_NO_REFUND' };
}

export function canReschedule(
  booking: Booking,
  policy: Policy,
  now: Date,
): boolean {
  const hoursUntilStart =
    (booking.startsAt.getTime() - now.getTime()) / (1000 * 60 * 60);

  return (
    hoursUntilStart >= policy.freeRescheduleHours &&
    booking.rescheduleCount < policy.maxReschedules
  );
}

const policyStrings = {
  fr: {
    freeCancel: (hours: number) =>
      `Annulation gratuite jusqu'à ${hours}h avant le rendez-vous.`,
    lateCancelCredit:
      'En cas d\'annulation tardive, le montant sera crédité sur votre compte.',
    lateCancelNoRefund:
      'Aucun remboursement en cas d\'annulation tardive.',
    reschedule: (hours: number, max: number) =>
      `Reprogrammation gratuite jusqu'à ${hours}h avant (max ${max} fois).`,
  },
  en: {
    freeCancel: (hours: number) =>
      `Free cancellation up to ${hours}h before your booking.`,
    lateCancelCredit:
      'Late cancellations will be credited to your account.',
    lateCancelNoRefund:
      'No refund for late cancellations.',
    reschedule: (hours: number, max: number) =>
      `Free rescheduling up to ${hours}h before (max ${max} times).`,
  },
} as const;

export function formatPolicyText(
  policy: Policy,
  locale: 'fr' | 'en',
): string {
  const s = policyStrings[locale];
  const lines: string[] = [
    s.freeCancel(policy.freeCancelHours),
    policy.lateCancelBehavior === 'credit' ? s.lateCancelCredit : s.lateCancelNoRefund,
    s.reschedule(policy.freeRescheduleHours, policy.maxReschedules),
  ];
  return lines.join(' ');
}
