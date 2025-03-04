"use client"

import { useState } from "react"
import type { Variation } from "@/types/resume"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Edit, GripVertical, Save, Trash2, X } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

type VariationComponentProps = {
  experienceId: string
  itemId: string
  variation: Variation
  isPrimary: boolean
  onUpdate: (variation: Variation) => void
  onDelete: (variationId: string) => void
}

export function VariationComponent({
  experienceId,
  itemId,
  variation,
  isPrimary,
  onUpdate,
  onDelete,
}: VariationComponentProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: variation.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    content: variation.content,
  })

  const handleEdit = () => {
    setEditForm({
      content: variation.content,
    })
    setIsEditing(true)
  }

  const handleSave = () => {
    onUpdate({
      ...variation,
      content: editForm.content,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <div className="flex items-start">
        <button
          className="p-1 mr-1 cursor-grab text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3 w-3" />
        </button>

        <div
          className={`flex-1 p-2 rounded-md ${isPrimary ? "bg-primary/10 border border-primary/20" : "bg-muted/30"}`}
        >
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
              {isEditing ? (
                <Textarea
                  value={editForm.content}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, text: e.target.value }))}
                  placeholder="Variation text"
                  className="mb-2"
                  rows={2}
                />
              ) : (
                <p className="text-sm">{variation.content}</p>
              )}

              {isPrimary && (
                <span className="text-xs text-primary-foreground bg-primary px-2 py-0.5 rounded-full mt-1 inline-block">
                  Primary
                </span>
              )}
            </div>

            <div className="flex gap-1">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="h-3 w-3" />
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-3 w-3" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={handleEdit}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(variation.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

