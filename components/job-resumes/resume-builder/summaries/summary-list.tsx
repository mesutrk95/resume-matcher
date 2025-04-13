'use client';

import type { ResumeProfessionalSummary } from '@/types/resume';
import { SummaryItem } from './summary-item';

type SummaryListProps = {
  summaries: ResumeProfessionalSummary[];
  onUpdate: (summary: ResumeProfessionalSummary) => void;
  onDelete: (summaryId: string) => void;
};

export function SummaryList({ summaries, onUpdate, onDelete }: SummaryListProps) {
  return (
    <div className="space-y-4">
      {summaries.map(summary => (
        <SummaryItem key={summary.id} summary={summary} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </div>
  );
}
