import { LucideLoader2 } from "lucide-react";
import { useState, useRef, useMemo } from "react";
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

function LoadingPdf() {
  return (
    <div className="flex justify-center items-center text-xs gap-1 py-10 font-semibold text-muted-foreground">
      <LucideLoader2 className="animate-spin" size={16} />
      Building Resume ...
    </div>
  );
}

function PDFViewer({
  pdfBlob,
  maxPages,
}: {
  pdfBlob: Blob | null;
  maxPages?: number;
}) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { width = 0, height = 0 } = useResizeObserver({
    ref,
    box: "border-box",
  });

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    if (maxPages) {
      return setNumPages(maxPages);
    }
    setNumPages(numPages);
  }

  const loadingIndicator = useMemo(() => <LoadingPdf />, []);

  return (
    <div className="relative h-full w-full bg-slate-2001 p-2 overflow-hidden">
      <div className="" ref={ref}>
        {pdfBlob && (
          <Document
            className={"relative flex flex-col gap-2"}
            file={pdfBlob}
            onLoadSuccess={onDocumentLoadSuccess}
            onItemClick={(item) => console.log(item)}
            loading={loadingIndicator}
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
