'use client';

import { Card } from '@zedslot/ui';
import type { ResourceData } from './BookingFlow';

interface PractitionerPickerProps {
  resources: ResourceData[];
  selectedId: string | null;
  onSelect: (resource: ResourceData) => void;
}

export function PractitionerPicker({ resources, selectedId, onSelect }: PractitionerPickerProps) {
  return (
    <section aria-label="Choose your practitioner">
      <h2 className="mb-3 text-lg font-semibold">
        Avec qui ?
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {resources.map((resource) => (
          <Card
            key={resource.id}
            variant={selectedId === resource.id ? 'selected' : 'default'}
            interactive
            padding="md"
            onClick={() => onSelect(resource)}
            role="radio"
            aria-checked={selectedId === resource.id}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(resource);
              }
            }}
          >
            <div className="flex min-h-[44px] items-center justify-center">
              <p className="text-center font-medium">{resource.name}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
