'use client';

import { useState } from 'react';
import type { Experience, ExperienceItem as ExperienceItemType } from '@/types/resume';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, GripVertical, Plus, Save, Trash2, X } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { ItemList } from './item-list';
import { AddItemForm } from './add-item-form';
import { randomNDigits } from '@/lib/utils';
import clsx from 'clsx';
import { SeperateList } from '@/components/shared/seperate-list';
import { YearMonthPicker } from '@/components/ui/year-month-picker';
import { generateId } from '@/lib/resume-content';

type ExperienceItemProps = {
  experience: Experience;
  onUpdate: (experience: Experience) => void;
  onDelete: (experienceId: string) => void;
};

export function ExperienceItem({ experience, onUpdate, onDelete }: ExperienceItemProps) {
  const [isOpen, setIsOpen] = useState<string | undefined>();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: experience.id,
  });

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
    location: experience.location,
    type: experience.type,
  });

  const [addingItem, setAddingItem] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleEdit = () => {
    setEditForm({
      companyName: experience.companyName,
      role: experience.role,
      startDate: experience.startDate,
      endDate: experience.endDate,
      location: experience.location,
      type: experience.type,
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
      location: editForm.location,
      type: editForm.type,
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
      id: `item_${randomNDigits()}`,
      description: '',
      enabled: true,
      skills: [],
      variations: [
        {
          id: generateId('experiences.items.variations'),
          content: description,
          enabled: true,
        },
      ],
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
      items: experience.items.map(item => (item.id === updatedItem.id ? updatedItem : item)),
    });
  };

  const handleDeleteItem = (itemId: string) => {
    onUpdate({
      ...experience,
      items: experience.items.filter(item => item.id !== itemId),
    });
  };

  const handleDragEndItems = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = experience.items.findIndex(item => item.id === active.id);
      const newIndex = experience.items.findIndex(item => item.id === over.id);

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
      <Accordion
        type="single"
        collapsible
        className="w-full"
        value={isOpen}
        onValueChange={setIsOpen}
      >
        <AccordionItem value={experience.id} className="border rounded-lg">
          <div
            className={clsx(
              'flex items-center mx-[2px] px-4 py-0 sticky top-0 bg-white',
              isOpen ? 'border-b rounded-t-xl mb-2' : 'rounded-xl',
            )}
          >
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
                  onChange={e =>
                    setEditForm(prev => ({
                      ...prev,
                      companyName: e.target.value,
                    }))
                  }
                  placeholder="Company"
                />
                <Input
                  value={editForm.role}
                  onChange={e => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="Role"
                />
                <Input
                  value={editForm.type}
                  onChange={e =>
                    setEditForm(prev => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                  placeholder="Full-time"
                />
                <Input
                  value={editForm.location}
                  onChange={e =>
                    setEditForm(prev => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder="Location"
                />
                <YearMonthPicker
                  date={editForm.startDate}
                  setDate={date => setEditForm(prev => ({ ...prev, startDate: date }))}
                  placeholder="Start Date"
                />
                <YearMonthPicker
                  date={editForm.endDate}
                  setDate={date => setEditForm(prev => ({ ...prev, endDate: date }))}
                  placeholder="End Date"
                />
              </div>
            )}

            <AccordionTrigger className="flex-1 hover:no-underline py-3">
              <div className="flex flex-col items-start text-left">
                {!isEditing && (
                  <>
                    <div className={`${!experience.enabled ? 'text-muted-foreground' : ''}`}>
                      {experience.companyName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <SeperateList
                        data={[experience.role, experience.startDate, experience.endDate]}
                        by=" • "
                      />
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
                    variant="outline-destructive"
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
                items={experience.items.map(item => item.id)}
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
              <AddItemForm onSave={handleSaveNewItem} onCancel={handleCancelAddItem} />
            )}

            <div className="flex justify-end mt-4 ">
              {!addingItem && (
                <Button size="sm" variant="default" onClick={handleAddItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Experience
                </Button>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
