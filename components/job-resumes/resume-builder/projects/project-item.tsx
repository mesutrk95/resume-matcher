"use client";

import { useState } from "react";
import type { ResumeProject } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, GripVertical, Save, Trash2, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { YearMonthPicker } from "@/components/ui/year-month-picker";
import { useResumeBuilder } from "../context/useResumeBuilder";
import { MatchPercentageIndicator } from "../match-percentage-indicator";

type ProjectItemProps = {
  project: ResumeProject;
  onUpdate: (project: ResumeProject) => void;
  onDelete: (projectId: string) => void;
};

export function ProjectItem({ project, onUpdate, onDelete }: ProjectItemProps) {
  const { scores } = useResumeBuilder();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: project.name,
    content: project.content,
    link: project.link,
  });

  // Parse dates from strings to Date objects for the date picker
  const parseDate = (dateStr: string): Date | undefined => {
    if (dateStr === "Present") return undefined;

    return new Date(`${dateStr}/01`);
  };

  const [startDate, setStartDate] = useState<Date | undefined>(
    parseDate(project.startDate)
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    parseDate(project.endDate)
  );
  const [isPresent, setIsPresent] = useState(project.endDate === "Present");

  const handleEdit = () => {
    setEditForm({
      name: project.name,
      content: project.content,
      link: project.link,
    });
    setStartDate(parseDate(project.startDate));
    setEndDate(parseDate(project.endDate));
    setIsPresent(project.endDate === "Present");
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate({
      ...project,
      name: editForm.name,
      content: editForm.content,
      link: editForm.link,
      startDate: startDate ? format(startDate, "yyyy/MM") : project.startDate,
      endDate: isPresent
        ? "Present"
        : endDate
        ? format(endDate, "yyyy/MM")
        : project.endDate,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handlePresentToggle = (checked: boolean) => {
    setIsPresent(checked);
    if (checked) {
      setEndDate(undefined);
    }
  };

  const handleToggleEnabled = (checked: boolean) => {
    onUpdate({
      ...project,
      enabled: checked,
    });
  };

  const score = scores?.[project.id];

  return (
    <div ref={setNodeRef} style={style} className="border rounded-md p-4">
      <div className="flex items-start">
        <div
          className="p-1 mr-2 cursor-grab text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </div>

        <Checkbox
          id={`project-${project.id}`}
          checked={project.enabled}
          onCheckedChange={handleToggleEnabled}
          className="mr-3 mt-1"
        />

        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Project Name
                </label>
                <Input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Project name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Project Link
                </label>
                <Input
                  value={editForm.link}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, link: e.target.value }))
                  }
                  placeholder="Project link"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Start Date
                  </label>

                  <YearMonthPicker
                    date={startDate || new Date()}
                    setDate={setStartDate}
                    placeholder="Select start date"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    End Date
                  </label>
                  {isPresent ? (
                    <Input value="Present" disabled className="bg-muted" />
                  ) : (
                    <YearMonthPicker
                      date={endDate || new Date()}
                      setDate={setEndDate}
                      placeholder="Select end date"
                    />
                  )}
                  <div className="flex items-center mt-2">
                    <Checkbox
                      id={`isPresent-${project.id}`}
                      checked={isPresent}
                      onCheckedChange={handlePresentToggle}
                      className="mr-2"
                    />
                    <label
                      htmlFor={`isPresent-${project.id}`}
                      className="text-sm"
                    >
                      Current project
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Description
                </label>
                <Textarea
                  value={editForm.content}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  placeholder="Project description"
                  rows={8}
                />
              </div>
            </div>
          ) : (
            <div>
              <h3
                className={`font-medium ${
                  !project.enabled ? "text-muted-foreground" : ""
                }`}
              >
                {project.name}
              </h3>
              <div className="text-sm text-muted-foreground  ">
                {project.startDate} - {project.endDate}
              </div>
              <div className="text-sm text-muted-foreground  ">
                {project.link}
              </div>
              <p
                className={`text-sm mt-2 ${
                  !project.enabled ? "text-muted-foreground" : ""
                }`}
              >
                {project.content}
              </p>
              {score && (
                <>
                  {/* <div className="ml-2 inline-flex">
                          <PercentageIndicator
                            value={(score?.score || 0) * 100}
                          />
                        </div> */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    <MatchPercentageIndicator
                      value={(score?.score || 0) * 100}
                    />
                    {score?.matched_keywords?.map((k) => (
                      <span
                        key={k}
                        className="rounded-full px-2 py-1 bg-slate-200 font-bold text-xs"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 ml-4">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(project.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
