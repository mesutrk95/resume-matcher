// components/job-resumes/resume-builder/skills/index.tsx
"use client";

import { useState } from "react";
import type { ResumeSkillItem, ResumeSkillSet } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
import { SkillCategoryItem } from "./skill-category-item";

type SkillsSectionProps = {};

// Drag types
type DragData = {
  type: "skill" | "category";
  id: string;
  categoryId?: string;
};

export function SkillsSection({}: SkillsSectionProps) {
  const { resume, saveResume } = useResumeBuilder();
  const [addingSkills, setAddingSkills] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [activeItem, setActiveItem] = useState<{
    type: "skill" | "category";
    skill?: ResumeSkillItem | null;
    category: ResumeSkillSet;
  } | null>(null);
  const [selectedCategoryForSkills, setSelectedCategoryForSkills] = useState<
    string | null
  >(null);

  // Get unique categories
  const skillSets = resume.skills || [];

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

  const handleAddSkills = () => {
    // Set the first category as default if not selected
    if (!selectedCategoryForSkills && skillSets.length > 0) {
      setSelectedCategoryForSkills(skillSets[0].category);
    }
    setAddingSkills(true);
  };

  const handleSaveNewSkills = (skillContents: string[], categoryId: string) => {
    // Find the target category
    const targetCategoryIndex = skillSets.findIndex(
      (set) => set.category === categoryId
    );

    if (targetCategoryIndex === -1) {
      // Create new category if it doesn't exist
      const newSkillSet: ResumeSkillSet = {
        category: categoryId,
        enabled: true,
        skills: skillContents.map((content) => ({
          id: `skill_${randomNDigits()}`,
          content,
          enabled: true,
        })),
      };

      saveResume({ ...resume, skills: [...skillSets, newSkillSet] });
    } else {
      // Add skills to existing category
      const updatedSkillSets = [...skillSets];
      const skillsToAdd = skillContents.map((content) => ({
        id: `skill_${randomNDigits()}`,
        content,
        enabled: true,
      }));

      updatedSkillSets[targetCategoryIndex] = {
        ...updatedSkillSets[targetCategoryIndex],
        skills: [
          ...updatedSkillSets[targetCategoryIndex].skills,
          ...skillsToAdd,
        ],
      };

      saveResume({ ...resume, skills: updatedSkillSets });
    }

    setAddingSkills(false);
  };

  const handleAddCategory = () => {
    setAddingCategory(true);
  };

  const handleSaveNewCategory = (category: string) => {
    // Create a new empty category
    const newSkillSet: ResumeSkillSet = {
      category,
      enabled: true,
      skills: [],
    };

    saveResume({ ...resume, skills: [...skillSets, newSkillSet] });
    setAddingCategory(false);
    // Automatically open the add skills dialog for the new category
    setSelectedCategoryForSkills(category);
    setAddingSkills(true);
  };

  const handleUpdateSkill = (
    skillId: string,
    categoryId: string,
    updatedSkill: Partial<ResumeSkillItem>
  ) => {
    const updatedSkillSets = skillSets.map((set) => {
      if (set.category === categoryId) {
        return {
          ...set,
          skills: set.skills.map((skill) =>
            skill.id === skillId ? { ...skill, ...updatedSkill } : skill
          ),
        };
      }
      return set;
    });

    saveResume({ ...resume, skills: updatedSkillSets });
  };

  const handleUpdateCategory = (
    categoryId: string,
    updates: Partial<ResumeSkillSet>
  ) => {
    const updatedSkillSets = skillSets.map((set) =>
      set.category === categoryId ? { ...set, ...updates } : set
    );

    saveResume({ ...resume, skills: updatedSkillSets });
  };

  const handleDeleteSkill = (skillId: string, categoryId: string) => {
    const updatedSkillSets = skillSets.map((set) => {
      if (set.category === categoryId) {
        return {
          ...set,
          skills: set.skills.filter((skill) => skill.id !== skillId),
        };
      }
      return set;
    });

    saveResume({ ...resume, skills: updatedSkillSets });
  };

  const handleDeleteCategory = (categoryId: string) => {
    const updatedSkillSets = skillSets.filter(
      (set) => set.category !== categoryId
    );
    saveResume({ ...resume, skills: updatedSkillSets });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const { id } = active;

    // Parse the drag data to determine if it's a skill or category
    const dragData = active.data.current as DragData;

    if (dragData.type === "skill") {
      // Find the skill item
      const category = skillSets.find(
        (set) => set.category === dragData.categoryId
      );
      const skill = category?.skills.find((s) => s.id === id);
      if (skill && category) {
        setActiveItem({ type: "skill", skill, category });
      }
    } else if (dragData.type === "category") {
      // Find the category
      const category = skillSets.find((set) => set.category === id);
      if (category) {
        setActiveItem({ type: "category", category });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const activeData = active.data.current as DragData;
    const overId = over.id.toString();

    // Handle category reordering
    if (activeData.type === "category") {
      const activeCategoryId = active.id.toString();

      // If over another category, reorder categories
      if (
        overId !== activeCategoryId &&
        skillSets.some((set) => set.category === overId)
      ) {
        const oldIndex = skillSets.findIndex(
          (set) => set.category === activeCategoryId
        );
        const newIndex = skillSets.findIndex((set) => set.category === overId);

        if (oldIndex !== -1 && newIndex !== -1) {
          saveResume({
            ...resume,
            skills: arrayMove(skillSets, oldIndex, newIndex),
          });
        }
      }
    }
    // Handle skill reordering or moving between categories
    else if (activeData.type === "skill") {
      const activeSkillId = active.id.toString();
      const sourceCategoryId = activeData.categoryId;

      // Check if dropping onto a category
      const targetCategory = skillSets.find((set) => set.category === overId);
      if (targetCategory && sourceCategoryId !== overId) {
        // Move skill to a different category
        const sourceCategory = skillSets.find(
          (set) => set.category === sourceCategoryId
        );
        if (sourceCategory) {
          const skill = sourceCategory.skills.find(
            (s) => s.id === activeSkillId
          );
          if (skill) {
            // Remove from source category
            const updatedSourceCategory = {
              ...sourceCategory,
              skills: sourceCategory.skills.filter(
                (s) => s.id !== activeSkillId
              ),
            };

            // Add to target category
            const updatedTargetCategory = {
              ...targetCategory,
              skills: [...targetCategory.skills, skill],
            };

            // Update both categories
            const updatedSkillSets = skillSets.map((set) => {
              if (set.category === sourceCategoryId)
                return updatedSourceCategory;
              if (set.category === overId) return updatedTargetCategory;
              return set;
            });

            saveResume({ ...resume, skills: updatedSkillSets });
          }
        }
        return;
      }

      // Check if dropping onto another skill
      const overData = over.data.current as DragData;
      if (overData?.type === "skill") {
        const overSkillId = over.id.toString();
        const overCategoryId = overData.categoryId;

        // If same category, reorder within category
        if (sourceCategoryId === overCategoryId) {
          const categoryIndex = skillSets.findIndex(
            (set) => set.category === sourceCategoryId
          );
          if (categoryIndex !== -1) {
            const category = skillSets[categoryIndex];
            const oldIndex = category.skills.findIndex(
              (s) => s.id === activeSkillId
            );
            const newIndex = category.skills.findIndex(
              (s) => s.id === overSkillId
            );

            if (oldIndex !== -1 && newIndex !== -1) {
              const updatedSkills = arrayMove(
                category.skills,
                oldIndex,
                newIndex
              );
              const updatedSkillSets = [...skillSets];
              updatedSkillSets[categoryIndex] = {
                ...category,
                skills: updatedSkills,
              };

              saveResume({ ...resume, skills: updatedSkillSets });
            }
          }
        }
        // If different category, move to new category
        else {
          const sourceCategory = skillSets.find(
            (set) => set.category === sourceCategoryId
          );
          const targetCategory = skillSets.find(
            (set) => set.category === overCategoryId
          );

          if (sourceCategory && targetCategory) {
            const skill = sourceCategory.skills.find(
              (s) => s.id === activeSkillId
            );
            if (skill) {
              // Remove from source category
              const updatedSourceCategory = {
                ...sourceCategory,
                skills: sourceCategory.skills.filter(
                  (s) => s.id !== activeSkillId
                ),
              };

              // Add to target category at specific position
              const targetSkills = [...targetCategory.skills];
              const insertIndex = targetSkills.findIndex(
                (s) => s.id === overSkillId
              );
              if (insertIndex !== -1) {
                targetSkills.splice(insertIndex, 0, skill);
              } else {
                targetSkills.push(skill);
              }

              const updatedTargetCategory = {
                ...targetCategory,
                skills: targetSkills,
              };

              // Update both categories
              const updatedSkillSets = skillSets.map((set) => {
                if (set.category === sourceCategoryId)
                  return updatedSourceCategory;
                if (set.category === overCategoryId)
                  return updatedTargetCategory;
                return set;
              });

              saveResume({ ...resume, skills: updatedSkillSets });
            }
          }
        }
      }
    }
  };

  const handleSelectAll = () => {
    const updatedSkillSets = skillSets.map((set) => ({
      ...set,
      enabled: true,
      skills: set.skills.map((skill) => ({ ...skill, enabled: true })),
    }));

    saveResume({ ...resume, skills: updatedSkillSets });
  };

  const handleDeselectAll = () => {
    const updatedSkillSets = skillSets.map((set) => ({
      ...set,
      enabled: false,
      skills: set.skills.map((skill) => ({ ...skill, enabled: false })),
    }));

    saveResume({ ...resume, skills: updatedSkillSets });
  };

  const getExistingCategories = () => skillSets.map((set) => set.category);

  return (
    <ResumeBuilderCard
      title="Skills"
      buttons={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleAddCategory}>
            <Plus className="h-4 w-4 mr-0" />
            Category
          </Button>
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            Check All
          </Button>
          <Button variant="outline" size="sm" onClick={handleDeselectAll}>
            Uncheck All
          </Button>

          <Button size="sm" onClick={handleAddSkills}>
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
          <SortableContext
            items={skillSets.map((set) => set.category)}
            strategy={verticalListSortingStrategy}
          >
            {skillSets.map((skillSet) => (
              <SkillCategoryItem
                key={skillSet.category}
                skillSet={skillSet}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
                onUpdateSkill={handleUpdateSkill}
                onDeleteSkill={handleDeleteSkill}
              />
            ))}
          </SortableContext>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeItem && activeItem.type === "skill" && activeItem.skill && (
            <div className="opacity-80">
              <SkillItem
                skill={activeItem.skill as ResumeSkillItem}
                categoryId={activeItem.category.category || ""}
                onUpdate={(updatedSkill) => {
                  const skillId = activeItem.skill!.id;
                  const categoryId = activeItem.category.category || "";
                  handleUpdateSkill(skillId, categoryId, updatedSkill);
                }}
                onDelete={() => {
                  const skillId = activeItem.skill!.id;
                  const categoryId = activeItem.category.category || "";
                  handleDeleteSkill(skillId, categoryId);
                }}
                isDragging
              />
            </div>
          )}
          {activeItem &&
            activeItem.type === "category" &&
            activeItem.category && (
              <div className="opacity-80 border rounded-lg p-3 bg-background">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">
                    {(activeItem.category as ResumeSkillSet).category}
                  </h3>
                </div>
              </div>
            )}
        </DragOverlay>
      </DndContext>

      <AddSkillsDialog
        open={addingSkills}
        onOpenChange={setAddingSkills}
        onSave={handleSaveNewSkills}
        categories={getExistingCategories()}
        selectedCategory={selectedCategoryForSkills}
      />

      <AddCategoryDialog
        open={addingCategory}
        onOpenChange={setAddingCategory}
        onSave={handleSaveNewCategory}
        existingCategories={getExistingCategories()}
      />
    </ResumeBuilderCard>
  );
}
