'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type AddSkillFormProps = {
  onSave: (skill: { content: string; category: string }) => void;
  onCancel: () => void;
  existingCategories: string[];
};

export function AddSkillForm({ onSave, onCancel, existingCategories }: AddSkillFormProps) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);

  const handleSubmit = () => {
    if (content.trim()) {
      onSave({
        content,
        category: isAddingNewCategory ? newCategory : category,
      });
    }
  };

  const handleCategorySelect = (value: string) => {
    if (value === 'new') {
      setIsAddingNewCategory(true);
    } else {
      setCategory(value);
      setIsAddingNewCategory(false);
    }
  };

  return (
    <Card className="mb-4 p-4">
      <h4 className="font-medium mb-2">New Skill</h4>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Skill</label>
          <Input
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Enter skill"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Category</label>
          {isAddingNewCategory ? (
            <div className="flex gap-2">
              <Input
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                placeholder="Enter new category"
                className="flex-1"
              />
              <Button variant="outline" size="sm" onClick={() => setIsAddingNewCategory(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Select onValueChange={handleCategorySelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {existingCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
                <SelectItem value="new">+ Add new category</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!content.trim() || (!category && !newCategory)}
        >
          Save
        </Button>
      </div>
    </Card>
  );
}
