"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";

type AddProjectFormProps = {
  onSave: (project: {
    name: string;
    content: string;
    startDate: string;
    endDate: string;
  }) => void;
  onCancel: () => void;
};

export function AddProjectForm({ onSave, onCancel }: AddProjectFormProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isPresent, setIsPresent] = useState(false);

  const handleSubmit = () => {
    if (name.trim() && content.trim() && startDate) {
      onSave({
        name,
        content,
        startDate: format(startDate, "yyyy MM dd"),
        endDate: isPresent
          ? "Present"
          : endDate
          ? format(endDate, "yyyy MM dd")
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Start Date</label>
            <DatePicker
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
              <DatePicker
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
