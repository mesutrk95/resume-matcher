'use client';

import type { ResumeContent, ResumeEducation } from '@/types/resume';
import { EducationItem } from './education-item';

type EducationListProps = {
  resume: ResumeContent;
  onUpdate: (education: ResumeEducation) => void;
  onDelete: (educationId: string) => void;
};

export function EducationList({ resume, onUpdate, onDelete }: EducationListProps) {
  return (
    <div className="space-y-4">
      {resume.educations.map(education => (
        <EducationItem
          key={education.id}
          education={education}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
