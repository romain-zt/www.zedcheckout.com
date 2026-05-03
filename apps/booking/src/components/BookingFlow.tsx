'use client';

import { useState, useEffect, useCallback } from 'react';
import { ServicePicker } from './ServicePicker';
import { PractitionerPicker } from './PractitionerPicker';
import { SlotPicker } from './SlotPicker';
import { CustomerForm } from './CustomerForm';
import { PackCreditSection } from './PackCreditSection';
import { PaymentSection } from './PaymentSection';
import { ConfirmationScreen } from './ConfirmationScreen';
import { BookingStatusPoller } from './BookingStatusPoller';
import { trackEvent } from '@/lib/analytics';
import { detectLocale, type Locale } from '@/lib/locale';
import { Spinner } from '@zedslot/ui';

type FlowStep =
  | 'loading'
  | 'select_service'
  | 'select_practitioner'
  | 'select_slot'
  | 'customer_info'
  | 'payment'
  | 'polling'
  | 'confirmed'
  | 'failed';

export interface ServiceData {
  id: string;
  name: Record<'fr' | 'en', string>;
  durationMinutes: number;
  priceCents: number;
  requiresResource: boolean;
  requiresRoom: boolean;
  eligibleResourceIds: string[];
  eligibleRoomIds: string[];
}

export interface ResourceData {
  id: string;
  name: string;
}

export interface SlotData {
  startsAt: string;
  endsAt: string;
  resourceId: string | null;
  roomId: string;
}

export interface CustomerData {
  name: string;
  email: string;
  phone: string;
}

interface BookingResult {
  bookingId: string;
  paymentIntentClientSecret: string | null;
  expiresAt: string | null;
  confirmed?: boolean;
}

interface BookingDetails {
  id: string;
  status: string;
  serviceName: Record<'fr' | 'en', string> | null;
  resourceName: string | null;
  startsAt: string;
  endsAt: string;
}

export function BookingFlow() {
  const [locale] = useState<Locale>(detectLocale);
  const [step, setStep] = useState<FlowStep>('loading');
  const [services, setServices] = useState<ServiceData[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const [resources, setResources] = useState<ResourceData[]>([]);
  const [selectedResource, setSelectedResource] = useState<ResourceData | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotData | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pack credit state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [packBalance, setPackBalance] = useState<{ packCreditCents: number; giftCardBalanceCents: number } | null>(null);
  const [useCredit, setUseCredit] = useState(false);

  useEffect(() => {
    async function loadServices() {
      try {
        const res = await fetch('/api/services');
        if (!res.ok) throw new Error('Failed to load services');
        const data = await res.json();
        setServices(data.services);
        setStep('select_service');
        trackEvent('checkout_loaded');
      } catch {
        setError('Unable to load services. Please try again.');
        setStep('select_service');
      }
    }
    loadServices();
  }, []);

  const handleServiceSelect = useCallback(async (service: ServiceData) => {
    setSelectedService(service);
    setSelectedResource(null);
    setSelectedSlot(null);
    setError(null);

    if (service.requiresResource && service.eligibleResourceIds.length > 0) {
      try {
        const res = await fetch(`/api/resources?ids=${service.eligibleResourceIds.join(',')}`);
        if (!res.ok) throw new Error('Failed to load practitioners');
        const data = await res.json();
        setResources(data.resources);

        if (data.resources.length === 1) {
          setSelectedResource(data.resources[0]);
          setStep('select_slot');
          trackEvent('slot_viewed', { serviceId: service.id, resourceId: data.resources[0].id });
        } else {
          setStep('select_practitioner');
        }
      } catch {
        setError('Unable to load practitioners.');
        setStep('select_practitioner');
      }
    } else {
      setStep('select_slot');
      trackEvent('slot_viewed', { serviceId: service.id });
    }
  }, []);

  const handleResourceSelect = useCallback((resource: ResourceData) => {
    setSelectedResource(resource);
    setSelectedSlot(null);
    setStep('select_slot');
    if (selectedService) {
      trackEvent('slot_viewed', { serviceId: selectedService.id, resourceId: resource.id });
    }
  }, [selectedService]);

  const handleSlotSelect = useCallback((slot: SlotData) => {
    setSelectedSlot(slot);
    setStep('customer_info');
    trackEvent('slot_selected', {
      serviceId: selectedService?.id,
      resourceId: slot.resourceId ?? undefined,
      slotStartsAt: slot.startsAt,
    });
  }, [selectedService]);

  const handleCustomerSubmit = useCallback((data: CustomerData) => {
    setCustomerData(data);
    setStep('payment');
  }, []);

  const handleAuthComplete = useCallback((balance: { packCreditCents: number; giftCardBalanceCents: number }) => {
    setIsAuthenticated(true);
    setPackBalance(balance);
  }, []);

  const handleCreateBooking = useCallback(async (): Promise<BookingResult | null> => {
    if (!selectedService || !selectedSlot || !customerData) return null;

    setError(null);

    const totalCredit = (packBalance?.packCreditCents ?? 0) + (packBalance?.giftCardBalanceCents ?? 0);
    const usingCredit = useCredit && totalCredit > 0;
    const creditAmount = usingCredit ? Math.min(totalCredit, selectedService.priceCents) : 0;

    const body: Record<string, unknown> = {
      serviceId: selectedService.id,
      startsAt: selectedSlot.startsAt,
      customer: customerData,
    };

    if (selectedResource) {
      body.resourceId = selectedResource.id;
    }

    if (usingCredit) {
      body.paymentMethod = creditAmount >= selectedService.priceCents ? 'credit' : 'split';
      body.creditAmountCents = creditAmount;
    }

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.status === 409) {
        const data = await res.json();
        setError(data.message || 'That slot was just taken. Please select another.');
        setStep('select_slot');
        return null;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Failed to create booking');
        return null;
      }

      const result: BookingResult = await res.json();
      setBookingResult(result);
      trackEvent('payment_submitted', { bookingId: result.bookingId });

      if (result.confirmed) {
        trackEvent('payment_succeeded', { bookingId: result.bookingId });
        await loadBookingDetails(result.bookingId);
        setStep('confirmed');
      }

      return result;
    } catch {
      setError('Network error. Please try again.');
      return null;
    }
  }, [selectedService, selectedSlot, selectedResource, customerData, packBalance, useCredit]);

  const handlePaymentSuccess = useCallback(async () => {
    if (bookingResult) {
      trackEvent('payment_succeeded', { bookingId: bookingResult.bookingId });
      setStep('polling');
    }
  }, [bookingResult]);

  const handlePaymentError = useCallback((message: string) => {
    trackEvent('payment_failed', { error: message, bookingId: bookingResult?.bookingId });
    setError(message);
  }, [bookingResult]);

  const loadBookingDetails = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`);
      if (res.ok) {
        const data = await res.json();
        setBookingDetails(data);
      }
    } catch {
      // Non-critical; confirmation screen will show partial data
    }
  };

  const handleBookingConfirmed = useCallback(async () => {
    if (bookingResult) {
      trackEvent('booking_confirmed', { bookingId: bookingResult.bookingId });
      await loadBookingDetails(bookingResult.bookingId);
      setStep('confirmed');
    }
  }, [bookingResult]);

  const handleBookingFailed = useCallback(() => {
    setStep('failed');
    setError('Payment could not be completed. Please try again.');
  }, []);

  if (step === 'loading') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Step 1: Service picker — always visible */}
      <ServicePicker
        services={services}
        selectedId={selectedService?.id ?? null}
        locale={locale}
        onSelect={handleServiceSelect}
      />

      {/* Step 2: Practitioner picker — visible when service selected and requires resource */}
      {selectedService && selectedService.requiresResource && resources.length > 1 && (
        <PractitionerPicker
          resources={resources}
          selectedId={selectedResource?.id ?? null}
          onSelect={handleResourceSelect}
        />
      )}

      {/* Step 3: Slot picker — visible when practitioner selected (or not needed) */}
      {selectedService && (step === 'select_slot' || step === 'customer_info' || step === 'payment' || step === 'polling' || step === 'confirmed') && (
        <SlotPicker
          serviceId={selectedService.id}
          resourceId={selectedResource?.id ?? undefined}
          locale={locale}
          onSelect={handleSlotSelect}
          selectedSlot={selectedSlot}
        />
      )}

      {/* Step 4: Customer form — visible when slot selected */}
      {selectedSlot && (step === 'customer_info' || step === 'payment') && (
        <CustomerForm
          locale={locale}
          onSubmit={handleCustomerSubmit}
          disabled={step === 'payment'}
        />
      )}

      {/* Step 5: Pack credit — visible when customer form filled */}
      {customerData && step === 'payment' && (
        <PackCreditSection
          email={customerData.email}
          locale={locale}
          isAuthenticated={isAuthenticated}
          balance={packBalance}
          useCredit={useCredit}
          servicePriceCents={selectedService?.priceCents ?? 0}
          onAuthComplete={handleAuthComplete}
          onToggleCredit={setUseCredit}
        />
      )}

      {/* Step 6: Payment — visible when customer data ready */}
      {customerData && step === 'payment' && (
        <PaymentSection
          servicePriceCents={selectedService?.priceCents ?? 0}
          creditCents={useCredit ? Math.min(
            (packBalance?.packCreditCents ?? 0) + (packBalance?.giftCardBalanceCents ?? 0),
            selectedService?.priceCents ?? 0,
          ) : 0}
          locale={locale}
          onCreateBooking={handleCreateBooking}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          bookingResult={bookingResult}
        />
      )}

      {/* Step 7: Polling — after payment */}
      {step === 'polling' && bookingResult && (
        <BookingStatusPoller
          bookingId={bookingResult.bookingId}
          onConfirmed={handleBookingConfirmed}
          onFailed={handleBookingFailed}
        />
      )}

      {/* Step 8: Confirmation */}
      {step === 'confirmed' && (
        <ConfirmationScreen
          bookingDetails={bookingDetails}
          service={selectedService}
          resource={selectedResource}
          slot={selectedSlot}
          locale={locale}
        />
      )}

      {step === 'failed' && (
        <div className="text-center">
          <p className="mb-4 text-red-600">{error || 'Something went wrong'}</p>
          <button
            onClick={() => {
              setStep('payment');
              setError(null);
              setBookingResult(null);
            }}
            className="min-h-[44px] rounded-lg bg-navy px-6 py-3 text-white"
          >
            {locale === 'fr' ? 'Réessayer' : 'Try again'}
          </button>
        </div>
      )}
    </div>
  );
}
