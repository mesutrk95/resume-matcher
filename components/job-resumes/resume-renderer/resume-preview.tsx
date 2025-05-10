import { ResumeContent } from '@/types/resume';
import { JobResume } from '@prisma/client';
import { useEffect, useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Button } from '../../ui/button';
import { ScrollArea } from '../../ui/scroll-area';
import { Download } from 'lucide-react';
import { useResumeBuilder } from '../resume-builder/context/useResumeBuilder';
import { ChooseResumeDesignDialog } from '../choose-resume-design-dialog';
import { ResumePdfDocument } from './resume-pdf-document';
import PDFRenderer from './pdf-renderer';
import { ResumeTemplateContent } from '@/types/resume-template';
import { ResumeDomPreview } from './resume-dom-preview';
import { useHighlight } from '@/components/highlight-element/context';

// CV Preview Component with Download Button
export const ResumePreview = ({
  resume,
  jobResume,
  pdfMode,
}: {
  resume: ResumeContent;
  jobResume: JobResume;
  pdfMode?: boolean;
}) => {
  // For client-side rendering only
  const [isClient, setIsClient] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>();
  const { saveResumeTemplate, resumeTemplate } = useResumeBuilder();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    async function load() {
      const blob = await pdf(
        <ResumePdfDocument
          resume={resume}
          resumeTemplate={resumeTemplate?.content as ResumeTemplateContent}
          withIdentifiers={false}
          skipFont={false}
        />,
      ).toBlob();
      setPdfBlob(blob);
    }
    if (pdfMode) load();
  }, [resume, resumeTemplate]);

  const { highlightElement } = useHighlight();

  if (!isClient || (pdfMode && !pdfBlob)) {
    return <div className="flex justify-center items-center h-96">Loading CV preview...</div>;
  }

  return (
    <div className=" h-full w-full pe-2 pt-2">
      <div className="flex gap-2 justify-center absolute right-8 top-4">
        <ChooseResumeDesignDialog
          resume={resume}
          onResumeTemplateChange={t => {
            saveResumeTemplate(t);
          }}
        />
        <Button
          className="z-10 shadow-lg rounded-full"
          size={'icon'}
          variant="default-outline"
          onClick={async () => {
            const blob = await pdf(
              <ResumePdfDocument
                resume={resume}
                resumeTemplate={resumeTemplate?.content as ResumeTemplateContent}
                withIdentifiers={false}
                skipFont={false}
              />,
            ).toBlob();
            const blobUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
            const a = document.createElement('a');
            document.body.appendChild(a);
            a.style = 'display: none';

            a.href = blobUrl;
            a.download = `${(
              jobResume.name || resume.contactInfo.firstName + ' ' + resume.contactInfo.lastName
            ).replace(/\s+/g, '_')}.pdf`;
            a.click();
            window.URL.revokeObjectURL(blobUrl);
          }}
        >
          <Download size={16} />
        </Button>
      </div>
      <ScrollArea className=" h-full w-full " viewportClassName="" type="always">
        {pdfMode ? (
          <PDFRenderer pdfBlob={pdfBlob!} className="ps-2 pb-2 pe-4" />
        ) : (
          <ResumeDomPreview
            resume={resume}
            resumeTemplate={resumeTemplate?.content as ResumeTemplateContent}
            onClickItem={(tag, id) => {
              const targetId = id || 'builder-' + tag;
              if (targetId) {
                highlightElement(targetId);
              }
            }}
          />
        )}
      </ScrollArea>
    </div>
  );
};
