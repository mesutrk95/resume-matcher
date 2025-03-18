import React from "react";
import { ResumeContent } from "@/types/resume";
import { Button } from "../ui/button";
import { JobResume } from "@prisma/client";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { ResumeDocument } from "./resume-document";


// CV Preview Component with Download Button
const CVPreview = ({
  data,
  jobResume,
}: {
  data: ResumeContent;
  jobResume: JobResume;
}) => {
  // For client-side rendering only
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex justify-center items-center h-96">
        Loading CV preview...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen gap-4">
      <div className="w-full flex-grow ">
        <PDFViewer showToolbar={false} className="w-full h-full">
          <ResumeDocument resume={data} />
        </PDFViewer>
      </div>
      <div className="shrink-0">
        <Button asChild>
          <PDFDownloadLink
            document={<ResumeDocument resume={data} />}
            fileName={`${(
              jobResume.name ||
              data.contactInfo.firstName + " " + data.contactInfo.lastName
            ).replace(/\s+/g, "_")}.pdf`}
          >
            {({ blob, url, loading, error }) =>
              loading ? "Generating PDF..." : "Download PDF"
            }
          </PDFDownloadLink>
        </Button>
      </div>
    </div>
  );
};

export default CVPreview;
