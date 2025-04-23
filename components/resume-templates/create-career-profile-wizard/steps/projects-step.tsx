'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  link: string;
}

interface ProjectsStepProps {
  onSaveProjects: (projects: Project[]) => void;
  initialProjects?: Project[];
}

export function ProjectsStep({ onSaveProjects, initialProjects = [] }: ProjectsStepProps) {
  const [projects, setProjects] = useState<Project[]>(
    initialProjects.length > 0
      ? initialProjects
      : [
          {
            id: '1',
            title: '',
            description: '',
            link: '',
          },
        ],
  );
  const [hasChanged, setHasChanged] = useState(false);

  // Auto-save when projects change, but only if they've been modified or we have initial data
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSaveProjects(projects);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [projects, onSaveProjects]);

  const addProject = () => {
    setProjects([
      ...projects,
      {
        id: Date.now().toString(),
        title: '',
        description: '',
        link: '',
      },
    ]);
    setHasChanged(true);
  };

  const removeProject = (id: string) => {
    setProjects(projects.filter(proj => proj.id !== id));
    setHasChanged(true);
  };

  const updateProject = (id: string, field: keyof Project, value: string) => {
    setProjects(projects.map(proj => (proj.id === id ? { ...proj, [field]: value } : proj)));
    setHasChanged(true);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-bold">Projects</h3>
        <p className="text-sm text-gray-500">
          Add notable projects that showcase your skills and experience.
        </p>
      </div>

      <div className="space-y-8">
        {projects.map((project, index) => (
          <div key={project.id} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Project {index + 1}</h4>
              {projects.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProject(project.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`title-${project.id}`}>Project Title</Label>
                <Input
                  id={`title-${project.id}`}
                  value={project.title}
                  onChange={e => updateProject(project.id, 'title', e.target.value)}
                  placeholder="e.g. E-commerce Website"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description-${project.id}`}>Description</Label>
                <Textarea
                  id={`description-${project.id}`}
                  value={project.description}
                  onChange={e => updateProject(project.id, 'description', e.target.value)}
                  placeholder="Describe the project, your role, and the technologies used..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`link-${project.id}`}>Link</Label>
                <Input
                  id={`link-${project.id}`}
                  value={project.link}
                  onChange={e => updateProject(project.id, 'link', e.target.value)}
                  placeholder="e.g. https://github.com/username/project"
                />
              </div>
            </div>
          </div>
        ))}

        <Button type="button" variant="outline" onClick={addProject} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Another Project
        </Button>
      </div>
    </div>
  );
}
