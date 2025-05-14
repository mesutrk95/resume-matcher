'use server';

import { db } from '@/lib/db';
import { ResumeTemplate, ResumeTemplateStatus } from '@prisma/client';

export const getResumeTemplates = async (filter?: { status?: ResumeTemplateStatus }) => {
  return db.resumeTemplate.findMany({ where: filter });
};

export const getResumeTemplateById = async (id?: string) => {
  return db.resumeTemplate.findUnique({ where: { id } });
};

export const updateResumeTemplate = async (resumeTemplate: ResumeTemplate) => {
  return db.resumeTemplate.update({
    where: { id: resumeTemplate.id },
    data: {
      name: resumeTemplate.name,
      ...(resumeTemplate.content && { content: resumeTemplate.content }),
    },
  });
};

export const getDefaultResumeTemplate = async () => {
  return (
    (await db.resumeTemplate.findFirst({ where: { name: 'Classic' } })) ||
    (await db.resumeTemplate.findFirst({ where: { status: ResumeTemplateStatus.ACTIVE } }))
  );
};
