'use client';

import { Card } from '@zedslot/ui';
import { localizedName, formatPrice, type Locale } from '@/lib/locale';
import type { ServiceData } from './BookingFlow';

interface ServicePickerProps {
  services: ServiceData[];
  selectedId: string | null;
  locale: Locale;
  onSelect: (service: ServiceData) => void;
}

export function ServicePicker({ services, selectedId, locale, onSelect }: ServicePickerProps) {
  const label = locale === 'fr' ? 'Choisissez votre soin' : 'Choose your service';

  if (services.length === 0) {
    return (
      <section aria-label={label}>
        <h2 className="mb-3 text-lg font-semibold">{label}</h2>
        <p className="text-navy/60 text-sm">
          {locale === 'fr' ? 'Aucun soin disponible pour le moment.' : 'No services available at the moment.'}
        </p>
      </section>
    );
  }

  return (
    <section aria-label={label}>
      <h2 className="mb-3 text-lg font-semibold">{label}</h2>
      <div className="grid gap-3">
        {services.map((service) => (
          <Card
            key={service.id}
            variant={selectedId === service.id ? 'selected' : 'default'}
            interactive
            padding="md"
            onClick={() => onSelect(service)}
            role="radio"
            aria-checked={selectedId === service.id}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(service);
              }
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{localizedName(service.name, locale)}</p>
                <p className="text-sm text-navy/60">
                  {service.durationMinutes} min
                </p>
              </div>
              <p className="shrink-0 text-lg font-semibold text-accent">
                {formatPrice(service.priceCents, locale)}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
