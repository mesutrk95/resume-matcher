'use client';

import { useEffect, useState } from 'react';
import type { ExperienceItem, Variation } from '@/types/resume';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, GripVertical, Inspect, Save, Trash2, X } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { VariationMatchingScores } from './variation-matching-scores';
import { HighlightElement } from '@/components/highlight-element';
import { countWords, shakeElement } from '../utils';

type VariationComponentProps = {
  experienceId: string;
  itemId: string;
  variation: Variation;
  experienceItem: ExperienceItem;
  onUpdate: (variation: Variation) => void;
  onDelete: (variationId: string) => void;
};

export function VariationComponent({
  experienceId,
  itemId,
  variation,
  experienceItem,
  onUpdate,
  onDelete,
}: VariationComponentProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: variation.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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

  // useEffect(() => {
  //   const totalWords = countWords(variation.content);
  //   const warn = totalWords < 8 || totalWords > 40;
  //   console.log(variation.content, totalWords, warn);
  // }, [variation.content]);

  return (
    <HighlightElement id={variation.id}>
      <div ref={setNodeRef} style={style} className={`z-2 group relative`}>
        <div className={`p-2 border-b group-hover:bg-slate-50`}>
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
              disabled={!experienceItem.enabled}
            />

            <div className="flex-1 ">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  {isEditing ? (
                    <Textarea
                      value={editForm.content}
                      onChange={e =>
                        setEditForm(prev => ({
                          ...prev,
                          content: e.target.value,
                        }))
                      }
                      placeholder="Variation content"
                      className="mb-2"
                      rows={5}
                    />
                  ) : (
                    <div
                      className={`text-sm ${variation.enabled && experienceItem.enabled ? '' : 'text-muted-foreground'}`}
                    >
                      <p>{variation.content}</p>

                      <VariationMatchingScores variation={variation} />
                    </div>
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
                    <div className="bg-white/80 self-start gap-2 p-3 group-hover:flex hidden absolute top-0 right-0 rounded-2xl">
                      {variation.enabled && experienceItem.enabled && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => shakeElement('doc-' + variation.id)}
                        >
                          <Inspect className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={handleEdit}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline-destructive"
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
    </HighlightElement>
  );
}
