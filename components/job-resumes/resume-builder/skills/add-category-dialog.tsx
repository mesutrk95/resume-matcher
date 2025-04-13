'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

type AddCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (category: string) => void;
  existingCategories: string[];
};

export function AddCategoryDialog({
  open,
  onOpenChange,
  onSave,
  existingCategories,
}: AddCategoryDialogProps) {
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!category.trim()) {
      setError('Category name is required');
      return;
    }

    if (existingCategories.includes(category.trim())) {
      setError('This category already exists');
      return;
    }

    onSave(category.trim());
    setCategory('');
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Category Name</label>
            <Input
              value={category}
              onChange={e => {
                setCategory(e.target.value);
                setError('');
              }}
              placeholder="e.g. Programming Languages"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setCategory('');
              setError('');
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!category.trim()}>
            Add Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
