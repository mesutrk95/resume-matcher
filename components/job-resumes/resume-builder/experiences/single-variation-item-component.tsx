'use client';

import { useState } from 'react';
import type { ExperienceItem, Variation } from '@/types/resume';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CopyPlus, Edit, GripVertical, Inspect, Save, Trash2, X } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { VariationMatchingScores } from './variation-matching-scores';
import { HighlightElement } from '@/components/highlight-element';
import { shakeElement } from '../utils';
import { generateId } from '@/lib/resume-content';
import { AddVariationForm } from './add-variation-form';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SimpleTooltip } from '@/components/ui/simple-tooltip';

type SingleVariationItemComponentProps = {
  experienceId: string;
  item: ExperienceItem;
  onUpdate: (item: ExperienceItem) => void;
  onDelete: (itemId: string) => void;
};

export function SingleVariationItemComponent({
  experienceId,
  item,
  onUpdate,
  onDelete,
}: SingleVariationItemComponentProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [variationEditForm, setVariationEditForm] = useState({
    description: item.variations[0]?.content,
  });

  const [addingVariation, setAddingVariation] = useState(false);

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleAddVariation = () => {
    setAddingVariation(true);
  };
  const handleEditVariation = () => {
    setVariationEditForm({
      description: item.variations[0].content,
    });
    setIsEditing(true);
  };

  const handleSaveVariation = () => {
    console.log('variationEditForm.description', variationEditForm.description);

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

  const handleToggleEnabled = (checked: boolean) => {
    onUpdate({
      ...item,
      enabled: checked,
      ...(item.variations.length === 1 && {
        variations: [{ ...item.variations[0], enabled: checked }],
      }),
    });
  };

  return (
    <HighlightElement id={item.variations[0].id}>
      <div ref={setNodeRef} style={style} className=" ">
        <div className="flex-1 border rounded-md p-2 pb- group ">
          <div className="flex items-center justify-between relative">
            <div className="flex-1">
              <div className="flex justify-between flex-grow w-full">
                <div className="flex  flex-grow w-full ">
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
                  <div className="flex flex-col flex-grow">
                    {isEditing ? (
                      <>
                        <Textarea
                          value={variationEditForm.description}
                          onChange={e => {
                            setVariationEditForm(prev => ({
                              ...prev,
                              description: e.target.value,
                            }));
                          }}
                          placeholder="Experience description ..."
                          className="w-full p-1"
                          // onBlur={handleSaveVariation}
                        />
                        <div className="flex gap-4 mt-2">
                          <div className="flex items-start flex-grow">
                            <VariationMatchingScores variation={item.variations[0]} />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={handleCancel}>
                              <X className="h-4 w-4" /> Cancel
                            </Button>
                            <Button size="sm" onClick={handleSaveVariation}>
                              <Save className="h-4 w-4" /> Save
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <p
                          className={`font-medium ${
                            !(item.enabled && item.variations[0].enabled)
                              ? 'text-muted-foreground'
                              : ''
                          }`}
                          onClick={handleEditVariation}
                        >
                          {item.variations[0].content}
                        </p>

                        <VariationMatchingScores variation={item.variations[0]} />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {!isEditing && (
              <div className="bg-white/80 self-start gap-2 ps-2 pb-2 group-hover:flex hidden absolute top-0 right-0">
                <SimpleTooltip text="Find in Resume">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shakeElement('doc-' + item.variations[0].id)}
                  >
                    <Inspect className="h-4 w-4" />
                  </Button>
                </SimpleTooltip>

                <SimpleTooltip text="Edit">
                  <Button variant="outline" size="sm" onClick={handleEditVariation}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </SimpleTooltip>
                <SimpleTooltip text="Add Variation">
                  <Button variant="outline" size="sm" onClick={handleAddVariation}>
                    <CopyPlus className="h-4 w-4" />
                  </Button>
                </SimpleTooltip>
                <SimpleTooltip text="Delete Item">
                  <Button variant="outline-destructive" size="sm" onClick={() => onDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </SimpleTooltip>
              </div>
            )}
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
    </HighlightElement>
  );
}
