'use client';

import type { Variation } from '@/types/resume';
import { VariationComponent } from './variation-component';

type VariationListProps = {
  experienceId: string;
  itemId: string;
  variations: Variation[];
  onUpdate: (variation: Variation) => void;
  onDelete: (variationId: string) => void;
};

export function VariationList({
  experienceId,
  itemId,
  variations,
  onUpdate,
  onDelete,
}: VariationListProps) {
  return (
    <div className="space-y-0">
      {variations.map((variation, index) => (
        <VariationComponent
          key={variation.id}
          experienceId={experienceId}
          itemId={itemId}
          variation={variation}
          // isPrimary={index === 0}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
