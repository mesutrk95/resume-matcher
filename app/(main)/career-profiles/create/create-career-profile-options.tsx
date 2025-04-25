'use client';

import { authorizeCode } from '@/actions/linkedin';
import { createCareerProfileFromResumePdf } from '@/actions/career-profiles';
import { FileButton } from '@/app/_components/file-button';
import { runAction } from '@/app/_utils/runAction';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { LoadingButton } from '@/components/ui/loading-button';
import { Import, UploadIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import React, { useEffect, useTransition } from 'react';
import { toast } from 'sonner';
import { CreateNewCareerProfileForm } from '@/components/career-profiles/create-new-career-profile-button';

export const CreateCareerProfileOptions = () => {
  const handleLinkedinImport = () => {
    const clientId = '78nqb8kmqhvzhm';
    const redirectUri = 'http://localhost:8998/career-profiles/create';
    const scopes = ['profile'];

    // Step 1: Redirect user to LinkedIn authorization page
    function redirectToLinkedIn() {
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri,
      )}&scope=${scopes.join('%20')}`;

      // window.location.href = authUrl;
      (window as any).open(authUrl, '_blank').focus();
    }

    redirectToLinkedIn();
  };

  const router = useRouter();
  const sp = useSearchParams();
  const [isImportingResumeFile, startImportingResumeFile] = useTransition();

  useEffect(() => {
    const code = sp.get('code') || '';
    if (!code || code.length === 0) return;

    async function getCode() {
      const result = await runAction(authorizeCode(code));
      // console.log(result);
    }
    getCode();
  }, [sp]);

  const handleImportFile = (file: File) => {
    startImportingResumeFile(async () => {
      const formData = new FormData();
      formData.append('file', file);

      const result = await runAction(createCareerProfileFromResumePdf, formData);

      if (result.success) {
        toast.success('Resume Imported!', {
          description: `Your resume "${result.data?.name}" imported successfully.`,
        });
        router.push('/career-profiles/' + result.data?.id);
      }
    });
  };

  return (
    <div className="grid grid-cols-3 gap-5">
      {/* <Card className="border-2 border-dashed">
        <CardContent className="flex justify-between items-center p-6">
          <div className="">
            <h3 className="text-xl font-bold">Start Fresh 🌿</h3>
            <p>
              Create a completely customized resume template without content
            </p>
          </div>
          <div></div>
        </CardContent>
        <CardFooter>
          <CreateNewTemplateForm blank />
        </CardFooter>
      </Card> */}
      <Card className="border-2 border-dashed">
        <CardContent className="flex justify-between items-center p-6">
          <div className="">
            <h3 className="text-xl font-bold">Start Fresh 🌿</h3>
            <p>Create a completely customized career profile without content</p>
          </div>
          <div></div>
        </CardContent>
        <CardFooter>
          <CreateNewCareerProfileForm blank />
        </CardFooter>
      </Card>
      <Card className="border-2">
        <CardContent className="flex justify-between items-center p-6">
          <div className="">
            <h3 className="text-xl font-bold">Import PDF Resume 📄</h3>
            <p>
              Upload your existing resume file to extract and edit your professional information
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <FileButton
            onFileSelected={handleImportFile}
            loading={isImportingResumeFile}
            loadingText="Importing Resume ..."
            accept=".pdf,.txt"
          >
            <UploadIcon className="mr-2 h-4 w-4" />
            Select Resume File
          </FileButton>
        </CardFooter>
      </Card>
      <Card className="border-2">
        <CardContent className="flex justify-between items-center p-6">
          <div className="">
            <h3 className="text-xl font-bold">Import from Linkedin 🧑‍💼</h3>
            <p>Transfer your professional profile directly from LinkedIn to save time</p>
          </div>
          <div></div>
        </CardContent>
        <CardFooter>
          <LoadingButton
            // loading={isPending}
            loadingText="Loading..."
            onClick={handleLinkedinImport}
            disabled={true}
          >
            <Import className="mr-2 h-4 w-4" />
            Import from Linkedin
          </LoadingButton>
        </CardFooter>
      </Card>
    </div>
  );
};
