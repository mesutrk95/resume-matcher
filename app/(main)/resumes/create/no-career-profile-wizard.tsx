'use client';

import React, { ChangeEvent, DragEvent, ReactNode, useRef, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { runAction } from '@/app/_utils/runAction';
import { createResumeTemplateFromResumePdf } from '@/actions/career-profiles';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FileUploadRegionProps {
  children?: ReactNode;
  onFileSelected?: (file: File) => void;
  accept?: string;
  isUploading: boolean;
}

function FileUploadRegion({
  children,
  onFileSelected,
  accept = '',
  isUploading,
}: FileUploadRegionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      handleFileUpload(selectedFile);
    }
  };

  const handleFileUpload = (selectedFile: File) => {
    setFile(selectedFile);

    if (onFileSelected && selectedFile) {
      onFileSelected(selectedFile);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      handleFileUpload(droppedFile);
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:border-primary transition-colors duration-200 h-full ${
        isDragging ? 'border-primary bg-primary/5' : ''
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        id="dropzone-file"
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
      />

      {isUploading ? (
        <>
          <Loader2 className="  text-primary animate-spin" />
          <p className="text-muted-foreground">Uploading {file?.name}...</p>
        </>
      ) : file ? (
        <>
          <FileText className="  text-primary" />
          <p className="text-muted-foreground">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {(file.size / (1024 * 1024)).toFixed(2)} MB
          </p>
        </>
      ) : (
        children
      )}
    </div>
  );
}
export function NoCareerProfileWizard() {
  const router = useRouter();
  const [isImportingResumeFile, startImportingResumeFile] = useTransition();

  const onFileSelected = (file: File) => {
    startImportingResumeFile(async () => {
      const formData = new FormData();
      formData.append('file', file);

      const careerProfile = await runAction(createResumeTemplateFromResumePdf, formData);
      if (careerProfile.success) {
        toast.success('Your career profile imported!', {
          description: `Your career profile has been imported successfully.`,
        });

        // const jobResume = await createJobResume(careerProfile.data?.id);
        // toast.info('Creating a resume!', {
        //   description: `Creating resume for job application.`,
        // });

        router.push('/build-resume?profile=' + careerProfile.data?.id);
      }
    });
  };

  return (
    <div className=" ">
      <div className="grid grid-cols-1 md:grid-cols-8 gap-8">
        {/* Left Column - Build from scratch */}
        <Card className="col-span-5 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              {/* <Plus className="h-5 w-5" /> */}
              Start Building Your Resume
            </CardTitle>
            <CardDescription>Create a professional resume step by step</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-4 py-6 text-center">
              <FileText className="h-12 w-12 text-primary" />
              <p className="text-muted-foreground max-w-md">
                Our guided process helps you create a standout resume with customizable templates
                and expert suggestions.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/build-resume">Build Step by Step!</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Right Column - Import Resume */}
        <Card className="col-span-3 shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col ">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              {/* <Upload className="h-5 w-5" /> */}
              Import Your Resume
            </CardTitle>
            <CardDescription>Upload an existing resume from your device</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <FileUploadRegion onFileSelected={onFileSelected} isUploading={isImportingResumeFile}>
              <Upload className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Click or Drag & drop your resume file here!</p>
              <p className="text-xs text-muted-foreground">Maximum size: 20MB</p>
            </FileUploadRegion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
