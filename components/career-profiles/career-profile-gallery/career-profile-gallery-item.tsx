'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ResumeContent } from '@/types/resume';
import { useEffect, useState } from 'react';
import { CreateCareerProfileButton } from './create-career-profile-button';
import Image from 'next/image';

interface CareerProfileCardProps {
  label: string;
  caption: string;
  url: string;
}

export const CareerProfileGalleryItem = ({ label, url, caption }: CareerProfileCardProps) => {
  const [resumeContent, setResumeContent] = useState<ResumeContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    setIsLoading(true);

    // Generate image URL by replacing .json with .png
    const imgUrl = url.replace('.json', '.png');
    setImageUrl(imgUrl);

    // Still fetch the JSON to get resume content for the Create button
    fetch(url)
      .then(res => res.json())
      .then(res => {
        setResumeContent(res as ResumeContent);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error loading template data:', err);
        setIsLoading(false);
      });
  }, [url]);

  return (
    <Card className="p-0 overflow-hidden">
      <CardContent className="space-y-5 p-0 flex flex-col justify-between">
        <div className="border-b h-[250px] flex items-center justify-center">
          {isLoading ? (
            <div className="w-full h-full flex flex-col space-y-2">
              <Skeleton className="w-full h-full" />
            </div>
          ) : imageUrl ? (
            <div className="h-full w-full overflow-hidden p-3">
              <Image
                src={imageUrl}
                width={200}
                height={200}
                alt={`${label} template preview`}
                className="  w-full object-contain p-4 overflow-hidden hover:mb-2 border rounded-lg"
              />
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Failed to load template</div>
          )}
        </div>
        <div className="flex flex-col gap-4 p-4 pt-0">
          <div className="">
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold">{label}</h3>
                <p className="text-sm text-muted-foreground">{caption}</p>
              </>
            )}
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <CreateCareerProfileButton resumeContent={resumeContent!} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
