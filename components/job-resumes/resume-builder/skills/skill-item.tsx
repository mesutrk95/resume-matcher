"use client"

import type { ResumeSkill } from "@/types/resume"
import { Checkbox } from "@/components/ui/checkbox"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

type SkillItemProps = {
  skill: ResumeSkill
  onUpdate: (skill: ResumeSkill) => void
  onDelete: (skillId: string) => void
  isDragging?: boolean
}

export function SkillItem({ skill, onUpdate, onDelete, isDragging = false }: SkillItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: skill.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleToggleEnabled = (checked: boolean) => {
    onUpdate({
      ...skill,
      enabled: checked,
    })
  }

  const isCurrentlyDragging = isDragging || isSortableDragging

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        inline-flex items-center gap-2 px-3 py-1 rounded-full border
        ${isCurrentlyDragging ? "opacity-50 ring-2 ring-primary" : ""}
        ${skill.enabled ? "bg-primary/5 border-primary/20" : "bg-muted border-muted-foreground/20"}
        cursor-grab hover:border-primary/40 transition-colors
      `}
    >
      <Checkbox
        id={`skill-${skill.id}`}
        checked={skill.enabled}
        onCheckedChange={handleToggleEnabled}
        className="h-3 w-3"
        onClick={(e) => e.stopPropagation()}
      />
      <span className={`text-sm ${!skill.enabled ? "text-muted-foreground" : ""}`}>{skill.content}</span>
    </div>
  )
}

