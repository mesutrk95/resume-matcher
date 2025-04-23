import { JobForm } from '@/components/jobs/job-form';
import { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Create New Job',
};

export default async function CreateJobPage() {
  return <JobForm />;
}
