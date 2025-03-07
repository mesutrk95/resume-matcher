import { Button } from "@/components/ui/button";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { ExperienceList } from "./experience-list";
import { Experience, ResumeContent } from "@/types/resume";
import { useState } from "react";
import { AddExperienceForm } from "./add-experience-form";

type ExperiencesSectionProps = {
  resume: ResumeContent;
  onUpdate: (experiences: Experience[]) => void;
};

export function ExperiencesSection({
  resume,
  onUpdate,
}: ExperiencesSectionProps) {
  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [addingExperience, setAddingExperience] = useState(false);

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

    onUpdate([...resume.experiences, newExp]);

    setAddingExperience(false);
  };

  const handleCancelAddExperience = () => {
    setAddingExperience(false);
  };

  const handleDragEndExperiences = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = resume.experiences.findIndex(
        (exp) => exp.id === active.id
      );
      const newIndex = resume.experiences.findIndex(
        (exp) => exp.id === over.id
      );
      const experiences = arrayMove(resume.experiences, oldIndex, newIndex);
      onUpdate(experiences);
    }
  };

  const handleUpdateExperience = (updatedExperience: Experience) => {
    onUpdate(
      resume.experiences.map((exp) =>
        exp.id === updatedExperience.id ? updatedExperience : exp
      )
    );
  };

  const handleDeleteExperience = (experienceId: string) => {
    onUpdate(resume.experiences.filter((exp) => exp.id !== experienceId));
  };

  return (
    <>
      <div className="flex justify-between items-center">
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
          items={resume.experiences.map((exp) => exp.id)}
          strategy={verticalListSortingStrategy}
        >
          <ExperienceList
            experiences={resume.experiences}
            onUpdate={handleUpdateExperience}
            onDelete={handleDeleteExperience}
          />
        </SortableContext>
      </DndContext>
    </>
  );
}
