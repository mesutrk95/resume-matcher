'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type AddVariationFormProps = {
  onSave: (content: string) => void;
  onCancel: () => void;
};

export function AddVariationForm({ onSave, onCancel }: AddVariationFormProps) {
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    onSave(content);
  };

  return (
    <div className="mb-3 p-3 border rounded-md bg-muted/30">
      <Textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Variation content"
        className="mb-2"
        rows={2}
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSubmit}>
          Save
        </Button>
      </div>
    </div>
  );
}
