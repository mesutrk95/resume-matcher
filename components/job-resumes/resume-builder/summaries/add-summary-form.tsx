'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

type AddSummaryFormProps = {
  onSave: (content: string) => void;
  onCancel: () => void;
};

export function AddSummaryForm({ onSave, onCancel }: AddSummaryFormProps) {
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (content.trim()) {
      onSave(content);
    }
  };

  return (
    <Card className="mb-4 p-4">
      <h4 className="font-medium mb-2">New Professional Summary</h4>
      <Textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Enter professional summary"
        className="mb-3"
        rows={3}
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
