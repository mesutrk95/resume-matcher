"use client"

import { useState } from "react"
import type { ResumeTargetTitle } from "@/types/resume"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit, GripVertical, Save, Trash2, X } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

type TitleItemProps = {
  title: ResumeTargetTitle
  onUpdate: (title: ResumeTargetTitle) => void
  onDelete: (titleId: string) => void
}

export function TitleItem({ title, onUpdate, onDelete }: TitleItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: title.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    content: title.content,
  })

  const handleEdit = () => {
    setEditForm({
      content: title.content,
    })
    setIsEditing(true)
  }

  const handleSave = () => {
    onUpdate({
      ...title,
      content: editForm.content,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleToggleEnabled = (checked: boolean) => {
    onUpdate({
      ...title,
      enabled: checked,
    })
  }

  return (
    <div ref={setNodeRef} style={style} className="border rounded-md p-4">
      <div className="flex items-start">
        <div
          className="p-1 mr-2 cursor-grab text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </div>

        <Checkbox
          id={`title-${title.id}`}
          checked={title.enabled}
          onCheckedChange={handleToggleEnabled}
          className="mr-3 mt-1"
        />

        <div className="flex-1">
          {isEditing ? (
            <Input
              value={editForm.content}
              onChange={(e) => setEditForm({ content: e.target.value })}
              placeholder="Title"
              className="mb-2"
            />
          ) : (
            <p className={`${!title.enabled ? "text-muted-foreground" : ""}`}>{title.content}</p>
          )}
        </div>

        <div className="flex gap-2 ml-4">
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
              <Button variant="destructive" size="sm" onClick={() => onDelete(title.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

