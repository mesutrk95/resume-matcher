"use client";

import { useState } from "react";
import type { ResumeContent, ResumeTargetTitle } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AddTitleForm } from "./add-title-form";
import { TitleList } from "./title-list";
import { randomNDigits } from "@/lib/utils";

type TitlesSectionProps = {
  resume: ResumeContent;
  onUpdate: (titles: ResumeTargetTitle[]) => void;
};

export function TitlesSection({ resume, onUpdate }: TitlesSectionProps) {
  const [addingTitle, setAddingTitle] = useState(false);
  const titles = resume.titles;
  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddTitle = () => {
    setAddingTitle(true);
  };

  const handleSaveNewTitle = (content: string) => {
    const newTitle: ResumeTargetTitle = {
      id: `title_${randomNDigits()}`,
      content,
      enabled: true,
    };

    onUpdate([...titles, newTitle]);
    setAddingTitle(false);
  };

  const handleCancelAddTitle = () => {
    setAddingTitle(false);
  };

  const handleUpdateTitle = (updatedTitle: ResumeTargetTitle) => {
    onUpdate(
      titles.map((title) =>
        title.id === updatedTitle.id ? updatedTitle : title
      )
    );
  };

  const handleDeleteTitle = (titleId: string) => {
    onUpdate(titles.filter((title) => title.id !== titleId));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = titles.findIndex((title) => title.id === active.id);
      const newIndex = titles.findIndex((title) => title.id === over.id);

      onUpdate(arrayMove(titles, oldIndex, newIndex));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Target Titles</CardTitle>
        <Button onClick={handleAddTitle} disabled={addingTitle}>
          <Plus className="h-4 w-4 mr-1" />
          Add Title
        </Button>
      </CardHeader>
      <div className="p-6 pt-0">
        {addingTitle && (
          <AddTitleForm
            onSave={handleSaveNewTitle}
            onCancel={handleCancelAddTitle}
          />
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={titles.map((title) => title.id)}
            strategy={verticalListSortingStrategy}
          >
            <TitleList
              titles={titles}
              onUpdate={handleUpdateTitle}
              onDelete={handleDeleteTitle}
            />
          </SortableContext>
        </DndContext>
      </div>
    </Card>
  );
}
