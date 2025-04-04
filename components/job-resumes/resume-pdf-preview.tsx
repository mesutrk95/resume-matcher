import { ResumeContent } from "@/types/resume";
import { JobResume } from "@prisma/client";
// import { PDFViewer } from "@react-pdf/renderer";
import { ResumeDocument } from "./resume-document";
import { useEffect, useState } from "react";
import { BlobProvider } from "@react-pdf/renderer";
import PDFViewer from "./pdf-viewer";
import { Button } from "../ui/button";

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
    // <PDFViewer showToolbar={false} className="w-full h-full">
    //   <ResumeDocument resume={data} withIdentifiers={false} />
    // </PDFViewer>
    <BlobProvider
      document={
        <ResumeDocument
          resume={data}
          withIdentifiers={false}
          skipFont={false}
        />
      }
    >
      {({ blob, url, loading, error }) => {
        // if (error) {
        //   return <div>Error: {error}</div>;
        // }

        return (
          <>
            <div className="flex justify-center absolute left-0 bottom-1 w-full">
              <Button
                className="z-10 shadow-lg "
                variant="outline"
                onClick={() => {
                  if (!blob) return;
                  const blobUrl = URL.createObjectURL(
                    new Blob([blob], { type: "application/pdf" })
                  );
                  var a = document.createElement("a");
                  document.body.appendChild(a);
                  a.style = "display: none";

                  a.href = blobUrl;
                  a.download = `${(
                    jobResume.name ||
                    data.contactInfo.firstName + " " + data.contactInfo.lastName
                  ).replace(/\s+/g, "_")}.pdf`;
                  a.click();
                  window.URL.revokeObjectURL(blobUrl);
                }}
              >
                Download
              </Button>
            </div>
            <PDFViewer pdfBlob={blob} />
          </>
        );
      }}
    </BlobProvider>
  );
};

export default CVPreview;
