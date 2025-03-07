"use client";

import { useState } from "react";
import type { ResumeContent, ResumeEducation } from "@/types/resume";
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
import { AddEducationForm } from "./add-education-form";
import { EducationList } from "./education-list";

type EducationsSectionProps = {
  resume: ResumeContent;
  onUpdate: (educations: ResumeEducation[]) => void;
};

export function EducationsSection({
  resume,
  onUpdate,
}: EducationsSectionProps) {
  const [addingEducation, setAddingEducation] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddEducation = () => {
    setAddingEducation(true);
  };

  const handleSaveNewEducation = (education: {
    degree: string;
    content: string;
    location: string;
    startDate: string;
    institution: string;
    endDate: string;
  }) => {
    const newEducation: ResumeEducation = {
      id: `edu${Date.now()}`,
      degree: education.degree,
      content: education.content,
      location: education.location,
      startDate: education.startDate,
      endDate: education.endDate,
      institution: education.institution,
      enabled: true,
    };

    onUpdate([...resume.educations, newEducation]);
    setAddingEducation(false);
  };

  const handleCancelAddEducation = () => {
    setAddingEducation(false);
  };

  const handleUpdateEducation = (updatedEducation: ResumeEducation) => {
    onUpdate(
      resume.educations.map((education) =>
        education.id === updatedEducation.id ? updatedEducation : education
      )
    );
  };

  const handleDeleteEducation = (educationId: string) => {
    onUpdate(
      resume.educations.filter((education) => education.id !== educationId)
    );
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = resume.educations.findIndex(
        (education) => education.id === active.id
      );
      const newIndex = resume.educations.findIndex(
        (education) => education.id === over.id
      );

      onUpdate(arrayMove(resume.educations, oldIndex, newIndex));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Education</CardTitle>
        <Button onClick={handleAddEducation} disabled={addingEducation}>
          <Plus className="h-4 w-4 mr-1" />
          Add Education
        </Button>
      </CardHeader>
      <div className="p-6 pt-0">
        {addingEducation && (
          <AddEducationForm
            onSave={handleSaveNewEducation}
            onCancel={handleCancelAddEducation}
          />
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={resume.educations.map((education) => education.id)}
            strategy={verticalListSortingStrategy}
          >
            <EducationList
              resume={resume}
              onUpdate={handleUpdateEducation}
              onDelete={handleDeleteEducation}
            />
          </SortableContext>
        </DndContext>
      </div>
    </Card>
  );
}
