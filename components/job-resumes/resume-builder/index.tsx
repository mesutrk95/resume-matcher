"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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

import { ExperienceList } from "./experience-list";
import { AddExperienceForm } from "./add-experience-form";
import type { Experience, ResumeContent } from "@/types/resume";
import {
  ResumeScore,
  ResumeBuilderProvider,
} from "./context/ResumeBuilderProvider";
import { useResumeBuilder } from "./context/useResumeBuilder";

type IPropsType = {
  data: ResumeContent;
  resumeScores?: ResumeScore[];
  onUpdate?: (t: ResumeContent) => void;
};

function ResumeBuilderComponent({ data, resumeScores, onUpdate }: IPropsType) {
  // Sample initial data
  const [lastTemplate, setLastTemplate] = useState<string>(
    JSON.stringify(data)
  );
  const [template, setTemplate] = useState<ResumeContent>(data);

  useEffect(() => {
    console.log("updated", template);
    const newTemplate = JSON.stringify(template);

    if (newTemplate !== lastTemplate) {
      console.log(newTemplate);
      onUpdate?.(template);
      setLastTemplate(newTemplate);
    }
  }, [template, lastTemplate, onUpdate]);

  const { setScores } = useResumeBuilder();
  useEffect(() => {
    setScores(
      resumeScores?.reduce((acc, curr) => {
        acc[curr.id!] = {
          score: curr.score,
          matched_keywords: curr.matched_keywords,
        };
        return acc;
      }, {} as Record<string, ResumeScore>)
    );
  }, [resumeScores, setScores]);

  useEffect(() => {
    setTemplate(data);
  }, [data]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // State for adding experience
  const [addingExperience, setAddingExperience] = useState(false);

  // Experience handlers
  const handleAddExperience = () => {
    setAddingExperience(true);
  };

  const handleSaveNewExperience = (
    newExperience: Omit<Experience, "id" | "items" | "enabled">
  ) => {
    const newExp = {
      id: `exp${Date.now()}`,
      ...newExperience,
      enabled: true,
      items: [],
    };

    setTemplate((prev) => {
      const newTemplate = {
        ...prev,
        experiences: [...prev.experiences, newExp],
      };
      return newTemplate;
    });

    setAddingExperience(false);
  };

  const handleCancelAddExperience = () => {
    setAddingExperience(false);
  };

  const handleDragEndExperiences = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTemplate((prev) => {
        const oldIndex = prev.experiences.findIndex(
          (exp) => exp.id === active.id
        );
        const newIndex = prev.experiences.findIndex(
          (exp) => exp.id === over.id
        );
        const newTemplate = {
          ...prev,
          experiences: arrayMove(prev.experiences, oldIndex, newIndex),
        };
        return newTemplate;
      });
    }
  };

  const handleUpdateExperience = (updatedExperience: Experience) => {
    setTemplate((prev) => {
      const newTemplate = {
        ...prev,
        experiences: prev.experiences.map((exp) =>
          exp.id === updatedExperience.id ? updatedExperience : exp
        ),
      };
      return newTemplate;
    });
  };

  const handleDeleteExperience = (experienceId: string) => {
    setTemplate((prev) => {
      const newTemplate = {
        ...prev,
        experiences: prev.experiences.filter((exp) => exp.id !== experienceId),
      };
      return newTemplate;
    });
  };

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Experiences</h2>
        {!addingExperience ? (
          <Button onClick={handleAddExperience}>
            <Plus className="h-4 w-4 mr-1" />
            Add Experience
          </Button>
        ) : null}
      </div>

      {/* Add Experience Form */}
      {addingExperience && (
        <AddExperienceForm
          onSave={handleSaveNewExperience}
          onCancel={handleCancelAddExperience}
        />
      )}

      {/* Experiences List with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEndExperiences}
      >
        <SortableContext
          items={template.experiences.map((exp) => exp.id)}
          strategy={verticalListSortingStrategy}
        >
          <ExperienceList
            experiences={template.experiences}
            onUpdate={handleUpdateExperience}
            onDelete={handleDeleteExperience}
          />
        </SortableContext>
      </DndContext>
    </>
  );
}

export function ResumeBuilder(props: IPropsType) {
  return (
    <ResumeBuilderProvider>
      <ResumeBuilderComponent {...props} />
    </ResumeBuilderProvider>
  );
}
