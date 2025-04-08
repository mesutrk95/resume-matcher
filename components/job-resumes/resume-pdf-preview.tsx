import { ResumeContent, ResumeDesign } from "@/types/resume";
import { JobResume } from "@prisma/client";
import { ResumeDocument } from "./resume-renderer/resume-document";
import { useEffect, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Button } from "../ui/button";
import PDFViewer from "./resume-renderer/pdf-viewer";
import { ScrollArea } from "../ui/scroll-area";
import { Download } from "lucide-react";
import { useResumeBuilder } from "./resume-builder/context/useResumeBuilder";
import { ChooseResumeDesignDialog } from "./choose-resume-design-dialog";

// CV Preview Component with Download Button
export const ResumePreview = ({
  resume,
  design,
  jobResume,
}: {
  resume: ResumeContent;
  design: ResumeDesign | null;
  jobResume: JobResume;
}) => {
  // For client-side rendering only
  const [isClient, setIsClient] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>();
  const { saveDesign } = useResumeBuilder();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    async function load() {
      const blob = await pdf(
        <ResumeDocument
          resume={resume}
          resumeDesign={design}
          withIdentifiers={false}
          skipFont={false}
        />
      ).toBlob();
      setPdfBlob(blob);
    }
    load();
  }, [resume, design]);

  if (!isClient || !pdfBlob) {
    return (
      <div className="flex justify-center items-center h-96">
        Loading CV preview...
      </div>
    );
  }

  return (
    <div className=" h-full w-full pe-2 pt-2">
      {/* <PDFViewer showToolbar={false} className="w-full h-full">
         <ResumeDocument resume={data} withIdentifiers={false} /> 
      </PDFViewer> */}
      <div className="flex gap-2 justify-center absolute right-8 top-4">
        <ChooseResumeDesignDialog
          resume={resume}
          onDesignChange={(newDesign) => {
            saveDesign(newDesign);
          }}
        />
        <Button
          className="z-10 shadow-lg rounded-full"
          size={"icon"}
          variant="default-outline"
          onClick={() => {
            if (!pdfBlob) return;
            const blobUrl = URL.createObjectURL(
              new Blob([pdfBlob], { type: "application/pdf" })
            );
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";

            a.href = blobUrl;
            a.download = `${(
              jobResume.name ||
              resume.contactInfo.firstName + " " + resume.contactInfo.lastName
            ).replace(/\s+/g, "_")}.pdf`;
            a.click();
            window.URL.revokeObjectURL(blobUrl);
          }}
        >
          <Download size={16} />
        </Button>
      </div>
      <ScrollArea
        className=" h-full w-full "
        viewportClassName=""
        type="always"
      >
        <PDFViewer pdfBlob={pdfBlob} className="ps-2 pb-2 pe-4" />
      </ScrollArea>
    </div>
  );
};
