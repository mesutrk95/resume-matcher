'use server';

import { db } from '@/lib/db';
import { ResumeTemplate } from '@prisma/client';

export async function getRootDir() {
  const rootDir = process.cwd();
  return rootDir;
}

export const getResumeTemplates = async () => {
  return db.resumeTemplate.findMany();
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
  return db.resumeTemplate.findFirst();
};
