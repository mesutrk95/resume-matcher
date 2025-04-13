'use client';

import type { Experience } from '@/types/resume';
import { ExperienceItem } from './experience-item';

type ExperienceListProps = {
  experiences: Experience[];
  onUpdate: (experience: Experience) => void;
  onDelete: (experienceId: string) => void;
};

export function ExperienceList({ experiences, onUpdate, onDelete }: ExperienceListProps) {
  return (
    <div className="space-y-4">
      {experiences.map(experience => (
        <ExperienceItem
          key={experience.id}
          experience={experience}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
