'use client';

import type { ResumeTargetTitle } from '@/types/resume';
import { TitleItem } from './title-item';

type TitleListProps = {
  titles: ResumeTargetTitle[];
  onUpdate: (title: ResumeTargetTitle) => void;
  onDelete: (titleId: string) => void;
};

export function TitleList({ titles, onUpdate, onDelete }: TitleListProps) {
  return (
    <div className="space-y-4">
      {titles.map(title => (
        <TitleItem key={title.id} title={title} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </div>
  );
}
