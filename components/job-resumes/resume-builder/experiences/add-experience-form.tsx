'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { YearMonthPicker } from '@/components/ui/year-month-picker';

type AddExperienceType = {
  companyName: string;
  role: string;
  startDate?: string;
  endDate?: string;
  location: string;
  type: string;
};

type AddExperienceFormProps = {
  onSave: (experience: AddExperienceType) => void;
  onCancel: () => void;
};

export function AddExperienceForm({ onSave, onCancel }: AddExperienceFormProps) {
  const [formData, setFormData] = useState<AddExperienceType>({
    companyName: '',
    role: '',
    // startDate: "",
    // endDate: "",
    location: '',
    type: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Start Date</label>

              <YearMonthPicker
                className="w-full"
                date={formData.startDate}
                setDate={date => setFormData(prev => ({ ...prev, startDate: date }))}
                placeholder="Start Date"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">End Date</label>
              <YearMonthPicker
                className="w-full"
                date={formData.endDate}
                setDate={date => setFormData(prev => ({ ...prev, endDate: date }))}
                placeholder="End Date"
              />
            </div>
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
