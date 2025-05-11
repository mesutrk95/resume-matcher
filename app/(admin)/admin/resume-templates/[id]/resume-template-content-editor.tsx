'use client';

import { updateResumeTemplate } from '@/actions/resume-templates';
import { runAction } from '@/app/_utils/runAction';
import { ResumeDomPreview } from '@/components/job-resumes/resume-renderer/resume-dom-preview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/ui/loading-button';
import { resumeTemplateSchema } from '@/schemas/resume-template.schema';
import { ResumeContent } from '@/types/resume';
import { ResumeTemplateContent } from '@/types/resume-template';
import { ResumeTemplate } from '@prisma/client';
import dynamic from 'next/dynamic';
import { useState, useEffect, useTransition } from 'react';
import { toast } from 'sonner';

// import { jsPDF } from 'jspdf';

// const generatePDF = async () => {
//   const element = document.getElementById('aaaaa');
//   const doc = new jsPDF('p', 'mm', 'a4');
//   if (!element) return;
//   await doc.html(element, {
//     callback: function (doc) {
//       doc.save('document.pdf');
//     },
//     x: 10,
//     y: 10,
//     width: 180, // Target width in the PDF document
//     windowWidth: element.offsetWidth, // Window width in CSS pixels
//   });
// };

const JsonEditor = dynamic(() => import('@/components/shared/json-editor'), {
  loading: () => <p>Loading Json Editor...</p>,
  ssr: false,
});

export const ResumeTemplateContentEditor = ({
  resumeTemplate,
  sampleResume,
}: {
  resumeTemplate: ResumeTemplate;
  sampleResume?: ResumeContent;
}) => {
  const [editorMode, setEditorMode] = useState<'code' | 'text' | 'tree' | 'form'>('tree');
  const [saving, startSaveTransition] = useTransition();
  const [content, setContent] = useState<ResumeTemplateContent | null>(
    resumeTemplate.content as ResumeTemplateContent,
  );

  const handleJsonEditorUpdated = (data: ResumeTemplateContent) => {
    console.log('JSON Editor updated:', data);
    setContent(data);
  };

  const handleSave = () => {
    startSaveTransition(async () => {
      const validationResult = resumeTemplateSchema.safeParse(content);

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        const pathString = firstError.path.join('.');
        const errorMessage = `Data validation error (Errors: ${
          validationResult.error.errors.length
        }) \nInvalid field ${pathString}: ${firstError.message}`;
        toast.error(errorMessage);
        return;
      }

      const result = await runAction(updateResumeTemplate({ ...resumeTemplate, content: content }));
      if (!result.success) {
        toast.error('Error in updating resume template!');
        return;
      }

      toast.success('Resume template updated!');
    });
  };

  return (
    <>
      <div className="grid grid-cols-5 gap-5">
        <div className="flex flex-col gap-5">
          <div>
            <label htmlFor="id" className="block text-sm font-medium text-gray-700">
              Id
            </label>
            <Input
              type="text"
              id="id"
              name="id"
              defaultValue={resumeTemplate.id || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              disabled
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <Input
              type="text"
              id="name"
              name="name"
              defaultValue={resumeTemplate.name || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex space-x-2">
            <LoadingButton
              loading={saving}
              loadingText="Saving ..."
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Save Changes
            </LoadingButton>
          </div>
        </div>

        <div className="col-span-2">
          <div className="flex justify-between mb-2">
            <label htmlFor="json-editor" className="block text-sm font-medium text-gray-700">
              Json Content Editor
            </label>
            <div>
              <Button
                className="rounded-br-none rounded-tr-none"
                size={'sm'}
                onClick={() => setEditorMode('tree')}
                disabled={editorMode === 'tree'}
              >
                Tree
              </Button>
              <Button
                className="rounded-none"
                size={'sm'}
                onClick={() => setEditorMode('code')}
                disabled={editorMode === 'code'}
              >
                Code
              </Button>
              <Button
                className="rounded-none"
                size={'sm'}
                onClick={() => setEditorMode('form')}
                disabled={editorMode === 'form'}
              >
                Form
              </Button>
              <Button
                size={'sm'}
                className="rounded-bl-none rounded-tl-none"
                onClick={() => setEditorMode('text')}
                disabled={editorMode === 'text'}
              >
                Text
              </Button>
            </div>
          </div>

          <div className=" ">
            <JsonEditor
              className="h-[700px]"
              json={content}
              mode={editorMode}
              onChangeJSON={handleJsonEditorUpdated}
            />
          </div>
        </div>
        <div className="col-span-2">
          {content && sampleResume && (
            <div className="h-[700px] overflow-y-auto ">
              {/* <Button
                onClick={async () => {
                  generatePDF();
                }}
              >
                Dowload
              </Button> */}
              <div className="border rounded">
                <ResumeDomPreview resumeTemplate={content} resume={sampleResume} />
              </div>
            </div>
          )}
        </div>

        {/* <div className="col-span-2">
          <div className="flex flex-col h-full">
            <label htmlFor="text-content" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            {textError && (
              <div className="text-red-500 text-sm mt-1 mb-2">
                {textError} - Changes won&apos;t be reflected in the JSON editor until fixed
              </div>
            )}
            <Textarea
              id="text-content"
              name="text-content"
              value={textContent}
              onChange={e => handleTextEditorUpdated(e.target.value)}
              onBlur={e => handleTextEditorBlur(e.target.value)}
              className={`mt-1 block w-full flex-grow rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                textError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
        </div> */}
      </div>
    </>
  );
};
