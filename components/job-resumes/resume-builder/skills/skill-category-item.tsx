// components/job-resumes/resume-builder/skills/skill-category-item.tsx
"use client";

import { useState } from "react";
import type { ResumeSkillSet, ResumeSkillItem } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Edit, GripVertical, Save, Trash2, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SkillItem } from "./skill-item";

type SkillCategoryItemProps = {
  skillSet: ResumeSkillSet;
  onUpdateCategory: (
    categoryId: string,
    updates: Partial<ResumeSkillSet>
  ) => void;
  onDeleteCategory: (categoryId: string) => void;
  onUpdateSkill: (
    skillId: string,
    categoryId: string,
    updates: Partial<ResumeSkillItem>
  ) => void;
  onDeleteSkill: (skillId: string, categoryId: string) => void;
};

export function SkillCategoryItem({
  skillSet,
  onUpdateCategory,
  onDeleteCategory,
  onUpdateSkill,
  onDeleteSkill,
}: SkillCategoryItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(skillSet.category);

  // Set up sortable for the category
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: skillSet.category,
    data: {
      type: "category",
      id: skillSet.category,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const handleToggleEnabled = (checked: boolean) => {
    onUpdateCategory(skillSet.category, { enabled: checked });
  };

  const handleEdit = () => {
    setEditValue(skillSet.category);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editValue.trim()) {
      // Create a new category with the updated name and move all skills
      onUpdateCategory(skillSet.category, { category: editValue.trim() });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (skillSet.category === "Default" && skillSet.skills.length === 0) {
    return null;
  }

  return (
    <div ref={setNodeRef} style={style} className="space-y-2">
      {skillSet.category !== "Default" && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div
              className="cursor-grab text-muted-foreground hover:text-foreground p-1"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5" />
            </div>

            <Checkbox
              id={`category-${skillSet.category}`}
              checked={skillSet.enabled}
              onCheckedChange={handleToggleEnabled}
              className="mr-2"
            />

            {isEditing ? (
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="max-w-xs"
                placeholder="Category name"
              />
            ) : (
              <h3 className="text-md font-medium flex items-center">
                <span
                  className={`${
                    !skillSet.enabled ? "text-muted-foreground" : ""
                  }`}
                >
                  {skillSet.category}
                </span>
                <span className="ml-2 text-muted-foreground text-sm">
                  ({skillSet.skills.filter((s) => s.enabled).length})
                </span>
              </h3>
            )}
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline-destructive"
                  size="sm"
                  onClick={() => onDeleteCategory(skillSet.category)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <div
        className={`
          flex flex-wrap gap-2 min-h-[60px] p-3 rounded-lg transition-colors
          ${
            isDragging
              ? "border-primary bg-primary/5 border-dashed border-2"
              : "border-muted-foreground/20 border "
          }
        `}
      >
        <SortableContext
          items={skillSet.skills.map((skill) => skill.id)}
          strategy={verticalListSortingStrategy}
        >
          {skillSet.skills.map((skill) => (
            <SkillItem
              key={skill.id}
              skill={skill}
              categoryId={skillSet.category}
              onUpdate={(updates) =>
                onUpdateSkill(skill.id, skillSet.category, updates)
              }
              onDelete={() => onDeleteSkill(skill.id, skillSet.category)}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
