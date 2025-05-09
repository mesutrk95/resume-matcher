import clsx from 'clsx';
import { LucideLoader2 } from 'lucide-react';
import { useState, useRef, useMemo, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
// import { useResizeObserver, useWindowSize } from "usehooks-ts";

function LoadingPdf() {
  return (
    <div className="flex justify-center items-center text-xs gap-1 py-10 font-semibold text-muted-foreground">
      <LucideLoader2 className="animate-spin" size={16} />
      Loading Resume ...
    </div>
  );
}

type PDFViewerProps = {
  pdfBlob: Blob | null;
  maxPages?: number;
  className?: string;
};

export default function PDFViewerContainer({ className, ...props }: PDFViewerProps) {
  // const ref = useRef<HTMLDivElement>(null);
  // const { width = 0, height = 0 } = useWindowSize({
  //   ref,
  //   box: "content-box",
  // });
  const [width, setWidth] = useState(0);
  // const divRef = useRef(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Function to update the div width in state
    const updateWidth = () => {
      if (ref.current) {
        setWidth(ref.current.clientWidth);
      }
    };

    // Initial width measurement
    updateWidth();

    // Add event listener for window resize
    window.addEventListener('resize', updateWidth);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  return (
    <div className={clsx('relative', className)}>
      <div className={clsx('w-full')} ref={ref}>
        <PDFViewer {...props} width={width} />
      </div>
    </div>
  );
}

function PDFViewer({ pdfBlob, maxPages, width }: PDFViewerProps & { width: number }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    // console.log("loadddeddddddddddd", {
    //   pdfBlobSize: pdfBlob?.size,
    //   width,
    //   numPages,
    // });
    if (maxPages) {
      return setNumPages(maxPages);
    }
    setNumPages(numPages);
  }

  // console.log("renderrrrrr", { pdfBlobSize: pdfBlob?.size, width, numPages });
  const loadingIndicator = useMemo(() => <LoadingPdf />, []);
  const opt = useMemo(() => {
    return {
      cMapUrl: '/bcmaps/',
      cMapPacked: true,
    };
  }, []);

  if (!pdfBlob) return null;
  return (
    <Document
      options={opt}
      className={'relative flex flex-col gap-2'}
      file={pdfBlob}
      onLoadSuccess={onDocumentLoadSuccess}
      // onItemClick={item => console.log(item)}
      loading={loadingIndicator}
    >
      {Array.from(new Array(numPages), (el, index) => (
        <Page
          key={`page_${index + 1}`}
          pageNumber={index + 1}
          className={'border border- rounded-lg overflow-hidden  border-gray-300'}
          width={width}
          scale={1}
        />
      ))}
    </Document>
  );
}
