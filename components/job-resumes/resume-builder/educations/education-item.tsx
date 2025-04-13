'use client';

import { useState } from 'react';
import type { ResumeEducation } from '@/types/resume';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, GripVertical, Save, Trash2, X } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { YearMonthPicker } from '@/components/ui/year-month-picker';
import { SeperateList } from '@/components/shared/seperate-list';

type EducationItemProps = {
  education: ResumeEducation;
  onUpdate: (education: ResumeEducation) => void;
  onDelete: (educationId: string) => void;
};

export function EducationItem({ education, onUpdate, onDelete }: EducationItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: education.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    degree: education.degree,
    content: education.content,
    location: education.location,
    institution: education.institution,
  });

  const [startDate, setStartDate] = useState<string | undefined>(education.startDate);
  const [endDate, setEndDate] = useState<string | undefined>(education.endDate);

  const [isPresent, setIsPresent] = useState(education.endDate === 'Present');

  const handleEdit = () => {
    setEditForm({
      degree: education.degree,
      content: education.content,
      location: education.location,
      institution: education.institution,
    });
    setStartDate(education.startDate);
    setEndDate(education.endDate);
    setIsPresent(education.endDate === 'Present');
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate({
      ...education,
      degree: editForm.degree,
      content: editForm.content,
      location: editForm.location,
      institution: editForm.institution,
      startDate: startDate,
      endDate: isPresent ? 'Present' : endDate,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handlePresentToggle = (checked: boolean) => {
    setIsPresent(checked);
    if (checked) {
      setEndDate(undefined);
    }
  };

  const handleToggleEnabled = (checked: boolean) => {
    onUpdate({
      ...education,
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
          id={`education-${education.id}`}
          checked={education.enabled}
          onCheckedChange={handleToggleEnabled}
          className="mr-3 mt-1"
        />

        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Degree</label>
                <Input
                  value={editForm.degree}
                  onChange={e => setEditForm(prev => ({ ...prev, degree: e.target.value }))}
                  placeholder="Degree"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Institution</label>
                <Input
                  value={editForm.institution}
                  onChange={e =>
                    setEditForm(prev => ({
                      ...prev,
                      institution: e.target.value,
                    }))
                  }
                  placeholder="Institution name"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Location</label>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Start Date</label>
                  <YearMonthPicker
                    date={startDate}
                    setDate={setStartDate}
                    placeholder="Select start date"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">End Date</label>
                  {isPresent ? (
                    <Input value="Present" disabled className="bg-muted" />
                  ) : (
                    <YearMonthPicker
                      date={endDate}
                      setDate={setEndDate}
                      placeholder="Select end date"
                    />
                  )}
                  <div className="flex items-center mt-2">
                    <Checkbox
                      id={`isPresent-${education.id}`}
                      checked={isPresent}
                      onCheckedChange={handlePresentToggle}
                      className="mr-2"
                    />
                    <label htmlFor={`isPresent-${education.id}`} className="text-sm">
                      Currently studying
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Textarea
                  value={editForm.content}
                  onChange={e =>
                    setEditForm(prev => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  placeholder="Description"
                />
              </div>
            </div>
          ) : (
            <div>
              <h3 className={`font-medium ${!education.enabled ? 'text-muted-foreground' : ''}`}>
                {education.degree}
              </h3>
              <div className={`${!education.enabled ? 'text-muted-foreground' : ''}`}>
                {education.content}
              </div>
              <div className="text-sm text-muted-foreground">
                <SeperateList data={[education.institution, education.location]} />{' '}
                <SeperateList data={[education.startDate, education.endDate]} by=" - " />
              </div>
            </div>
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
              <Button
                variant="outline-destructive"
                size="sm"
                onClick={() => onDelete(education.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
