import { ConnectJobToResume } from '@/components/job-resumes/connect-job-to-resume';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { wait } from '@/lib/utils';
import { LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

type ConnectJobDialogProps = {
  //   open: boolean;
  //   onOpenChange: (open: boolean) => void;
  //   onSave?: (jobId: string) => void;
  jobResumeId: string;
};
export const ConnectJobDialog = ({ jobResumeId }: ConnectJobDialogProps) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => {}} variant={'default'}>
          <LinkIcon size={14} />
          Connect
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect a Job</DialogTitle>
        </DialogHeader>
        <div className="text-start ">
          <p className="text-muted-foreground text-xs mb-2">
            Select the job you’re targeting so we can personalize this resume for you!
          </p>
          <ConnectJobToResume
            jobResumeId={jobResumeId}
            className="justify-start w-full"
            onJobConnected={async () => {
              setOpen(false);
              await wait(800);
              router.refresh();
            }}
            connectButtonVariant={'default'}
          />
          <p className="mt-4">
            Or{' '}
            <Link className="text-primary" href={'/jobs/create'} target="_blank">
              click here to add a new job
            </Link>{' '}
            now!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
