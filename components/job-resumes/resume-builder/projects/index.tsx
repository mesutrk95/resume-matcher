"use client";

import { useState } from "react";
import type { ResumeContent, ResumeProject } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { ProjectList } from "./project-list";
import { AddProjectForm } from "./add-project-form";
import { randomNDigits } from "@/lib/utils";
import { ResumeBuilderCard } from "../resume-builder-card";

type ProjectsSectionProps = {
  resume: ResumeContent;
  onUpdate: (projects: ResumeProject[]) => void;
};

export function ProjectsSection({ resume, onUpdate }: ProjectsSectionProps) {
  const [addingProject, setAddingProject] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddProject = () => {
    setAddingProject(true);
  };

  const handleSaveNewProject = (project: {
    name: string;
    content: string;
    startDate: string;
    endDate: string;
    link: string;
  }) => {
    const newProject: ResumeProject = {
      id: `project_${randomNDigits()}`,
      name: project.name,
      content: project.content,
      startDate: project.startDate,
      endDate: project.endDate,
      link: project.link,
      enabled: true,
    };

    onUpdate([...resume.projects, newProject]);
    setAddingProject(false);
  };

  const handleCancelAddProject = () => {
    setAddingProject(false);
  };

  const handleUpdateProject = (updatedProject: ResumeProject) => {
    onUpdate(
      resume.projects.map((project) =>
        project.id === updatedProject.id ? updatedProject : project
      )
    );
  };

  const handleDeleteProject = (projectId: string) => {
    onUpdate(resume.projects.filter((project) => project.id !== projectId));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = resume.projects.findIndex(
        (project) => project.id === active.id
      );
      const newIndex = resume.projects.findIndex(
        (project) => project.id === over.id
      );

      onUpdate(arrayMove(resume.projects, oldIndex, newIndex));
    }
  };

  return (
    <ResumeBuilderCard
      onAdd={handleAddProject}
      isAdding={addingProject}
      title="Projects"
      addButtonText="Add Project"
    >
      {addingProject && (
        <AddProjectForm
          onSave={handleSaveNewProject}
          onCancel={handleCancelAddProject}
        />
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={resume.projects.map((project) => project.id)}
          strategy={verticalListSortingStrategy}
        >
          <ProjectList
            resume={resume}
            onUpdate={handleUpdateProject}
            onDelete={handleDeleteProject}
          />
        </SortableContext>
      </DndContext>
    </ResumeBuilderCard>
  );
}
