'use client';

import React from 'react';
import { Button } from '../ui/button';
import { getCareerProfile, updateCareerProfile } from '@/actions/career-profiles';
import { CareerProfile } from '@prisma/client';

export const ImportExportBar = ({ careerProfile }: { careerProfile: CareerProfile }) => {
  const exportJson = async () => {
    const rt = await getCareerProfile(careerProfile.id);
    if (!rt?.data) {
      return;
    }
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(rt?.data.content),
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = `career_profile_${careerProfile.name}.json`;

    link.click();
  };

  const importJson = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async e => {
          const content = JSON.parse(e.target?.result as string);
          await updateCareerProfile({ ...careerProfile, content });
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="flex gap-2 mt-5">
      <Button onClick={e => exportJson()}>Export as Json</Button>
      <Button onClick={e => importJson()}>Import Json</Button>
    </div>
  );
};
