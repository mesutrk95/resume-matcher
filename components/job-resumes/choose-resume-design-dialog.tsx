import PDFViewer from "@/components/job-resumes/resume-renderer/pdf-viewer";
import { ResumeDocument } from "@/components/job-resumes/resume-renderer/resume-document";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResumeContent, ResumeDesign } from "@/types/resume";
import { pdf } from "@react-pdf/renderer";
import { Paintbrush, CheckCircle, AlertTriangle, CheckCheck, Check } from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";

/**
 * Individual resume design item with skeleton loading
 */
const ResumeDesignItem = ({
  designUrl,
  resume,
  isSelected = false,
  onSelect,
}: {
  resume: ResumeContent;
  designUrl: string;
  isSelected?: boolean;
  onSelect?: (design: ResumeDesign) => void;
}) => {
  const [design, setDesign] = useState<ResumeDesign | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false); 

  useEffect(() => {
    const fetchDesign = async () => {
      try {
        setLoading(true);
        const res = await fetch(designUrl);
        if (!res.ok) throw new Error("Failed to fetch design");
        
        const resumeDesign = await res.json() as ResumeDesign;
        setDesign(resumeDesign);
        
        const blob = await pdf(
          <ResumeDocument resumeDesign={resumeDesign} resume={resume} />
        ).toBlob();
        
        setPdfBlob(blob);
        setError(false);
      } catch (err) {
        console.error("Error loading resume design:", err);
        setError(true);
        toast.error("Error loading design", {
          description: `Failed to load design: ${designUrl}`,
          action: {
            label: "Try again",
            onClick: () => fetchDesign()
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDesign();
  }, [designUrl, resume, toast]);

  const handleSelect = useCallback(() => {
    if (design && onSelect) {
      onSelect(design);
    }
  }, [design, onSelect]);

  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer ${
        isSelected ? "ring-2 ring-primary" : ""
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
              <p className="text-sm text-muted-foreground">Failed to load design</p>
            </div>
          </div>
        ) : (
          <>
            <div className="relative">
              {pdfBlob && (
                <PDFViewer
                  pdfBlob={pdfBlob}
                  className="w-full"
                  maxPages={1}
                />
              )}
              
              {isSelected && (
                <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
            {design && (
              <h5 className="font-medium text-center mt-2 text-sm truncate">
                {design.name}
              </h5>
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
  onSelectDesign 
}: { 
  resume: ResumeContent;
  onSelectDesign?: (design: ResumeDesign) => void;
}) => {
  const [items, setItems] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDesignUrl, setSelectedDesignUrl] = useState<string | null>(null);
  // Using Sonner toast

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        setLoading(true);
        const res = await fetch("/designs/all.json");
        if (!res.ok) throw new Error("Failed to fetch design list");
        
        const designUrls = await res.json();
        setItems(designUrls);
      } catch (err) {
        console.error("Error loading design list:", err);
        toast.error("Failed to load designs", {
          description: "There was an error fetching the resume designs."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDesigns();
  }, [toast]);

  const handleSelectDesign = useCallback((design: ResumeDesign, designUrl: string) => {
    setSelectedDesignUrl(designUrl);
    if (onSelectDesign) {
      onSelectDesign(design);
    }
  }, [onSelectDesign]);

  return (
    <ScrollArea className="h-[450px] pr-4">
      {loading ? (
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
          {items?.map((designUrl) => (
            <ResumeDesignItem
              key={designUrl}
              designUrl={designUrl}
              resume={resume}
              isSelected={designUrl === selectedDesignUrl}
              onSelect={(design) => handleSelectDesign(design, designUrl)}
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
  onDesignChange,
}: {
  resume: ResumeContent;
  onDesignChange?: (design: ResumeDesign) => void;
}) => {
  const [selectedDesign, setSelectedDesign] = useState<ResumeDesign | null>(null);
  const [open, setOpen] = useState(false);
  // Using Sonner toast

  const handleSave = useCallback(() => {
    if (selectedDesign && onDesignChange) {
      onDesignChange(selectedDesign);
      toast.success("Design updated", {
        description: `Your resume now uses the "${selectedDesign.name}" design.`
      });
      setOpen(false);
    } else if (!selectedDesign) {
      toast.error("No design selected", {
        description: "Please select a design first."
      });
    }
  }, [selectedDesign, onDesignChange, toast]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="z-10 shadow-lg rounded-full"
          size="icon"
          variant="default-outline"
        >
          <Paintbrush className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Resume Design & Style</DialogTitle>
          <DialogDescription>
            Choose a design template for your resume. Preview each option and click save when you are done.
          </DialogDescription>
        </DialogHeader>

        <ResumeDesignList 
          resume={resume} 
          onSelectDesign={setSelectedDesign}
        />
        
        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSave}
            disabled={!selectedDesign}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};