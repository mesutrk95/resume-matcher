'use client';

import React, { useState, useTransition } from 'react';
import Moment from 'react-moment';
import { Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { JobResume } from '@prisma/client';
import { toast } from 'sonner';
import { trpc } from '@/providers/trpc';
import { useRouter } from 'next/navigation';

interface ResumeHeaderProps {
  jobResume: JobResume;
  onUpdate?: () => void;
}

export const ResumeHeader: React.FC<ResumeHeaderProps> = ({ jobResume, onUpdate }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>(jobResume.name || '');
  const router = useRouter();

  const updateJobResume = trpc.jobResume.updateJobResume.useMutation();

  const handleRename = async () => {
    if (!newName?.trim()) return;
    try {
      await updateJobResume.mutateAsync({
        jobResumeId: jobResume.id,
        name: newName,
      });

      setIsDialogOpen(false);

      // Call the optional onUpdate callback to refresh parent data if needed
      if (onUpdate) {
        onUpdate();
      }
      toast.success('Resume name updated successfully!');
      router.refresh();
    } catch (error) {
      toast.error('Failed to update resume name. Please try again.');
    }
  };

  // Reset name when dialog opens to current value
  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (open) {
      setNewName(jobResume.name || '');
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !updateJobResume.isPending && newName?.trim()) {
      handleRename();
    }
  };

  return (
    <>
      <div
        className="flex items-center gap-2 cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsDialogOpen(true)}
      >
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold cursor-pointer">{jobResume.name} Resume</h2>
            <Pencil
              size={16}
              className={`text-muted-foreground transition-opacity duration-200 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </div>
          <span className="text-muted-foreground text-xs">
            Last updated <Moment date={jobResume.updatedAt} utc fromNow />
          </span>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Resume</DialogTitle>
            <DialogDescription>
              Enter a new name for your resume. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter resume name"
              className="w-full"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleRename}
              disabled={updateJobResume.isPending || !newName?.trim()}
            >
              {updateJobResume.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
