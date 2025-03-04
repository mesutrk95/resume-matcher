"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type AddItemFormProps = {
  onSave: (title: string) => void
  onCancel: () => void
}

export function AddItemForm({ onSave, onCancel }: AddItemFormProps) {
  const [title, setTitle] = useState("")

  const handleSubmit = () => {
    onSave(title)
  }

  return (
    <div className="mb-4 p-4 border rounded-md">
      <h4 className="font-medium mb-2">New Experience Item</h4>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Item title" className="mb-3" />
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSubmit}>
          Save Item
        </Button>
      </div>
    </div>
  )
}

