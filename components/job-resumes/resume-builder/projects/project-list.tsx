'use client';

import type { ResumeContent, ResumeProject } from '@/types/resume';
import { ProjectItem } from './project-item';

type ProjectListProps = {
  resume: ResumeContent;
  onUpdate: (project: ResumeProject) => void;
  onDelete: (projectId: string) => void;
};

export function ProjectList({ resume, onUpdate, onDelete }: ProjectListProps) {
  return (
    <div className="space-y-4">
      {resume.projects.map(project => (
        <ProjectItem key={project.id} project={project} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </div>
  );
}
