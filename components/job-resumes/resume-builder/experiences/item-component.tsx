'use client';

import { useState } from 'react';
import type { ExperienceItem, Variation } from '@/types/resume';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { CopyPlus, Edit, GripVertical, Plus, Save, Trash2, X } from 'lucide-react';
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

import { VariationList } from './variation-list';
import { AddVariationForm } from './add-variation-form';
import { randomNDigits } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { VariationMatchingScores } from './variation-matching-scores';
import { generateId } from '@/lib/resume-content';

type ItemComponentProps = {
  experienceId: string;
  item: ExperienceItem;
  onUpdate: (item: ExperienceItem) => void;
  onDelete: (itemId: string) => void;
};

export function ItemComponent({ experienceId, item, onUpdate, onDelete }: ItemComponentProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    description: item.description,
  });
  const [variationEditForm, setVariationEditForm] = useState({
    description: item.variations[0]?.content,
  });

  const [addingVariation, setAddingVariation] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleEdit = () => {
    setEditForm({
      description: item.description,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate({
      ...item,
      description: editForm.description,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleAddVariation = () => {
    setAddingVariation(true);
  };

  const handleSaveVariation = () => {
    onUpdate({
      ...item,
      variations: [
        {
          ...item.variations[0],
          content: variationEditForm.description,
        },
      ],
    });
    setIsEditing(false);
  };

  const handleSaveNewVariation = (content: string) => {
    const newVariations: Variation[] = content
      .split('\n')
      .filter(item => item.trim().length > 0)
      .map(content => ({
        id: generateId('experiences.items.variations'),
        content,
        enabled: true,
      }));

    onUpdate({
      ...item,
      variations: [...item.variations, ...newVariations],
    });

    setAddingVariation(false);
  };

  const handleCancelAddVariation = () => {
    setAddingVariation(false);
  };

  const handleUpdateVariation = (updatedVariation: Variation) => {
    onUpdate({
      ...item,
      variations: item.variations.map(variation =>
        variation.id === updatedVariation.id ? updatedVariation : variation,
      ),
    });
  };

  const handleDeleteVariation = (variationId: string) => {
    onUpdate({
      ...item,
      variations: item.variations.filter(variation => variation.id !== variationId),
    });
  };

  const handleDragEndVariations = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = item.variations.findIndex(variation => variation.id === active.id);
      const newIndex = item.variations.findIndex(variation => variation.id === over.id);

      onUpdate({
        ...item,
        variations: arrayMove(item.variations, oldIndex, newIndex),
      });
    }
  };

  const handleToggleEnabled = (checked: boolean) => {
    onUpdate({
      ...item,
      enabled: checked,
      ...(item.variations.length === 1 && {
        variations: [{ ...item.variations[0], enabled: checked }],
      }),
    });
  };

  if (item.variations.length === 1) {
    return (
      <div ref={setNodeRef} style={style} className=" ">
        <div className="flex-1 border rounded-md p-2 pb- group ">
          <div className="flex items-center justify-between relative">
            <div className="flex-1">
              <div className="flex justify-between items-start flex-wrap">
                {isEditing ? (
                  <Textarea
                    value={variationEditForm.description}
                    onChange={e =>
                      setVariationEditForm(prev => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Experience description ..."
                    className=" "
                  />
                ) : (
                  <div className="flex items-start">
                    <div
                      className="mt-0.5 mr-2 cursor-grab text-muted-foreground hover:text-foreground pl-2"
                      {...attributes}
                      {...listeners}
                    >
                      <GripVertical className="h-4 w-4" />
                    </div>
                    <Checkbox
                      id={`item-${item.id}`}
                      checked={item.enabled && item.variations[0].enabled}
                      onCheckedChange={handleToggleEnabled}
                      className="mr-3 mt-0.5"
                    />
                    <div className="flex flex-col">
                      <p
                        className={`font-medium ${
                          !(item.enabled && item.variations[0].enabled)
                            ? 'text-muted-foreground'
                            : ''
                        }`}
                      >
                        {item.variations[0].content}
                      </p>
                      <VariationMatchingScores variation={item.variations[0]} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/80 self-start gap-2 ps-2 pb-2 group-hover:flex hidden absolute top-0 right-0">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={handleSaveVariation}>
                    <Save className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={handleAddVariation}>
                    <CopyPlus className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleEdit}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline-destructive" size="sm" onClick={() => onDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          {/* Add Variation Form */}
          {addingVariation && (
            <div className="ml-0 mt-2 ">
              <AddVariationForm
                onSave={handleSaveNewVariation}
                onCancel={handleCancelAddVariation}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="mb-3">
      <div className="flex-1 border rounded-md p-2 pb-0">
        <div className="flex items-start">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-3">
              {isEditing ? (
                <Input
                  value={editForm.description}
                  onChange={e =>
                    setEditForm(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Item description"
                  className=" "
                />
              ) : (
                <div className="flex items-center">
                  <div
                    className=" mr-2 cursor-grab text-muted-foreground hover:text-foreground pl-2"
                    {...attributes}
                    {...listeners}
                  >
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <Checkbox
                    id={`item-${item.id}`}
                    checked={item.enabled}
                    onCheckedChange={handleToggleEnabled}
                    className="mr-3  "
                  />
                  <h4 className={`font-medium ${!item.enabled ? 'text-muted-foreground' : ''}`}>
                    {item.description ? (
                      <> {item.description}</>
                    ) : (
                      <span className="text-muted-foreground">No Description</span>
                    )}
                  </h4>
                </div>
              )}

              <div className="flex gap-2 ml-4">
                {isEditing ? (
                  <>
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      <Save className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline-destructive"
                      size="sm"
                      onClick={() => onDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Variations */}
            <div className="ml-0  ">
              {/* Variations List with Drag and Drop */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEndVariations}
              >
                <SortableContext
                  items={item.variations.map(variation => variation.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <VariationList
                    experienceId={experienceId}
                    itemId={item.id}
                    variations={item.variations}
                    onUpdate={handleUpdateVariation}
                    onDelete={handleDeleteVariation}
                  />
                </SortableContext>
              </DndContext>
              <div className="flex justify-between items-center mb-2 mt-2">
                {/* <h5 className="text-sm font-bold">Variations</h5> */}
                {!addingVariation && (
                  <Button size="sm" variant="ghost" onClick={handleAddVariation}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Variation
                  </Button>
                )}
              </div>

              {/* Add Variation Form */}
              {addingVariation && (
                <AddVariationForm
                  onSave={handleSaveNewVariation}
                  onCancel={handleCancelAddVariation}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
