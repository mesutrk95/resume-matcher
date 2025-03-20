import { ResumeContent } from "@/types/resume";
import { JobResume } from "@prisma/client";
import { PDFViewer } from "@react-pdf/renderer";
import { ResumeDocument } from "./resume-document";
import { useEffect, useState } from "react";

// CV Preview Component with Download Button
const CVPreview = ({
  data,
  jobResume,
}: {
  data: ResumeContent;
  jobResume: JobResume;
}) => {
  // For client-side rendering only
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
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
    <PDFViewer showToolbar={false} className="w-full h-full">
      <ResumeDocument resume={data} />
    </PDFViewer>
    // <div className="flex flex-col h-screen gap-4">
    //   <div className="w-full flex-grow ">
    //     <PDFViewer showToolbar={false} className="w-full h-full">
    //       <ResumeDocument resume={data} />
    //     </PDFViewer>
    //   </div>
    //   <div className="shrink-0">
    //     <Button asChild>
    //       <PDFDownloadLink
    //         document={<ResumeDocument resume={data} />}
    //         fileName={`${(
    //           jobResume.name ||
    //           data.contactInfo.firstName + " " + data.contactInfo.lastName
    //         ).replace(/\s+/g, "_")}.pdf`}
    //       >
    //         {({ blob, url, loading, error }) =>
    //           loading ? "Generating PDF..." : "Download PDF"
    //         }
    //       </PDFDownloadLink>
    //     </Button>
    //   </div>
    // </div>
  );
};

export default CVPreview;
