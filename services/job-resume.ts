'use server';

import { DEFAULT_RESUME_CONTENT } from '@/actions/constants';
import { db } from '@/lib/db';
import { NotFoundException } from '@/lib/exceptions';
import { JobResumeStatusFlags } from '@/types/job-resume';
import { JobResume } from '@prisma/client';

export const getJobResumeStatusFlags = async (
  id: string,
  userId?: string,
): Promise<JobResumeStatusFlags> => {
  const jobResume = await db.jobResume.findUnique({
    where: { id, userId },
    select: {
      statusFlags: true,
    },
  });
  return jobResume?.statusFlags as JobResumeStatusFlags;
};

export const updateJobResumeStatusFlags = async (
  jobResume: string | JobResume,
  statusFlags: Partial<JobResumeStatusFlags>,
): Promise<JobResumeStatusFlags> => {
  let jb =
    typeof jobResume === 'string'
      ? await db.jobResume.findUnique({ where: { id: jobResume } })
      : jobResume;

  if (!jb) throw new NotFoundException('Job Resume not found');

  const newFlags = { ...(jb.statusFlags as JobResumeStatusFlags), ...statusFlags };
  await db.jobResume.update({
    where: { id: jb.id },
    data: { statusFlags: newFlags, updatedAt: new Date() },
  });

  return newFlags;
};

export const createJobResume = async (userId: string, careerProfileId?: string, jobId?: string) => {
  const careerProfile = careerProfileId
    ? await db.careerProfile.findUnique({
        where: { id: careerProfileId, userId },
      })
    : null;

  const job =
    jobId &&
    (await db.job.findUnique({
      where: { id: jobId, userId },
    }));

  let name = job ? `${job?.title} at ${job?.companyName}` : null;
  if (!name) name = careerProfile ? careerProfile.name : null;

  const resumeJob = await db.jobResume.create({
    data: {
      jobId: jobId,
      baseCareerProfileId: careerProfileId,
      content: careerProfile?.content || DEFAULT_RESUME_CONTENT,
      name: name || 'Blank',
      userId,
    },
  });

  return resumeJob;
};
