"use client";

import { useState } from "react";
import type { Variation } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, GripVertical, Save, Trash2, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useResumeBuilder } from "../context/useResumeBuilder";
import { MatchPercentageIndicator } from "../match-percentage-indicator";

type VariationComponentProps = {
  experienceId: string;
  itemId: string;
  variation: Variation;
  onUpdate: (variation: Variation) => void;
  onDelete: (variationId: string) => void;
};

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

  const score = scores?.[variation.id];

  return (
    <div ref={setNodeRef} style={style} className={`bg-white z-10`}>
      <div className={`p-2 bg-muted/30 border-b`}>
        <div className="flex items-start">
          <div
            className=" mr-2 mt-1 cursor-grab text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </div>

          <Checkbox
            id={`variation-${variation.id}`}
            checked={variation.enabled}
            onCheckedChange={handleToggleEnabled}
            className="mr-2 mt-1"
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
                    rows={5}
                  />
                ) : (
                  <p
                    className={`text-sm ${
                      !variation.enabled ? "text-muted-foreground" : ""
                    }`}
                  >
                    {variation.content}
                    {score && (
                      <>
                        {/* <div className="ml-2 inline-flex">
                          <PercentageIndicator
                            value={(score?.score || 0) * 100}
                          />
                        </div> */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          <MatchPercentageIndicator
                            value={(score?.score || 0) * 100}
                          />
                          {score?.matched_keywords?.map((k) => (
                            <span
                              key={k}
                              className="rounded-full px-2 py-1 bg-slate-200 font-bold text-xs"
                            >
                              {k}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
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
                  <div className="flex flex-col">
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
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
