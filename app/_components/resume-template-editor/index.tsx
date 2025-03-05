"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Edit, Plus, Save, X } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { ExperienceList } from "./experience-list";
import { AddExperienceForm } from "./add-experience-form";
import type { Template, Experience } from "@/types/resume";
import { useRouter } from "next/navigation";

export function ResumeTemplateEditor({
  data,
  onUpdate,
}: {
  data: Template;
  onUpdate?: (t: Template) => void;
}) {
  // Sample initial data
  const [lastTemplate, setLastTemplate] = useState<string>(
    JSON.stringify(data)
  );
  const [template, setTemplate] = useState<Template>(data);
  const [editingTemplate, setEditingTemplate] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: template.name,
    description: template.description,
  });

  useEffect(() => {
    console.log("updated", template);
    const newTemplate = JSON.stringify(template);

    if (newTemplate !== lastTemplate) {
      console.log(newTemplate);
      onUpdate?.(template);
      setLastTemplate(newTemplate);
    }
  }, [template, lastTemplate, onUpdate]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // State for adding experience
  const [addingExperience, setAddingExperience] = useState(false);

  // Template handlers
  const handleEditTemplate = () => {
    setTemplateForm({ name: template.name, description: template.description });
    setEditingTemplate(true);
  };

  const handleSaveTemplate = () => {
    setTemplate((prev) => {
      const newTemplate = {
        ...prev,
        name: templateForm.name,
        description: templateForm.description,
      };
      return newTemplate;
    });
    setEditingTemplate(false);
  };

  // Experience handlers
  const handleAddExperience = () => {
    setAddingExperience(true);
  };

  const handleSaveNewExperience = (
    newExperience: Omit<Experience, "id" | "items" | "enabled">
  ) => {
    const newExp = {
      id: `exp${Date.now()}`,
      ...newExperience,
      enabled: true,
      items: [],
    };

    setTemplate((prev) => {
      const newTemplate = {
        ...prev,
        content: {
          ...prev.content,
          experiences: [...prev.content.experiences, newExp],
        },
      };
      return newTemplate;
    });

    setAddingExperience(false);
  };

  const handleCancelAddExperience = () => {
    setAddingExperience(false);
  };

  const handleDragEndExperiences = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTemplate((prev) => {
        const oldIndex = prev.content.experiences.findIndex(
          (exp) => exp.id === active.id
        );
        const newIndex = prev.content.experiences.findIndex(
          (exp) => exp.id === over.id
        );
        const newTemplate = {
          ...prev,
          content: {
            ...prev.content,

            experiences: arrayMove(
              prev.content.experiences,
              oldIndex,
              newIndex
            ),
          },
        };
        return newTemplate;
      });
    }
  };

  const handleUpdateExperience = (updatedExperience: Experience) => {
    setTemplate((prev) => {
      const newTemplate = {
        ...prev,
        content: {
          ...prev.content,
          experiences: prev.content.experiences.map((exp) =>
            exp.id === updatedExperience.id ? updatedExperience : exp
          ),
        },
      };
      return newTemplate;
    });
  };

  const handleDeleteExperience = (experienceId: string) => {
    setTemplate((prev) => {
      const newTemplate = {
        ...prev,
        content: {
          ...prev.content,
          experiences: prev.content.experiences.filter(
            (exp) => exp.id !== experienceId
          ),
        },
      };
      return newTemplate;
    });
  };

  return (
    <>
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-start justify-between">
          {!editingTemplate ? (
            <div>
              <CardTitle className="text-2xl">{template.name}</CardTitle>
              <p className="text-muted-foreground mt-1">
                {template.description}
              </p>
            </div>
          ) : (
            <div className="w-full space-y-2">
              <Input
                value={templateForm.name}
                onChange={(e) =>
                  setTemplateForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Template name"
                className="font-semibold text-lg"
              />
              <Input
                value={templateForm.description}
                onChange={(e) =>
                  setTemplateForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Template description"
              />
            </div>
          )}

          <div>
            {!editingTemplate ? (
              <Button variant="outline" size="sm" onClick={handleEditTemplate}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingTemplate(false)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveTemplate}>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Experiences</h2>
        {!addingExperience ? (
          <Button onClick={handleAddExperience}>
            <Plus className="h-4 w-4 mr-1" />
            Add Experience
          </Button>
        ) : null}
      </div>

      {/* Add Experience Form */}
      {addingExperience && (
        <AddExperienceForm
          onSave={handleSaveNewExperience}
          onCancel={handleCancelAddExperience}
        />
      )}

      {/* Experiences List with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEndExperiences}
      >
        <SortableContext
          items={template.content.experiences.map((exp) => exp.id)}
          strategy={verticalListSortingStrategy}
        >
          <ExperienceList
            experiences={template.content.experiences}
            onUpdate={handleUpdateExperience}
            onDelete={handleDeleteExperience}
          />
        </SortableContext>
      </DndContext>
    </>
  );
}
