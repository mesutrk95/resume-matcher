"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AddExperienceFormProps = {
  onSave: (experience: {
    companyName: string;
    role: string;
    startDate: string;
    endDate: string;
    location: string;
    type: string;
  }) => void;
  onCancel: () => void;
};

export function AddExperienceForm({
  onSave,
  onCancel,
}: AddExperienceFormProps) {
  const [formData, setFormData] = useState({
    companyName: "",
    role: "",
    startDate: "",
    endDate: "",
    location: "",
    type: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">New Experience</CardTitle>
      </CardHeader>
      <div className="p-6 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Company</label>
            <Input
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Company name"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Role</label>
            <Input
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="Job title"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Start Date</label>
            <Input
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              placeholder="e.g. Jan 2020"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">End Date</label>
            <Input
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              placeholder="e.g. Present"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Experience</Button>
        </div>
      </div>
    </Card>
  );
}
