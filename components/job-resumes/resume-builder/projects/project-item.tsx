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
import { Calendar } from "@/components/ui/calendar";

type ProjectItemProps = {
  project: ResumeProject;
  onUpdate: (project: ResumeProject) => void;
  onDelete: (projectId: string) => void;
};

export function ProjectItem({ project, onUpdate, onDelete }: ProjectItemProps) {
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
  });

  // Parse dates from strings to Date objects for the date picker
  const parseDate = (dateStr: string): Date | undefined => {
    if (dateStr === "Present") return undefined;

    const parts = dateStr.split(" ");
    if (parts.length !== 2) return undefined;

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthIndex = months.indexOf(parts[0]);
    if (monthIndex === -1) return undefined;

    const year = Number.parseInt(parts[1]);
    if (isNaN(year)) return undefined;

    return new Date(year, monthIndex, 1);
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
      startDate: startDate
        ? format(startDate, "yyyy MM dd")
        : project.startDate,
      endDate: isPresent
        ? "Present"
        : endDate
        ? format(endDate, "yyyy MM dd")
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Start Date
                  </label>
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    // initialFocus
                  />

                  {/* <DatePicker date={startDate} setDate={setStartDate} placeholder="Select start date" /> */}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    End Date
                  </label>
                  {isPresent ? (
                    <Input value="Present" disabled className="bg-muted" />
                  ) : (
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      // initialFocus
                    />
                    // <DatePicker
                    //   date={endDate}
                    //   setDate={setEndDate}
                    //   placeholder="Select end date"
                    // />
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
                  rows={3}
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
              <div className="text-sm text-muted-foreground mb-2">
                {project.startDate} - {project.endDate}
              </div>
              <p
                className={`text-sm ${
                  !project.enabled ? "text-muted-foreground" : ""
                }`}
              >
                {project.content}
              </p>
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
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
