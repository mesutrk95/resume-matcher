// components/job-resumes/resume-builder/skills/skill-item.tsx
"use client";

import { useState } from "react";
import type { ResumeSkillItem } from "@/types/resume";
import { Checkbox } from "@/components/ui/checkbox";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";

type SkillItemProps = {
  skill: ResumeSkillItem;
  categoryId: string;
  onUpdate: (updates: Partial<ResumeSkillItem>) => void;
  onDelete: () => void;
  isDragging?: boolean;
};

export function SkillItem({
  skill,
  categoryId,
  onUpdate,
  onDelete,
  isDragging = false,
}: SkillItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: skill.id,
    data: {
      type: "skill",
      id: skill.id,
      categoryId: categoryId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleToggleEnabled = (checked: boolean) => {
    onUpdate({ enabled: checked });
  };

  const isCurrentlyDragging = isDragging || isSortableDragging;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        inline-flex items-center gap-2 px-3 py-1 rounded-full border relative
        ${isCurrentlyDragging ? "opacity-50 ring-2 ring-primary shadow-md" : ""}
        ${
          skill.enabled
            ? "bg-primary/5 border-primary/20"
            : "bg-muted border-muted-foreground/20"
        }
        cursor-grab hover:border-primary/40 transition-colors
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Checkbox
        id={`skill-${skill.id}`}
        checked={skill.enabled}
        onCheckedChange={handleToggleEnabled}
        onClick={(e) => e.stopPropagation()}
      />
      <span
        className={`text-xs ${!skill.enabled ? "text-muted-foreground" : ""}`}
      >
        {skill.content}
      </span>

      {/* Delete button - absolute positioned to not affect layout */}
      {isHovered && !isCurrentlyDragging && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onDelete();
          }}
          className="absolute -right-2 -top-2 h-5 w-5 flex items-center justify-center bg-white text-muted-foreground hover:text-white cursor-pointer rounded-full border border-muted-foreground/20 hover:border-destructive hover:bg-destructive/70 transition-colors z-10"
          aria-label="Delete skill"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
