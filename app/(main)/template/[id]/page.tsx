"use client"

import type React from "react"

import { useState } from "react"
import { Edit, GripVertical, Plus, Save, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// Types
type Variation = {
  id: string
  text: string
}

type ExperienceItem = {
  id: string
  title: string
  variations: Variation[]
}

type Experience = {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  items: ExperienceItem[]
}

type Template = {
  id: string
  name: string
  description: string
  experiences: Experience[]
}

// Sortable Item Components
function SortableExperience({ experience, children }: { experience: Experience; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: experience.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      <div className="flex items-center">
        <button
          className="p-1 mr-2 cursor-grab text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  )
}

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="mb-3">
      <div className="flex items-start">
        <button
          className="p-1 mr-2 cursor-grab text-muted-foreground hover:text-foreground mt-1"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}

function SortableVariation({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}

export default function ResumeBuilder() {
  // Sample initial data
  const [template, setTemplate] = useState<Template>({
    id: "1",
    name: "Software Engineer Resume",
    description: "A template for software engineering positions",
    experiences: [
      {
        id: "exp1",
        company: "Tech Corp",
        position: "Senior Software Engineer",
        startDate: "Jan 2020",
        endDate: "Present",
        items: [
          {
            id: "item1",
            title: "Led development of microservices architecture",
            variations: [
              {
                id: "var1",
                text: "Led development of microservices architecture, improving system scalability by 200%",
              },
              {
                id: "var2",
                text: "Architected and implemented microservices solution that reduced deployment time by 75%",
              },
            ],
          },
          {
            id: "item2",
            title: "Mentored junior developers",
            variations: [
              {
                id: "var3",
                text: "Mentored 5 junior developers, improving team productivity by 30%",
              },
            ],
          },
        ],
      },
      {
        id: "exp2",
        company: "Startup Inc",
        position: "Software Developer",
        startDate: "Mar 2018",
        endDate: "Dec 2019",
        items: [
          {
            id: "item3",
            title: "Developed e-commerce platform",
            variations: [
              {
                id: "var4",
                text: "Developed e-commerce platform that increased sales by 45%",
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

  // State for editing
  const [editingTemplate, setEditingTemplate] = useState(false)
  const [templateForm, setTemplateForm] = useState({ name: template.name, description: template.description })

  // State for new items
  const [newExperience, setNewExperience] = useState({
    company: "",
    position: "",
    startDate: "",
    endDate: "",
  })
  const [addingExperience, setAddingExperience] = useState(false)

  const [newItemForms, setNewItemForms] = useState<Record<string, { title: string }>>({})
  const [newVariationForms, setNewVariationForms] = useState<Record<string, { text: string }>>({})

  // Editing experience state
  const [editingExperience, setEditingExperience] = useState<Record<string, Experience>>({})

  // Editing item state
  const [editingItem, setEditingItem] = useState<Record<string, ExperienceItem>>({})

  // Editing variation state
  const [editingVariation, setEditingVariation] = useState<Record<string, Variation>>({})

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
    setNewExperience({ company: "", position: "", startDate: "", endDate: "" })
  }

  const handleSaveNewExperience = () => {
    const newExp = {
      id: `exp${Date.now()}`,
      ...newExperience,
      items: [],
    }

    setTemplate((prev) => ({
      ...prev,
      experiences: [...prev.experiences, newExp],
    }))

    setAddingExperience(false)
  }

  const handleEditExperience = (exp: Experience) => {
    setEditingExperience({
      ...editingExperience,
      [exp.id]: { ...exp },
    })
  }

  const handleSaveExperience = (expId: string) => {
    setTemplate((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) => (exp.id === expId ? editingExperience[expId] : exp)),
    }))

    const newEditing = { ...editingExperience }
    delete newEditing[expId]
    setEditingExperience(newEditing)
  }

  const handleDeleteExperience = (expId: string) => {
    setTemplate((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((exp) => exp.id !== expId),
    }))
  }

  // Item handlers
  const handleAddItem = (expId: string) => {
    setNewItemForms({
      ...newItemForms,
      [expId]: { title: "" },
    })
  }

  const handleSaveNewItem = (expId: string) => {
    const newItem = {
      id: `item${Date.now()}`,
      title: newItemForms[expId].title,
      variations: [],
    }

    setTemplate((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) => {
        if (exp.id === expId) {
          return {
            ...exp,
            items: [...exp.items, newItem],
          }
        }
        return exp
      }),
    }))

    const newForms = { ...newItemForms }
    delete newForms[expId]
    setNewItemForms(newForms)
  }

  const handleEditItem = (item: ExperienceItem) => {
    setEditingItem({
      ...editingItem,
      [item.id]: { ...item },
    })
  }

  const handleSaveItem = (expId: string, itemId: string) => {
    setTemplate((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) => {
        if (exp.id === expId) {
          return {
            ...exp,
            items: exp.items.map((item) => (item.id === itemId ? editingItem[itemId] : item)),
          }
        }
        return exp
      }),
    }))

    const newEditing = { ...editingItem }
    delete newEditing[itemId]
    setEditingItem(newEditing)
  }

  const handleDeleteItem = (expId: string, itemId: string) => {
    setTemplate((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) => {
        if (exp.id === expId) {
          return {
            ...exp,
            items: exp.items.filter((item) => item.id !== itemId),
          }
        }
        return exp
      }),
    }))
  }

  // Variation handlers
  const handleAddVariation = (expId: string, itemId: string) => {
    setNewVariationForms({
      ...newVariationForms,
      [`${expId}-${itemId}`]: { text: "" },
    })
  }

  const handleSaveNewVariation = (expId: string, itemId: string) => {
    const formKey = `${expId}-${itemId}`
    const newVariation = {
      id: `var${Date.now()}`,
      text: newVariationForms[formKey].text,
    }

    setTemplate((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) => {
        if (exp.id === expId) {
          return {
            ...exp,
            items: exp.items.map((item) => {
              if (item.id === itemId) {
                return {
                  ...item,
                  variations: [...item.variations, newVariation],
                }
              }
              return item
            }),
          }
        }
        return exp
      }),
    }))

    const newForms = { ...newVariationForms }
    delete newForms[formKey]
    setNewVariationForms(newForms)
  }

  const handleEditVariation = (variation: Variation) => {
    setEditingVariation({
      ...editingVariation,
      [variation.id]: { ...variation },
    })
  }

  const handleSaveVariation = (expId: string, itemId: string, varId: string) => {
    setTemplate((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) => {
        if (exp.id === expId) {
          return {
            ...exp,
            items: exp.items.map((item) => {
              if (item.id === itemId) {
                return {
                  ...item,
                  variations: item.variations.map((v) => (v.id === varId ? editingVariation[varId] : v)),
                }
              }
              return item
            }),
          }
        }
        return exp
      }),
    }))

    const newEditing = { ...editingVariation }
    delete newEditing[varId]
    setEditingVariation(newEditing)
  }

  const handleDeleteVariation = (expId: string, itemId: string, varId: string) => {
    setTemplate((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) => {
        if (exp.id === expId) {
          return {
            ...exp,
            items: exp.items.map((item) => {
              if (item.id === itemId) {
                return {
                  ...item,
                  variations: item.variations.filter((v) => v.id !== varId),
                }
              }
              return item
            }),
          }
        }
        return exp
      }),
    }))
  }

  // Drag and drop handlers
  const handleDragEndExperiences = (event: DragEndEvent) => {
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

  const handleDragEndItems = (expId: string, event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setTemplate((prev) => {
        return {
          ...prev,
          experiences: prev.experiences.map((exp) => {
            if (exp.id === expId) {
              const oldIndex = exp.items.findIndex((item) => item.id === active.id)
              const newIndex = exp.items.findIndex((item) => item.id === over.id)

              return {
                ...exp,
                items: arrayMove(exp.items, oldIndex, newIndex),
              }
            }
            return exp
          }),
        }
      })
    }
  }

  const handleDragEndVariations = (expId: string, itemId: string, event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setTemplate((prev) => {
        return {
          ...prev,
          experiences: prev.experiences.map((exp) => {
            if (exp.id === expId) {
              return {
                ...exp,
                items: exp.items.map((item) => {
                  if (item.id === itemId) {
                    const oldIndex = item.variations.findIndex((v) => v.id === active.id)
                    const newIndex = item.variations.findIndex((v) => v.id === over.id)

                    return {
                      ...item,
                      variations: arrayMove(item.variations, oldIndex, newIndex),
                    }
                  }
                  return item
                }),
              }
            }
            return exp
          }),
        }
      })
    }
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
      {addingExperience && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">New Experience</CardTitle>
          </CardHeader>
          <div className="p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Company</label>
                <Input
                  value={newExperience.company}
                  onChange={(e) => setNewExperience((prev) => ({ ...prev, company: e.target.value }))}
                  placeholder="Company name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Position</label>
                <Input
                  value={newExperience.position}
                  onChange={(e) => setNewExperience((prev) => ({ ...prev, position: e.target.value }))}
                  placeholder="Job title"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Start Date</label>
                <Input
                  value={newExperience.startDate}
                  onChange={(e) => setNewExperience((prev) => ({ ...prev, startDate: e.target.value }))}
                  placeholder="e.g. Jan 2020"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">End Date</label>
                <Input
                  value={newExperience.endDate}
                  onChange={(e) => setNewExperience((prev) => ({ ...prev, endDate: e.target.value }))}
                  placeholder="e.g. Present"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddingExperience(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveNewExperience}>Save Experience</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Experiences List with Drag and Drop */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndExperiences}>
        <SortableContext items={template.experiences.map((exp) => exp.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {template.experiences.map((experience) => (
              <SortableExperience key={experience.id} experience={experience}>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value={experience.id} className="border rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-4 py-2 hover:no-underline">
                      <div className="flex flex-col items-start text-left">
                        {editingExperience[experience.id] ? (
                          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                            <Input
                              value={editingExperience[experience.id].company}
                              onChange={(e) =>
                                setEditingExperience((prev) => ({
                                  ...prev,
                                  [experience.id]: {
                                    ...prev[experience.id],
                                    company: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Company"
                              className="mb-2"
                            />
                            <Input
                              value={editingExperience[experience.id].position}
                              onChange={(e) =>
                                setEditingExperience((prev) => ({
                                  ...prev,
                                  [experience.id]: {
                                    ...prev[experience.id],
                                    position: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Position"
                              className="mb-2"
                            />
                            <Input
                              value={editingExperience[experience.id].startDate}
                              onChange={(e) =>
                                setEditingExperience((prev) => ({
                                  ...prev,
                                  [experience.id]: {
                                    ...prev[experience.id],
                                    startDate: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Start Date"
                            />
                            <Input
                              value={editingExperience[experience.id].endDate}
                              onChange={(e) =>
                                setEditingExperience((prev) => ({
                                  ...prev,
                                  [experience.id]: {
                                    ...prev[experience.id],
                                    endDate: e.target.value,
                                  },
                                }))
                              }
                              placeholder="End Date"
                            />
                          </div>
                        ) : (
                          <>
                            <div className="font-medium">{experience.position}</div>
                            <div className="text-sm text-muted-foreground">
                              {experience.company} • {experience.startDate} - {experience.endDate}
                            </div>
                          </>
                        )}
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-4 pb-4">
                      <div className="flex justify-between items-center mb-4">
                        {editingExperience[experience.id] ? (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newEditing = { ...editingExperience }
                                delete newEditing[experience.id]
                                setEditingExperience(newEditing)
                              }}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                            <Button size="sm" onClick={() => handleSaveExperience(experience.id)}>
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditExperience(experience)}>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteExperience(experience.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        )}

                        {!newItemForms[experience.id] && (
                          <Button size="sm" variant="outline" onClick={() => handleAddItem(experience.id)}>
                            <Plus className="h-4 w-4 mr-1" />
                            Add Item
                          </Button>
                        )}
                      </div>

                      {/* Add Item Form */}
                      {newItemForms[experience.id] && (
                        <div className="mb-4 p-4 border rounded-md">
                          <h4 className="font-medium mb-2">New Experience Item</h4>
                          <Input
                            value={newItemForms[experience.id].title}
                            onChange={(e) =>
                              setNewItemForms((prev) => ({
                                ...prev,
                                [experience.id]: { title: e.target.value },
                              }))
                            }
                            placeholder="Item title"
                            className="mb-3"
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newForms = { ...newItemForms }
                                delete newForms[experience.id]
                                setNewItemForms(newForms)
                              }}
                            >
                              Cancel
                            </Button>
                            <Button size="sm" onClick={() => handleSaveNewItem(experience.id)}>
                              Save Item
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Items List with Drag and Drop */}
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => handleDragEndItems(experience.id, event)}
                      >
                        <SortableContext
                          items={experience.items.map((item) => item.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-4">
                            {experience.items.map((item) => (
                              <SortableItem key={item.id} id={item.id}>
                                <div className="border rounded-md p-4">
                                  <div className="flex justify-between items-start mb-3">
                                    {editingItem[item.id] ? (
                                      <Input
                                        value={editingItem[item.id].title}
                                        onChange={(e) =>
                                          setEditingItem((prev) => ({
                                            ...prev,
                                            [item.id]: {
                                              ...prev[item.id],
                                              title: e.target.value,
                                            },
                                          }))
                                        }
                                        placeholder="Item title"
                                        className="mb-2"
                                      />
                                    ) : (
                                      <h4 className="font-medium">{item.title}</h4>
                                    )}

                                    <div className="flex gap-2">
                                      {editingItem[item.id] ? (
                                        <>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              const newEditing = { ...editingItem }
                                              delete newEditing[item.id]
                                              setEditingItem(newEditing)
                                            }}
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                          <Button size="sm" onClick={() => handleSaveItem(experience.id, item.id)}>
                                            <Save className="h-4 w-4" />
                                          </Button>
                                        </>
                                      ) : (
                                        <>
                                          <Button variant="outline" size="sm" onClick={() => handleEditItem(item)}>
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeleteItem(experience.id, item.id)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {/* Variations */}
                                  <div className="ml-4 border-l-2 pl-4">
                                    <div className="flex justify-between items-center mb-2">
                                      <h5 className="text-sm font-medium">Variations</h5>
                                      {!newVariationForms[`${experience.id}-${item.id}`] && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleAddVariation(experience.id, item.id)}
                                        >
                                          <Plus className="h-3 w-3 mr-1" />
                                          Add Variation
                                        </Button>
                                      )}
                                    </div>

                                    {/* Add Variation Form */}
                                    {newVariationForms[`${experience.id}-${item.id}`] && (
                                      <div className="mb-3 p-3 border rounded-md bg-muted/30">
                                        <Textarea
                                          value={newVariationForms[`${experience.id}-${item.id}`].text}
                                          onChange={(e) =>
                                            setNewVariationForms((prev) => ({
                                              ...prev,
                                              [`${experience.id}-${item.id}`]: { text: e.target.value },
                                            }))
                                          }
                                          placeholder="Variation text"
                                          className="mb-2"
                                          rows={2}
                                        />
                                        <div className="flex justify-end gap-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              const newForms = { ...newVariationForms }
                                              delete newForms[`${experience.id}-${item.id}`]
                                              setNewVariationForms(newForms)
                                            }}
                                          >
                                            Cancel
                                          </Button>
                                          <Button
                                            size="sm"
                                            onClick={() => handleSaveNewVariation(experience.id, item.id)}
                                          >
                                            Save
                                          </Button>
                                        </div>
                                      </div>
                                    )}

                                    {/* Variations List with Drag and Drop */}
                                    <DndContext
                                      sensors={sensors}
                                      collisionDetection={closestCenter}
                                      onDragEnd={(event) => handleDragEndVariations(experience.id, item.id, event)}
                                    >
                                      <SortableContext
                                        items={item.variations.map((v) => v.id)}
                                        strategy={verticalListSortingStrategy}
                                      >
                                        <div className="space-y-2">
                                          {item.variations.map((variation, index) => (
                                            <SortableVariation key={variation.id} id={variation.id}>
                                              <div
                                                className={`p-2 rounded-md ${index === 0 ? "bg-primary/10 border border-primary/20" : "bg-muted/30"}`}
                                              >
                                                <div className="flex justify-between items-start gap-2">
                                                  <div className="flex-1">
                                                    {editingVariation[variation.id] ? (
                                                      <Textarea
                                                        value={editingVariation[variation.id].text}
                                                        onChange={(e) =>
                                                          setEditingVariation((prev) => ({
                                                            ...prev,
                                                            [variation.id]: {
                                                              ...prev[variation.id],
                                                              text: e.target.value,
                                                            },
                                                          }))
                                                        }
                                                        placeholder="Variation text"
                                                        className="mb-2"
                                                        rows={2}
                                                      />
                                                    ) : (
                                                      <p className="text-sm">{variation.text}</p>
                                                    )}

                                                    {index === 0 && (
                                                      <span className="text-xs text-primary-foreground bg-primary px-2 py-0.5 rounded-full mt-1 inline-block">
                                                        Primary
                                                      </span>
                                                    )}
                                                  </div>

                                                  <div className="flex gap-1">
                                                    {editingVariation[variation.id] ? (
                                                      <>
                                                        <Button
                                                          variant="outline"
                                                          size="sm"
                                                          onClick={() => {
                                                            const newEditing = { ...editingVariation }
                                                            delete newEditing[variation.id]
                                                            setEditingVariation(newEditing)
                                                          }}
                                                        >
                                                          <X className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                          size="sm"
                                                          onClick={() =>
                                                            handleSaveVariation(experience.id, item.id, variation.id)
                                                          }
                                                        >
                                                          <Save className="h-3 w-3" />
                                                        </Button>
                                                      </>
                                                    ) : (
                                                      <>
                                                        <Button
                                                          variant="ghost"
                                                          size="sm"
                                                          onClick={() => handleEditVariation(variation)}
                                                        >
                                                          <Edit className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                          variant="ghost"
                                                          size="sm"
                                                          onClick={() =>
                                                            handleDeleteVariation(experience.id, item.id, variation.id)
                                                          }
                                                        >
                                                          <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                      </>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            </SortableVariation>
                                          ))}
                                        </div>
                                      </SortableContext>
                                    </DndContext>
                                  </div>
                                </div>
                              </SortableItem>
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </SortableExperience>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

