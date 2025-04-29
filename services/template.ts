'use server';

import { db } from '@/lib/db';

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

export const getDefaultResumeTemplate = async () => {
  return db.resumeTemplate.findFirst();
};
