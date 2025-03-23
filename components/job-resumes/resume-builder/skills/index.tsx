"use client";

import { useState } from "react";
import type { ResumeContent, ResumeSkill } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ArrowUpDown } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SkillItem } from "./skill-item";
import { AddSkillsDialog } from "./add-skills-dialog";
import { AddCategoryDialog } from "./add-category-dialog";
import { randomNDigits } from "@/lib/utils";
import { ResumeBuilderCard } from "../resume-builder-card";
import { useResumeBuilder } from "../context/useResumeBuilder";

type SkillsSectionProps = {};

export function SkillsSection({}: SkillsSectionProps) {
  const { resume, saveResume } = useResumeBuilder();
  const [addingSkills, setAddingSkills] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [sortAscending, setSortAscending] = useState(true);
  const [activeSkill, setActiveSkill] = useState<ResumeSkill | null>(null);

  const skills = resume.skills;

  // Get unique categories
  const categories = Array.from(new Set(skills.map((skill) => skill.category)));

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddSkills = (newSkills: string[], category: string) => {
    const skillsToAdd = newSkills.map((skillName) => ({
      id: `skill_${randomNDigits()}`,
      content: skillName.trim(),
      category,
      enabled: true,
    }));

    saveResume({ ...resume, skills: [...skills, ...skillsToAdd] });
    setAddingSkills(false);
  };

  const handleAddCategory = (category: string) => {
    // Just close the dialog - the category will be created when skills are added to it
    setAddingCategory(false);
  };

  const handleUpdateSkill = (updatedSkill: ResumeSkill) => {
    saveResume({
      ...resume,
      skills: skills.map((skill) =>
        skill.id === updatedSkill.id ? updatedSkill : skill
      ),
    });
  };

  const handleDeleteSkill = (skillId: string) => {
    saveResume({
      ...resume,
      skills: skills.filter((skill) => skill.id !== skillId),
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedSkill = skills.find((skill) => skill.id === active.id);
    if (draggedSkill) {
      setActiveSkill(draggedSkill);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveSkill(null);

    if (!over) return;

    // If dropping into a category
    if (over.id.toString().startsWith("category-")) {
      const newCategory = over.id.toString().replace("category-", "");
      const draggedSkill = skills.find((s) => s.id === active.id);

      if (draggedSkill && draggedSkill.category !== newCategory) {
        saveResume({
          ...resume,
          skills: skills.map((skill) =>
            skill.id === active.id ? { ...skill, category: newCategory } : skill
          ),
        });
      }
      return;
    }

    // If reordering within the same category
    if (active.id !== over.id) {
      const oldIndex = skills.findIndex((skill) => skill.id === active.id);
      const newIndex = skills.findIndex((skill) => skill.id === over.id);

      saveResume({
        ...resume,
        skills: arrayMove(skills, oldIndex, newIndex),
      });
    }
  };

  const toggleSort = () => {
    const sortedSkills = [...skills].sort((a, b) => {
      const comparison = a.content.localeCompare(b.content);
      return sortAscending ? comparison : -comparison;
    });
    setSortAscending(!sortAscending);
    saveResume({
      ...resume,
      skills: sortedSkills,
    });
  };

  const handleSelectAll = () => {
    saveResume({
      ...resume,
      skills: skills.map((s) => ({ ...s, enabled: true })),
    });
  };
  const handleDeselectAll = () => {
    saveResume({
      ...resume,
      skills: skills.map((s) => ({ ...s, enabled: false })),
    });
  };

  return (
    <ResumeBuilderCard
      title="Skills"
      buttons={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAddingCategory(true)}
          >
            <Plus className="h-4 w-4 mr-0" />
            Category
          </Button>
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            Check All
          </Button>
          <Button variant="outline" size="sm" onClick={handleDeselectAll}>
            Uncheck All
          </Button>

          <Button size="sm" onClick={() => setAddingSkills(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Skills
          </Button>
        </div>
      }
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-6">
          {categories.map((category) => (
            <CategorySection
              key={category}
              category={category}
              skills={skills.filter((s) => s.category === category)}
              onUpdate={handleUpdateSkill}
              onDelete={handleDeleteSkill}
            />
          ))}
        </div>

        <DragOverlay>
          {activeSkill && (
            <div className="opacity-80">
              <SkillItem
                skill={activeSkill}
                onUpdate={handleUpdateSkill}
                onDelete={handleDeleteSkill}
                isDragging
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <AddSkillsDialog
        open={addingSkills}
        onOpenChange={setAddingSkills}
        onSave={handleAddSkills}
        categories={categories}
      />

      <AddCategoryDialog
        open={addingCategory}
        onOpenChange={setAddingCategory}
        onSave={handleAddCategory}
        existingCategories={categories}
      />
    </ResumeBuilderCard>
  );
}

type CategorySectionProps = {
  category: string;
  skills: ResumeSkill[];
  onUpdate: (skill: ResumeSkill) => void;
  onDelete: (skillId: string) => void;
};

function CategorySection({
  category,
  skills,
  onUpdate,
  onDelete,
}: CategorySectionProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `category-${category}`,
  });

  return (
    <div className="space-y-2">
      <h3 className="text-md font-medium">
        {category} ({skills.filter((s) => s.enabled).length})
      </h3>
      <div
        ref={setNodeRef}
        className={`
          flex flex-wrap gap-2 min-h-[60px] p-3 rounded-lg border-2 transition-colors
          ${
            isOver
              ? "border-primary bg-primary/5 border-dashed"
              : "border-muted-foreground/20 border-dashed"
          }
        `}
      >
        <SortableContext
          items={skills.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {skills.map((skill) => (
            <SkillItem
              key={skill.id}
              skill={skill}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
