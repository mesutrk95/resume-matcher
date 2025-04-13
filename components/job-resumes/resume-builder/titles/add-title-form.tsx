'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

type AddTitleFormProps = {
  onSave: (content: string) => void;
  onCancel: () => void;
};

export function AddTitleForm({ onSave, onCancel }: AddTitleFormProps) {
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (content.trim()) {
      onSave(content);
    }
  };

  return (
    <Card className="mb-4 p-4">
      <h4 className="font-medium mb-2">New Target Title</h4>
      <Input
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Enter title"
        className="mb-3"
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSubmit} disabled={!content.trim()}>
          Save
        </Button>
      </div>
    </Card>
  );
}
