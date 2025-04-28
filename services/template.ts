'use server';

import { ResumeTemplate } from '@/types/resume-template';
import { readFileSync } from 'fs';
import path from 'path';

const allTemplates = [
  {
    id: '4ae617f6-aa77-457d-bd1f-b40a8a87ed8a',
    path: '/templates/classic.json',
  },
  {
    id: '4da27353-99cd-4021-83dd-ef5fecc0f45d',
    path: '/templates/auroa-two-column.json',
  },
  {
    id: '20e19a32-7227-48bc-b569-06f911e2fd66',
    path: '/templates/minimal-modern.json',
  },
];

export async function getRootDir() {
  const rootDir = process.cwd();
  return rootDir;
}

export const getResumeTemplates = async () => {
  const dir = await getRootDir();
  return allTemplates.map(t => {
    const data = readFileSync(path.join(dir, 'public', t.path), 'utf-8');
    const template = JSON.parse(data);
    return { ...template, id: t.id } as ResumeTemplate;
  });
};

export const getResumeTemplateById = async (id?: string) => {
  const dir = await getRootDir();
  const template = allTemplates.find(t => t.id === id);
  if (template) {
    const data = readFileSync(path.join(dir, 'public', template.path), 'utf-8');
    const templateData = JSON.parse(data);
    return { ...templateData, id: template.id } as ResumeTemplate;
  }
  return null;
};

export const getDefaultResumeTemplate = async () => {
  return getResumeTemplateById(allTemplates[0].id);
};
