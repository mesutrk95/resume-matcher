import PDFViewer from '@/components/job-resumes/resume-renderer/pdf-renderer';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResumeContent } from '@/types/resume';
import { pdf } from '@react-pdf/renderer';
import { Paintbrush, AlertTriangle, Check } from 'lucide-react';
import React, { useEffect, useState, useCallback, useTransition } from 'react';
import { ResumeTemplateContent } from '@/types/resume-template';
import { ResumePdfDocument } from './resume-renderer/resume-pdf-document';
import { runAction } from '@/app/_utils/runAction';
import { getAllResumeTemplates } from '@/actions/resume-templates';
import { ResumeTemplate, ResumeTemplateStatus } from '@prisma/client';

/**
 * Individual resume design item with skeleton loading
 */
const ResumeDesignItem = ({
  template,
  resume,
  isSelected = false,
  onSelect,
}: {
  resume: ResumeContent;
  template: ResumeTemplate;
  isSelected?: boolean;
  onSelect?: (design: ResumeTemplate) => void;
}) => {
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchDesign = async () => {
      try {
        setLoading(true);
        const blob = await pdf(
          <ResumePdfDocument
            resumeTemplate={template.content as ResumeTemplateContent}
            resume={resume}
          />,
        ).toBlob();

        setPdfBlob(blob);
        setError(false);
      } catch (err) {
        // console.error('Error loading resume design:', err);
        setError(true);
        toast.error('Error loading design', {
          description: `Failed to load template: ${template.name}`,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDesign();
  }, [template, resume]);

  const handleSelect = useCallback(() => {
    if (template && onSelect) {
      onSelect(template);
    }
  }, [template, onSelect]);

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={handleSelect}
    >
      <CardContent className="p-3">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-60 w-full" />
            <Skeleton className="h-4 w-24 mx-auto" />
          </div>
        ) : error ? (
          <div className="h-60 w-full flex items-center justify-center bg-muted">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Failed to load template</p>
            </div>
          </div>
        ) : (
          <>
            <div className="relative">
              {pdfBlob && <PDFViewer pdfBlob={pdfBlob} className="w-full" maxPages={1} />}

              {isSelected && (
                <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
            {template && (
              <h5 className="font-medium text-center mt-2 text-sm truncate">{template.name}</h5>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Grid layout for resume designs with loading states
 */
const ResumeDesignList = ({
  resume,
  onSelectTemplate,
}: {
  resume: ResumeContent;
  onSelectTemplate?: (t: ResumeTemplate) => void;
}) => {
  const [items, setItems] = useState<ResumeTemplate[] | null>(null);
  const [isFetchingTemplates, startFetchResumeTemplatesTransition] = useTransition();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  // Using Sonner toast

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        startFetchResumeTemplatesTransition(async () => {
          const result = await runAction(getAllResumeTemplates(ResumeTemplateStatus.ACTIVE));
          if (result.success) {
            setItems(result.data || []);
          }
        });
      } catch (err) {
        console.error('Error loading design list:', err);
      }
    };

    fetchTemplates();
  }, []);

  const handleSelectDesign = useCallback(
    (t: ResumeTemplate) => {
      setSelectedTemplateId(t.id);
      if (onSelectTemplate) {
        onSelectTemplate(t);
      }
    },
    [onSelectTemplate],
  );

  return (
    <ScrollArea className="h-[450px] pr-4">
      {isFetchingTemplates ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-3">
                <Skeleton className="h-60 w-full" />
                <Skeleton className="h-4 w-24 mx-auto mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
          {items?.map(template => (
            <ResumeDesignItem
              key={template.id}
              template={template}
              resume={resume}
              isSelected={template.id === selectedTemplateId}
              onSelect={t => handleSelectDesign(t)}
            />
          ))}
        </div>
      )}
    </ScrollArea>
  );
};

/**
 * Main dialog component for choosing resume design
 */
export const ChooseResumeDesignDialog = ({
  resume,
  onResumeTemplateChange,
}: {
  resume: ResumeContent;
  onResumeTemplateChange?: (t: ResumeTemplate) => void;
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null);
  const [open, setOpen] = useState(false);
  // Using Sonner toast

  const handleSave = useCallback(() => {
    if (selectedTemplate && onResumeTemplateChange) {
      onResumeTemplateChange(selectedTemplate);
      toast.success('Resume template updated', {
        description: `Your resume now uses the "${selectedTemplate.name}" design.`,
      });
      setOpen(false);
    } else if (!selectedTemplate) {
      toast.error('No template is selected', {
        description: 'Please select a template first.',
      });
    }
  }, [selectedTemplate, onResumeTemplateChange]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="z-10 shadow-lg rounded-full" size="icon" variant="default-outline">
          <Paintbrush className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Resume Template & Style</DialogTitle>
          <DialogDescription>
            Choose a design template for your resume. Preview each option and click save when you
            are done.
          </DialogDescription>
        </DialogHeader>

        <ResumeDesignList resume={resume} onSelectTemplate={setSelectedTemplate} />

        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSave} disabled={!selectedTemplate}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
