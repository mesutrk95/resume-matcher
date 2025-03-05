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

export default function ResumeTemplateBuilder({ data }: { data: Template }) {
  // Sample initial data
  const [template, setTemplate] = useState<Template>(data);
  const [editingTemplate, setEditingTemplate] = useState(false);
  const router = useRouter();
  const [templateForm, setTemplateForm] = useState({
    name: template.name,
    description: template.description,
  });

  const onUpdated = (t: Template) => {
    fetch("/api/templates/" + (t.id ? t.id : ""), {
      method: t.id ? "put" : "post",
      body: JSON.stringify({
        id: t.id,
        name: t.name,
        description: t.description,
        content: t.content,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(t.id);
        if (!t.id) {
          router.push("/templates/" + data.id);
        }
        console.log(data);
      });
  };

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
      onUpdated(newTemplate);
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
      onUpdated(newTemplate);
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
        onUpdated(newTemplate);
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
      onUpdated(newTemplate);
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
      onUpdated(newTemplate);
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
