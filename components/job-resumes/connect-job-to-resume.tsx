import { getJobs } from '@/actions/job';
import { connectJobResumeToJob } from '@/actions/job-resume';
import { AsyncSelect } from '@/components/ui/async-select';
import { LoadingButton } from '@/components/ui/loading-button';
import { Job } from '@prisma/client';
import React, { useCallback, useState, useTransition } from 'react';
import { toast } from 'sonner';

type JobItem = Pick<Job, 'companyName' | 'id' | 'title' | 'location' | 'postedAt'>;

export const ConnectJobToResume = ({ jobResumeId }: { jobResumeId: string }) => {
  const [isConnectingJob, startConnectingJob] = useTransition();
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
    startConnectingJob(async () => {
      connectJobResumeToJob(jobResumeId, jobId)
        .then(() => {
          toast.success('Job connected successfully!');
        })
        .catch(() => toast.error('Something went wrong.'));
    });
  };

  return (
    <div className="min-w-[250px] flex gap-2 justify-center">
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
        width={'300px'}
      />
      <LoadingButton
        disabled={!jobId}
        loading={isConnectingJob}
        variant={'outline'}
        loadingText="Connecting to job ..."
        onClick={handleConnectJob}
      >
        Connect!
      </LoadingButton>
    </div>
  );
};
