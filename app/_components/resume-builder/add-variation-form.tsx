"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type AddVariationFormProps = {
  onSave: (text: string) => void
  onCancel: () => void
}

export function AddVariationForm({ onSave, onCancel }: AddVariationFormProps) {
  const [text, setText] = useState("")

  const handleSubmit = () => {
    onSave(text)
  }

  return (
    <div className="mb-3 p-3 border rounded-md bg-muted/30">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Variation text"
        className="mb-2"
        rows={2}
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSubmit}>
          Save
        </Button>
      </div>
    </div>
  )
}

