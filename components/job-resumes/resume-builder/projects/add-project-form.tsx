"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { YearMonthPicker } from "@/components/ui/year-month-picker";

type AddProjectFormProps = {
  onSave: (project: {
    name: string;
    content: string;
    startDate: string;
    endDate: string;
    link: string;
  }) => void;
  onCancel: () => void;
};

export function AddProjectForm({ onSave, onCancel }: AddProjectFormProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [isPresent, setIsPresent] = useState(false);

  const handleSubmit = () => {
    if (name.trim() && content.trim() && startDate) {
      onSave({
        name,
        content,
        link,
        startDate: format(startDate, "MM/yyyy"),
        endDate: isPresent
          ? "Present"
          : endDate
          ? format(endDate, "MM/yyyy")
          : "",
      });
    }
  };

  const handlePresentToggle = (checked: boolean) => {
    setIsPresent(checked);
    if (checked) {
      setEndDate(undefined);
    }
  };

  return (
    <Card className="mb-4 p-4">
      <h4 className="font-medium mb-3">New Project</h4>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Project Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter project name"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Project Link</label>
          <Input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Enter project link"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Start Date</label>
            <YearMonthPicker
              date={startDate}
              setDate={setStartDate}
              placeholder="Select start date"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">End Date</label>
            {isPresent ? (
              <Input value="Present" disabled className="bg-muted" />
            ) : (
              <YearMonthPicker
                date={endDate}
                setDate={setEndDate}
                placeholder="Select end date"
              />
            )}
            <div className="flex items-center mt-2">
              <Checkbox
                id="isPresent-new"
                checked={isPresent}
                onCheckedChange={handlePresentToggle}
                className="mr-2"
              />
              <label htmlFor="isPresent-new" className="text-sm">
                Current project
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Description</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter project description"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!name.trim() || !content.trim() || !startDate}
        >
          Save
        </Button>
      </div>
    </Card>
  );
}
