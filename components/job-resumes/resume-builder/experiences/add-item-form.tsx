"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type AddItemFormProps = {
  onSave: (description: string) => void;
  onCancel: () => void;
};

export function AddItemForm({ onSave, onCancel }: AddItemFormProps) {
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    onSave(description);
  };

  return (
    <div className="mt-4 p-4 border rounded-md">
      <h4 className="font-medium mb-2">New Experience</h4>
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="mb-3"
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSubmit}>
          Save Experience
        </Button>
      </div>
    </div>
  );
}
