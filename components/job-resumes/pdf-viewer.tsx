import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { useResizeObserver } from "usehooks-ts";

const workerSrc =
  process.env.NODE_ENV === "production"
    ? `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
    : new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

function PDFViewer({ pdfBlob }: { pdfBlob: Blob | null }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pdfData, setPdfData] = useState<string | null>(null);

  const ref = useRef<HTMLDivElement>(null);
  const { width = 0, height = 0 } = useResizeObserver({
    ref,
    box: "border-box",
  });

  useEffect(() => {
    if (!pdfBlob) return;
    // Convert blob to URL
    const blobUrl = URL.createObjectURL(
      new Blob([pdfBlob], { type: "application/pdf" })
    );
    setPdfData(blobUrl);

    return () => {
      // Clean up
      URL.revokeObjectURL(blobUrl);
    };
  }, [pdfBlob]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div className="relative h-full w-full bg-slate-2001 p-2 overflow-auto">
      <div className=" " ref={ref}>
        {pdfData && (
          <Document
            className={"relative flex flex-col gap-2"}
            file={pdfData}
            onLoadSuccess={onDocumentLoadSuccess}
            onItemClick={(item) => console.log(item)}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                className={
                  "border border- rounded-lg overflow-hidden  border-gray-300"
                }
                width={width}
                scale={1}
              />
            ))}
          </Document>
        )}
      </div>
    </div>
  );
}

export default PDFViewer;
