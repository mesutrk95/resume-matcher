'use client';

import { useState } from 'react';
import type { ResumeProfessionalSummary } from '@/types/resume';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, GripVertical, Save, Trash2, X } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type SummaryItemProps = {
  summary: ResumeProfessionalSummary;
  onUpdate: (summary: ResumeProfessionalSummary) => void;
  onDelete: (summaryId: string) => void;
};

export function SummaryItem({ summary, onUpdate, onDelete }: SummaryItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: summary.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    content: summary.content,
  });

  const handleEdit = () => {
    setEditForm({
      content: summary.content,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate({
      ...summary,
      content: editForm.content,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleToggleEnabled = (checked: boolean) => {
    onUpdate({
      ...summary,
      enabled: checked,
    });
  };

  return (
    <div ref={setNodeRef} style={style} className="border rounded-md p-4">
      <div className="flex items-start">
        <div
          className="p-1 mr-2 cursor-grab text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </div>

        <Checkbox
          id={`summary-${summary.id}`}
          checked={summary.enabled}
          onCheckedChange={handleToggleEnabled}
          className="mr-3 mt-1"
        />

        <div className="flex-1">
          {isEditing ? (
            <Textarea
              value={editForm.content}
              onChange={e => setEditForm({ content: e.target.value })}
              placeholder="Professional summary"
              className="mb-2"
              rows={3}
            />
          ) : (
            <p className={`text-sm ${!summary.enabled ? 'text-muted-foreground' : ''}`}>
              {summary.content}
            </p>
          )}
        </div>

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
              <Button variant="outline-destructive" size="sm" onClick={() => onDelete(summary.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
