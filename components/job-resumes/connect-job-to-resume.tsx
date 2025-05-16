import { getJobs } from '@/actions/job';
import { AsyncSelect } from '@/components/ui/async-select';
import { LoadingButton } from '@/components/ui/loading-button';
import { trpc } from '@/providers/trpc';
import { Job } from '@prisma/client';
import clsx from 'clsx';
import React, { useCallback, useState } from 'react';
import { toast } from 'sonner';

type JobItem = Pick<Job, 'companyName' | 'id' | 'title' | 'location' | 'postedAt'>;

export const ConnectJobToResume = ({
  jobResumeId,
  className,
  onJobConnected,
  connectButtonVariant = 'default',
}: {
  jobResumeId: string;
  className?: string;
  onJobConnected?: () => void;
  connectButtonVariant?: 'default' | 'outline';
}) => {
  const connectJobResumeToJob = trpc.jobResume.connectJobResumeToJob.useMutation();
  const [jobId, setJobId] = useState<string>('');

  const fetchData = useCallback(async (query?: string) => {
    const result = await getJobs({ search: query, pageSize: 5 });
    if (!result.data) {
      return [];
    }
    return result.data.jobs;
  }, []);
  const getOptionValue = useCallback((item: JobItem) => item.id, []);
  const handleConnectJob = () => {
    connectJobResumeToJob.mutateAsync({ jobResumeId, jobId }).then(() => {
      toast.success('Job connected successfully!');
      onJobConnected?.();
    });
  };

  return (
    <div className={clsx('min-w-[250px] flex gap-2 justify-center', className)}>
      <AsyncSelect<JobItem>
        fetcher={fetchData}
        renderOption={item => (
          <div className="text-xs">
            <h5 className="font-semibold">{item.title}</h5>
            <p className="text-muted-foreground text-xs">At {item.companyName}</p>
          </div>
        )}
        getOptionValue={getOptionValue}
        getDisplayValue={item => (
          <span className="max-w-52 overflow-hidden text-ellipsis block text-nowrap">
            {item.title}
          </span>
        )}
        label="Job"
        placeholder="Select a job ..."
        value={jobId}
        onChange={setJobId}
        preload={false}
        triggerClassName="flex-grow"
      />
      <LoadingButton
        disabled={!jobId}
        loading={connectJobResumeToJob.isPending}
        variant={connectButtonVariant}
        loadingText="Connecting ..."
        onClick={handleConnectJob}
      >
        Connect!
      </LoadingButton>
    </div>
  );
};
