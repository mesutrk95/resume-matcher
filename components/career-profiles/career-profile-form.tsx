'use client';

import React, { useState, useTransition } from 'react';
import { Card, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Edit, Save, X } from 'lucide-react';
import { updateCareerProfile } from '@/actions/career-profiles';
import { LoadingButton } from '../ui/loading-button';
import { runAction } from '@/app/_utils/runAction';
import { CareerProfile } from '@/types/career-profile';

export const CareerProfileForm = ({ careerProfile }: { careerProfile: CareerProfile }) => {
  const [editingCareerProfile, setEditingCareerProfile] = useState(false);
  const [careerProfileForm, setCareerProfileForm] = useState({ ...careerProfile });
  const [isPending, startTransition] = useTransition();

  // Template handlers
  const handleEditCareerProfile = () => {
    setCareerProfileForm({
      ...careerProfile,
      name: careerProfile.name,
      description: careerProfile.description,
    });
    setEditingCareerProfile(true);
  };

  const handleSaveCareerProfile = async () => {
    startTransition(async () => {
      const result = await runAction(updateCareerProfile(careerProfileForm));
      if (result.success) setEditingCareerProfile(false);
    });
  };

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-start justify-between">
        {!editingCareerProfile ? (
          <div>
            <CardTitle className="text-2xl">{careerProfile.name}</CardTitle>
            <p className="text-muted-foreground mt-1">{careerProfile.description}</p>
          </div>
        ) : (
          <div className="w-full space-y-2">
            <Input
              value={careerProfileForm.name}
              onChange={e => setCareerProfileForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Template name"
              className="font-semibold text-lg"
            />
            <Input
              value={careerProfileForm.description || ''}
              onChange={e =>
                setCareerProfileForm(prev => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Template description"
            />
          </div>
        )}

        <div>
          {!editingCareerProfile ? (
            <Button variant="outline" size="sm" onClick={handleEditCareerProfile}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => setEditingCareerProfile(false)}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <LoadingButton
                loading={isPending}
                loadingText="Saving..."
                size="sm"
                onClick={handleSaveCareerProfile}
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </LoadingButton>
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
};
