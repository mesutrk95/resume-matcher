"use client"

import type { ResumeSkill } from "@/types/resume"
import { SkillItem } from "./skill-item"

type SkillListProps = {
  skills: ResumeSkill[]
  onUpdate: (skill: ResumeSkill) => void
  onDelete: (skillId: string) => void
}

export function SkillList({ skills, onUpdate, onDelete }: SkillListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <SkillItem key={skill.id} skill={skill} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </div>
  )
}

