'use client';

import { useState } from 'react';
import type { ResumeContent, ResumeProfessionalSummary } from '@/types/resume';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { AddSummaryForm } from './add-summary-form';
import { SummaryList } from './summary-list';
import { randomNDigits } from '@/lib/utils';
import { ResumeBuilderCard } from '../resume-builder-card';
import { useResumeBuilder } from '../context/useResumeBuilder';

export function SummariesSection() {
  const { resume, saveResume } = useResumeBuilder();
  const [addingSummary, setAddingSummary] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleAddSummary = () => {
    setAddingSummary(true);
  };

  const handleSaveNewSummary = (content: string) => {
    const newSummary: ResumeProfessionalSummary = {
      id: `summary_${randomNDigits()}`,
      content,
      enabled: false,
    };

    saveResume({ ...resume, summaries: [...resume.summaries, newSummary] });
    setAddingSummary(false);
  };

  const handleCancelAddSummary = () => {
    setAddingSummary(false);
  };

  const handleUpdateSummary = (updatedSummary: ResumeProfessionalSummary) => {
    let summaries = resume.summaries;
    if (updatedSummary.enabled) {
      summaries = summaries.map(summary =>
        summary.id !== updatedSummary.id ? { ...summary, enabled: false } : updatedSummary,
      );
    }

    saveResume({
      ...resume,
      summaries: summaries.map(summary =>
        summary.id === updatedSummary.id ? updatedSummary : summary,
      ),
    });
  };

  const handleDeleteSummary = (summaryId: string) => {
    saveResume({
      ...resume,
      summaries: resume.summaries.filter(summary => summary.id !== summaryId),
    });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = resume.summaries.findIndex(summary => summary.id === active.id);
      const newIndex = resume.summaries.findIndex(summary => summary.id === over.id);

      saveResume({
        ...resume,
        summaries: arrayMove(resume.summaries, oldIndex, newIndex),
      });
    }
  };

  return (
    <ResumeBuilderCard
      onAdd={handleAddSummary}
      isAdding={addingSummary}
      title="Professional Summaries"
      addButtonText="Add Summary"
    >
      {addingSummary && (
        <AddSummaryForm onSave={handleSaveNewSummary} onCancel={handleCancelAddSummary} />
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={resume.summaries.map(summary => summary.id)}
          strategy={verticalListSortingStrategy}
        >
          <SummaryList
            summaries={resume.summaries}
            onUpdate={handleUpdateSummary}
            onDelete={handleDeleteSummary}
          />
        </SortableContext>
      </DndContext>
    </ResumeBuilderCard>
  );
}
