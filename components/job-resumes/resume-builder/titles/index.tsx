'use client';

import { useState } from 'react';
import type { ResumeContent, ResumeTargetTitle } from '@/types/resume';
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
import { AddTitleForm } from './add-title-form';
import { TitleList } from './title-list';
import { randomNDigits } from '@/lib/utils';
import { ResumeBuilderCard } from '../resume-builder-card';
import { useResumeBuilder } from '../context/useResumeBuilder';
import { generateId } from '@/lib/resume-content';

export function TitlesSection() {
  const { resume, saveResume } = useResumeBuilder();
  const [addingTitle, setAddingTitle] = useState(false);
  const titles = resume.titles;
  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleAddTitle = () => {
    setAddingTitle(true);
  };

  const handleSaveNewTitle = (content: string) => {
    const newTitle: ResumeTargetTitle = {
      id: generateId('titles'),
      content,
      enabled: true,
    };

    saveResume({ ...resume, titles: [...titles, newTitle] });
    setAddingTitle(false);
  };

  const handleCancelAddTitle = () => {
    setAddingTitle(false);
  };

  const handleUpdateTitle = (updatedTitle: ResumeTargetTitle) => {
    saveResume({
      ...resume,
      titles: titles.map(title => (title.id === updatedTitle.id ? updatedTitle : title)),
    });
  };

  const handleDeleteTitle = (titleId: string) => {
    saveResume({
      ...resume,
      titles: titles.filter(title => title.id !== titleId),
    });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = titles.findIndex(title => title.id === active.id);
      const newIndex = titles.findIndex(title => title.id === over.id);

      saveResume({
        ...resume,
        titles: arrayMove(titles, oldIndex, newIndex),
      });
    }
  };

  return (
    <ResumeBuilderCard
      onAdd={handleAddTitle}
      isAdding={addingTitle}
      title="Target Titles"
      addButtonText="Add Title"
    >
      {addingTitle && <AddTitleForm onSave={handleSaveNewTitle} onCancel={handleCancelAddTitle} />}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={titles.map(title => title.id)}
          strategy={verticalListSortingStrategy}
        >
          <TitleList titles={titles} onUpdate={handleUpdateTitle} onDelete={handleDeleteTitle} />
        </SortableContext>
      </DndContext>
    </ResumeBuilderCard>
  );
}
