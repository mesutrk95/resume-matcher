"use client"

import type { ExperienceItem } from "@/types/resume"
import { ItemComponent } from "./item-component"

type ItemListProps = {
  experienceId: string
  items: ExperienceItem[]
  onUpdate: (item: ExperienceItem) => void
  onDelete: (itemId: string) => void
}

export function ItemList({ experienceId, items, onUpdate, onDelete }: ItemListProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <ItemComponent key={item.id} experienceId={experienceId} item={item} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </div>
  )
}

