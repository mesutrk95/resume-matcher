'use client';

import { updateResumeTemplate } from '@/actions/resume-templates';
import { runAction } from '@/app/_utils/runAction';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/ui/loading-button';
import { Textarea } from '@/components/ui/textarea';
import { resumeTemplateSchema } from '@/schemas/resume-template.schema';
import { ResumeTemplateContent } from '@/types/resume-template';
import { ResumeTemplate } from '@prisma/client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState, useEffect, useTransition } from 'react';
import { toast } from 'sonner';

const JsonEditor = dynamic(() => import('json-edit-react').then(loaded => loaded.JsonEditor), {
  loading: () => <p>Loading Json Editor...</p>,
  ssr: false,
});

export const ResumeTemplateContentEditor = ({
  resumeTemplate,
}: {
  resumeTemplate: ResumeTemplate;
}) => {
  const [saving, startSaveTransition] = useTransition();
  const [content, setContent] = useState<ResumeTemplateContent | null>(
    resumeTemplate.content as ResumeTemplateContent,
  );
  const [textContent, setTextContent] = useState<string>(
    JSON.stringify(resumeTemplate.content || '', null, 4),
  );
  const [textError, setTextError] = useState<string | null>(null);

  // Update textContent when JSON editor changes content
  useEffect(() => {
    setTextContent(JSON.stringify(content || '', null, 4));
  }, [content]);

  const handleJsonEditorUpdated = (data: { newData: unknown }) => {
    console.log('JSON Editor updated:', data);
    setContent(data.newData as ResumeTemplateContent);
  };

  const handleTextEditorUpdated = (value: string) => {
    setTextContent(value);

    // Try to parse the JSON and update the content state if valid
    try {
      const parsedJson = JSON.parse(value);
      setContent(parsedJson as ResumeTemplateContent);
      setTextError(null);
    } catch (error) {
      // If there's a parse error, keep the text value but don't update the JSON editor
      console.error('JSON parse error:', error);
      setTextError('Invalid JSON format');
    }
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
          <label htmlFor="json-editor" className="block text-sm font-medium text-gray-700">
            Json Content Editor
          </label>
          <div className="overflow-y-scroll h-[600px]">
            <JsonEditor
              data={content}
              collapse={1}
              indent={2}
              collapseAnimationTime={100}
              onUpdate={handleJsonEditorUpdated}
            />
          </div>
        </div>

        <div className="col-span-2">
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
              className={`mt-1 block w-full flex-grow rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                textError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
        </div>
      </div>
    </>
  );
};
