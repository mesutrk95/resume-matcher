'use server';

import moment from 'moment';
import * as chrono from 'chrono-node';
import { ForbiddenException } from '@/lib/exceptions';
import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { DEFAULT_RESUME_CONTENT } from './constants';
import { ResumeContent } from '@/types/resume';
import { withErrorHandling } from '@/lib/with-error-handling';
import { resumeContentSchema } from '@/schemas/resume';
import { deepUpdateValues, getMimeType } from '@/lib/utils';
import { CareerProfile } from '@prisma/client';
import { generateId } from '@/lib/resume-content';
import { AIRequestModel, createAIServiceManager } from '@/lib/ai/index';
import { AI } from '@/lib/constants';

export const deleteCareerProfile = withErrorHandling(async (id: string) => {
  const user = await currentUser();
  if (!user?.emailVerified) {
    throw new ForbiddenException('Email not verified.');
  }
  await db.careerProfile.delete({
    where: { id, userId: user?.id },
  });
  revalidatePath('/career-profiles');
  return true;
});

export const updateCareerProfile = withErrorHandling(
  async (careerProfile: Partial<CareerProfile>) => {
    const user = await currentUser();
    if (!user?.emailVerified) {
      throw new ForbiddenException('Email not verified.');
    }

    // Update job in database
    const updatedJob = await db.careerProfile.update({
      where: {
        id: careerProfile.id,
        userId: user?.id,
      },
      data: {
        name: careerProfile.name,
        description: careerProfile.description,
        draft: careerProfile.draft,
        content: careerProfile.content || DEFAULT_RESUME_CONTENT,
      },
    });

    revalidatePath('/career-profiles');
    revalidatePath(`/career-profiles/${careerProfile.id}`);

    return updatedJob;
  },
);

export const updateCareerProfileContent = withErrorHandling(
  async (careerProfileId: string, resumeContent: ResumeContent) => {
    const user = await currentUser();
    if (!user?.emailVerified) {
      throw new ForbiddenException('Email not verified.');
    }

    const updatedJob = await db.careerProfile.update({
      where: {
        id: careerProfileId,
        userId: user?.id,
      },
      data: {
        content: resumeContent || DEFAULT_RESUME_CONTENT,
      },
    });

    revalidatePath('/career-profiles');
    revalidatePath(`/career-profiles/${careerProfileId}`);

    return updatedJob;
  },
);

export const createCareerProfile = withErrorHandling(
  async (resumeContent?: ResumeContent, name?: string, description?: string) => {
    const user = await currentUser();
    if (!user?.emailVerified) {
      throw new ForbiddenException('Email not verified.');
    }

    // Update job in database
    const careerProfile = await db.careerProfile.create({
      data: {
        name: name || 'No name Career Profile',
        description: description,
        content: resumeContent || DEFAULT_RESUME_CONTENT,
        userId: user?.id!,
      },
    });

    revalidatePath('/career-profiles');

    return careerProfile;
  },
);

export const createCareerProfileFromResumePdf = withErrorHandling(async (formData: FormData) => {
  const user = await currentUser();
  if (!user?.emailVerified) {
    throw new ForbiddenException('Email not verified.');
  }

  const file = formData.get('file') as File;
  const bytes = await file.arrayBuffer();
  const pdfBuffer = Buffer.from(bytes);

  // Create AI service manager directly
  const serviceManager = createAIServiceManager();
  const prompt = `Convert this resume PDF to a structured format based on the schema
      Extract all resume information from this PDF and structure it according to the schema.
    - ids convention is based on the path they have prefix then an underscore like the following:
    - Generate IDs with format prefix_xxxxx. Path determines prefix: experiences=exp_, experiences.items=expitem_, experiences.items.variations=var_, titles=title_, summaries=summary_, educations=edu_, skills/skills.skills=skill_, projects=project_, awards=award_, certifications=cert_, languages=lang_, interests=interest_, references=ref_. The xxxxx is a random 5-character alphabetic string. Example: skill_abcde for a skill.
    - For each experience item in resume file, add one experience item and fill its description, leave the variations with an empty array
    - Create structured experience items with variations`;

  const request: AIRequestModel<ResumeContent> = {
    prompt,
    responseFormat: 'json',
    contents: [
      {
        type: 'pdf',
        data: pdfBuffer,
      },
    ],
    zodSchema: resumeContentSchema,
  };

  // Execute the request
  const content = await serviceManager.executeRequest<ResumeContent>(request);

  // Post-process the results
  let processedContent = {
    ...content,
    experiences: content.experiences.map(exp => ({
      ...exp,
      items: exp.items.map(item => ({
        ...item,
        variations: [
          {
            id: generateId('experiences.items.variations'),
            content: item.description,
            enabled: true,
          },
        ],
        description: '',
      })),
    })),
    skills: [
      {
        category: 'Default',
        enabled: true,
        skills: content.skills.map(set => set.skills).flat(),
      },
    ],
  };

  processedContent = deepUpdateValues(processedContent, (path, key, value) => {
    try {
      if (
        key.toLowerCase().includes('date') &&
        typeof value === 'string' &&
        (value?.length || 0) > 0
      ) {
        const parsedDate = chrono.parseDate(value);
        const formattedDate = moment(parsedDate).format('MM/YYYY');
        return formattedDate;
      }
    } catch (error) {}

    return value;
  });

  // Create career profile in database
  const careerProfile = await db.careerProfile.create({
    data: {
      name: processedContent.titles?.[0]?.content || 'No name career profile',
      content: processedContent,
      userId: user?.id!,
    },
  });

  revalidatePath('/career-profiles');
  return careerProfile;
});

export const getCareerProfile = withErrorHandling(async (id: string) => {
  const user = await currentUser();

  // Update job in database
  const rt = await db.careerProfile.findUnique({
    where: {
      id,
      userId: user?.id!,
    },
  });

  return rt;
});
