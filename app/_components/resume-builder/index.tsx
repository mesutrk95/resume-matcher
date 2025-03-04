"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Edit, Plus, Save, X } from "lucide-react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"

import { ExperienceList } from "./experience-list"
import { AddExperienceForm } from "./add-experience-form"
import type { Template, Experience } from "@/types/resume"

export default function ResumeBuilder() {
  // Sample initial data
  const [template, setTemplate] = useState<Template>({
    id: "1",
    name: "Software Engineer Resume",
    description: "A template for software engineering positions",
    experiences: [
      {
        id: "exp1",
        companyName: "Tech Corp",
        role: "Senior Software Engineer",
        startDate: "Jan 2020",
        endDate: "Present",
        enabled: true,
        items: [
          {
            id: "item1",
            description: "Led development of microservices architecture",
            enabled: true,
            variations: [
              {
                id: "var1",
                content: "Led development of microservices architecture, improving system scalability by 200%",
                enabled: true,
              },
              {
                id: "var2",
                content: "Architected and implemented microservices solution that reduced deployment time by 75%",
                enabled: true,
              },
            ],
          },
          {
            id: "item2",
            description: "Mentored junior developers",
            enabled: true,
            variations: [
              {
                id: "var3",
                content: "Mentored 5 junior developers, improving team productivity by 30%",
                enabled: true,
              },
            ],
          },
        ],
      },
      {
        id: "exp2",
        companyName: "Startup Inc",
        role: "Software Developer",
        startDate: "Mar 2018",
        endDate: "Dec 2019",
        enabled: true,
        items: [
          {
            id: "item3",
            description: "Developed e-commerce platform",
            enabled: true,
            variations: [
              {
                id: "var4",
                content: "Developed e-commerce platform that increased sales by 45%",
                enabled: true,
              },
            ],
          },
        ],
      },
    ],
  })

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // State for editing template
  const [editingTemplate, setEditingTemplate] = useState(false)
  const [templateForm, setTemplateForm] = useState({ name: template.name, description: template.description })

  // State for adding experience
  const [addingExperience, setAddingExperience] = useState(false)

  // Template handlers
  const handleEditTemplate = () => {
    setTemplateForm({ name: template.name, description: template.description })
    setEditingTemplate(true)
  }

  const handleSaveTemplate = () => {
    setTemplate((prev) => ({
      ...prev,
      name: templateForm.name,
      description: templateForm.description,
    }))
    setEditingTemplate(false)
  }

  // Experience handlers
  const handleAddExperience = () => {
    setAddingExperience(true)
  }

  const handleSaveNewExperience = (newExperience: Omit<Experience, "id" | "items" | "enabled">) => {
    const newExp = {
      id: `exp${Date.now()}`,
      ...newExperience,
      enabled: true,
      items: [],
    }

    setTemplate((prev) => ({
      ...prev,
      experiences: [...prev.experiences, newExp],
    }))

    setAddingExperience(false)
  }

  const handleCancelAddExperience = () => {
    setAddingExperience(false)
  }

  const handleDragEndExperiences = (event: any) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setTemplate((prev) => {
        const oldIndex = prev.experiences.findIndex((exp) => exp.id === active.id)
        const newIndex = prev.experiences.findIndex((exp) => exp.id === over.id)

        return {
          ...prev,
          experiences: arrayMove(prev.experiences, oldIndex, newIndex),
        }
      })
    }
  }

  const handleUpdateExperience = (updatedExperience: Experience) => {
    setTemplate((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) => (exp.id === updatedExperience.id ? updatedExperience : exp)),
    }))
  }

  const handleDeleteExperience = (experienceId: string) => {
    setTemplate((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((exp) => exp.id !== experienceId),
    }))
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-start justify-between">
          {!editingTemplate ? (
            <div>
              <CardTitle className="text-2xl">{template.name}</CardTitle>
              <p className="text-muted-foreground mt-1">{template.description}</p>
            </div>
          ) : (
            <div className="w-full space-y-2">
              <Input
                value={templateForm.name}
                onChange={(e) => setTemplateForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Template name"
                className="font-semibold text-lg"
              />
              <Input
                value={templateForm.description}
                onChange={(e) => setTemplateForm((prev) => ({ ...prev, description: e.target.value }))}
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
                <Button variant="outline" size="sm" onClick={() => setEditingTemplate(false)}>
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
      {addingExperience && <AddExperienceForm onSave={handleSaveNewExperience} onCancel={handleCancelAddExperience} />}

      {/* Experiences List with Drag and Drop */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndExperiences}>
        <SortableContext items={template.experiences.map((exp) => exp.id)} strategy={verticalListSortingStrategy}>
          <ExperienceList
            experiences={template.experiences}
            onUpdate={handleUpdateExperience}
            onDelete={handleDeleteExperience}
          />
        </SortableContext>
      </DndContext>
    </div>
  )
}

