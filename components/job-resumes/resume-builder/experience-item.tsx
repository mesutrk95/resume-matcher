"use client";

import { useState } from "react";
import type {
  Experience,
  ExperienceItem as ExperienceItemType,
} from "@/types/resume";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, GripVertical, Plus, Save, Trash2, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

import { ItemList } from "./item-list";
import { AddItemForm } from "./add-item-form";

type ExperienceItemProps = {
  experience: Experience;
  onUpdate: (experience: Experience) => void;
  onDelete: (experienceId: string) => void;
};

export function ExperienceItem({
  experience,
  onUpdate,
  onDelete,
}: ExperienceItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: experience.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    companyName: experience.companyName,
    role: experience.role,
    startDate: experience.startDate,
    endDate: experience.endDate,
  });

  const [addingItem, setAddingItem] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleEdit = () => {
    setEditForm({
      companyName: experience.companyName,
      role: experience.role,
      startDate: experience.startDate,
      endDate: experience.endDate,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate({
      ...experience,
      companyName: editForm.companyName,
      role: editForm.role,
      startDate: editForm.startDate,
      endDate: editForm.endDate,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleAddItem = () => {
    setAddingItem(true);
  };

  const handleSaveNewItem = (description: string) => {
    const newItem: ExperienceItemType = {
      id: `item${Date.now()}`,
      description,
      enabled: true,
      variations: [],
    };

    onUpdate({
      ...experience,
      items: [...experience.items, newItem],
    });

    setAddingItem(false);
  };

  const handleCancelAddItem = () => {
    setAddingItem(false);
  };

  const handleUpdateItem = (updatedItem: ExperienceItemType) => {
    onUpdate({
      ...experience,
      items: experience.items.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      ),
    });
  };

  const handleDeleteItem = (itemId: string) => {
    onUpdate({
      ...experience,
      items: experience.items.filter((item) => item.id !== itemId),
    });
  };

  const handleDragEndItems = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = experience.items.findIndex(
        (item) => item.id === active.id
      );
      const newIndex = experience.items.findIndex(
        (item) => item.id === over.id
      );

      onUpdate({
        ...experience,
        items: arrayMove(experience.items, oldIndex, newIndex),
      });
    }
  };

  const handleToggleEnabled = (checked: boolean) => {
    onUpdate({
      ...experience,
      enabled: checked,
    });
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem
          value={experience.id}
          className="border rounded-lg overflow-hidden"
        >
          <div className="flex items-center px-4 py-2">
            <div
              className="p-1 mr-2 cursor-grab text-muted-foreground hover:text-foreground"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5" />
            </div>

            <Checkbox
              id={`experience-${experience.id}`}
              checked={experience.enabled}
              onCheckedChange={handleToggleEnabled}
              className="mr-4"
            />

            {isEditing && (
              <div className="w-[400px] grid grid-cols-1 md:grid-cols-2 gap-1 py-2">
                <Input
                  value={editForm.companyName}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      companyName: e.target.value,
                    }))
                  }
                  placeholder="Company" 
                />
                <Input
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, role: e.target.value }))
                  }
                  placeholder="Role" 
                />
                <Input
                  value={editForm.startDate}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  placeholder="Start Date"
                />
                <Input
                  value={editForm.endDate}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  placeholder="End Date"
                />
                <Input
                  value={editForm.startDate}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  placeholder="Start Date"
                />
                <Input
                  value={editForm.endDate}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  placeholder="End Date"
                />
              </div>
            )}

            <AccordionTrigger className="flex-1 hover:no-underline">
              <div className="flex flex-col items-start text-left">
                {!isEditing && (
                  <>
                    <div
                      className={`font-medium ${
                        !experience.enabled ? "text-muted-foreground" : ""
                      }`}
                    >
                      {experience.companyName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {experience.role} • {experience.startDate} -{" "}
                      {experience.endDate}
                    </div>
                  </>
                )}
              </div>
            </AccordionTrigger>

            <div className="ml-auto flex items-center">
              {isEditing ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleEdit}>
                    <Edit className="h-4 w-4 " />
                    {/* Edit */}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(experience.id)}
                  >
                    <Trash2 className="h-4 w-4 " />
                    {/* Delete */}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <AccordionContent className="px-4 pb-4">
            {/* Items List with Drag and Drop */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEndItems}
            >
              <SortableContext
                items={experience.items.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <ItemList
                  experienceId={experience.id}
                  items={experience.items}
                  onUpdate={handleUpdateItem}
                  onDelete={handleDeleteItem}
                />
              </SortableContext>
            </DndContext>

            {/* Add Item Form */}
            {addingItem && (
              <AddItemForm
                onSave={handleSaveNewItem}
                onCancel={handleCancelAddItem}
              />
            )}

            <div className="flex justify-end mt-4 ">
              {!addingItem && (
                <Button size="sm" variant="default" onClick={handleAddItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
