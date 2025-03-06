"use client";

import { useState } from "react";
import type { Variation } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, GripVertical, Save, Trash2, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useResumeBuilder } from "./context/useResumeBuilder";

type VariationComponentProps = {
  experienceId: string;
  itemId: string;
  variation: Variation;
  onUpdate: (variation: Variation) => void;
  onDelete: (variationId: string) => void;
};

function PercentageIndicator({ value }: { value: number }) {
  const getColor = () => {
    if (value >= 75) return "text-green-500";
    if (value >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div
      className={`text-xs font-bold bg-slate-200 py-1 px-2 rounded-full ${getColor()}`}
    >
      {value.toFixed(0)}%
    </div>
  );
}

export function VariationComponent({
  experienceId,
  itemId,
  variation,
  onUpdate,
  onDelete,
}: VariationComponentProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: variation.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { scores } = useResumeBuilder();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    content: variation.content,
  });

  const handleEdit = () => {
    setEditForm({
      content: variation.content,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate({
      ...variation,
      content: editForm.content,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleToggleEnabled = (checked: boolean) => {
    onUpdate({
      ...variation,
      enabled: checked,
    });
  };
  console.log(scores);

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <div className={`p-2 rounded-md bg-muted/30`}>
        <div className="flex items-start">
          <div
            className="p-1 mr-1 cursor-grab text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-3 w-3" />
          </div>

          <Checkbox
            id={`variation-${variation.id}`}
            checked={variation.enabled}
            onCheckedChange={handleToggleEnabled}
            className="mr-2"
          />

          <div className="flex-1">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                {isEditing ? (
                  <Textarea
                    value={editForm.content}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    placeholder="Variation content"
                    className="mb-2"
                    rows={2}
                  />
                ) : (
                  <p
                    className={`text-sm ${
                      !variation.enabled ? "text-muted-foreground" : ""
                    }`}
                  >
                    {variation.content}
                    <div className="ml-2 inline-flex">
                    <PercentageIndicator
                      value={(scores?.[variation.id]?.score || 0) * 100}
                    />

                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {scores?.[variation.id]?.matched_keywords?.map((k) => (
                        <span key={k} className="rounded-full px-2 py-1 bg-slate-200 font-bold text-xs">
                          {k}
                        </span>
                      ))}
                    </div>
                  </p>
                )}

                {/* {isPrimary && (
                  <span className="text-xs text-primary-foreground bg-primary px-2 py-0.5 rounded-full mt-1 inline-block">
                    Primary
                  </span>
                )} */}
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(variation.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
