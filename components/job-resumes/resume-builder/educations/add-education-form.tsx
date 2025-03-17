"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { formatDate } from "date-fns";
import { YearMonthPicker } from "@/components/ui/year-month-picker";

type AddEducationFormProps = {
  onSave: (education: {
    degree: string;
    content: string;
    location: string;
    institution: string;
    startDate: string;
    endDate: string;
  }) => void;
  onCancel: () => void;
};

export function AddEducationForm({ onSave, onCancel }: AddEducationFormProps) {
  const [degree, setDegree] = useState("");
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [institution, setInstitution] = useState("");
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [isPresent, setIsPresent] = useState(false);

  const handleSubmit = () => {
    if (degree.trim() && content.trim() && startDate) {
      onSave({
        degree,
        content,
        location,
        institution,
        startDate: formatDate(startDate, "MM/yyyy"),
        endDate: isPresent
          ? "Present"
          : endDate
          ? formatDate(endDate, "MM/yyyy")
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
      <h4 className="font-medium mb-3">New Education</h4>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Degree</label>
          <Input
            value={degree}
            onChange={(e) => setDegree(e.target.value)}
            placeholder="Enter degree"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Institution</label>
          <Input
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="Enter institution name"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Location</label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location"
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
                id="isPresent-edu-new"
                checked={isPresent}
                onCheckedChange={handlePresentToggle}
                className="mr-2"
              />
              <label htmlFor="isPresent-edu-new" className="text-sm">
                Currently studying
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Description</label>
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter more details"
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
          disabled={!degree.trim() || !startDate}
        >
          Save
        </Button>
      </div>
    </Card>
  );
}
