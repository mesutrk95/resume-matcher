"use client";

import { CreateTemplateButton } from "./create-template-button";
import PDFViewer from "@/components/job-resumes/resume-renderer/pdf-viewer";
import { ResumeDocument } from "@/components/job-resumes/resume-renderer/resume-document";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ResumeContent } from "@/types/resume";
import { pdf } from "@react-pdf/renderer";
import { useEffect, useState } from "react";

interface ResumeTemplateCardProps {
  label: string;
  caption: string;
  url: string;
}

export const TemplateGalleryItem = ({
  label,
  url,
  caption,
}: ResumeTemplateCardProps) => {
  const [resume, setResume] = useState<{
    content: ResumeContent;
    blob: Blob;
  } | null>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then(async (res) => {
        const content = res as ResumeContent;
        const blob = await pdf(
          <ResumeDocument
            resume={content}
            withIdentifiers={false}
            skipFont={false}
          />
        ).toBlob();
        setResume({ blob, content });
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  }, [url]);

  return (
    <Card className="p-0 overflow-hidden">
      <CardContent className=" space-y-5 p-0 flex flex-col justify-between">
        <div className="border-b h-[250px] flex items-center justify-center">
          {isLoading ? (
            <div className="w-full h-full flex flex-col space-y-2">
              <Skeleton className="w-full h-full" />
            </div>
          ) : resume ? (
            <div className="h-full w-full bg-indigo-500 overflow-hidden ">
              <PDFViewer
                pdfBlob={resume.blob}
                maxPages={1}
                className=" h-full w-full p-4 overflow-hidden hover:mb-2"
              ></PDFViewer>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Failed to load template
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4 p-4">
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
            <CreateTemplateButton resumeContent={resume?.content!} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
