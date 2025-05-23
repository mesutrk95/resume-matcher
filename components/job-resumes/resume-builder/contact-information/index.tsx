'use client';

import type React from 'react';

import { useState } from 'react';
import type { ResumeContactInfo } from '@/types/resume';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Save, X } from 'lucide-react';
import { ResumeBuilderCard } from '../resume-builder-card';
import { useResumeBuilder } from '../context/useResumeBuilder';
import { HighlightElement } from '@/components/highlight-element';

export function ContactInfoSection() {
  const { resume, saveResume } = useResumeBuilder();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ResumeContactInfo>(resume.contactInfo);

  const handleEdit = () => {
    setFormData(resume.contactInfo);
    setIsEditing(true);
  };

  const handleSave = () => {
    saveResume({ ...resume, contactInfo: formData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <ResumeBuilderCard
      title="Contact Information"
      buttons={
        <div>
          {!isEditing ? (
            <div className="flex ">
              <Button variant="default" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          )}
        </div>
      }
    >
      <HighlightElement id={'builder-contact-info'}>
        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">First Name</label>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Last Name</label>
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                type="email"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Phone</label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">LinkedIn</label>
              <Input
                name="linkedIn"
                value={formData.linkedIn}
                onChange={handleChange}
                placeholder="LinkedIn URL"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Twitter</label>
              <Input
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                placeholder="Twitter URL"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Address</label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Country</label>
              <Input
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Country"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Pronouns</label>
              <Input
                name="pronouns"
                value={formData.pronouns}
                onChange={handleChange}
                placeholder="Pronouns"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="text-xs font-medium text-muted-foreground">Name</h3>
              <p>
                {resume.contactInfo?.firstName} {resume.contactInfo?.lastName}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-muted-foreground">Email</h3>
              <p>{resume.contactInfo?.email}</p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-muted-foreground">Phone</h3>
              <p>{resume.contactInfo?.phone}</p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-muted-foreground">LinkedIn</h3>
              <p>{resume.contactInfo?.linkedIn}</p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-muted-foreground">Twitter</h3>
              <p>{resume.contactInfo?.twitter}</p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-muted-foreground">Address</h3>
              <p>{resume.contactInfo?.address}</p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-muted-foreground">Country</h3>
              <p>{resume.contactInfo?.country}</p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-muted-foreground">Pronouns</h3>
              <p>{resume.contactInfo?.pronouns}</p>
            </div>
          </div>
        )}
      </HighlightElement>
    </ResumeBuilderCard>
  );
}
