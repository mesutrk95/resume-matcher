import { ResumeDocument } from "@/components/job-resumes/resume-renderer/resume-document";
import { ResumeContent } from "@/types/resume";
import { usePDF, UsePDFInstance } from "@react-pdf/renderer";
import React, { createContext, ReactNode, useContext } from "react";

// type IPDFBuilderContext = {

// }

export const PDFBuilderContext = createContext<UsePDFInstance>({} as UsePDFInstance);

export const PDFBuilderProvider = ({
  children,
  resume,
}: {
  children: ReactNode;
  resume: ResumeContent;
}) => {
  const [instance, update] = usePDF({
    document: (
      <ResumeDocument
        resume={resume}
        withIdentifiers={false}
        skipFont={false}
      />
    ),
  });

  return (
    <PDFBuilderContext.Provider value={instance}>
      {children}
    </PDFBuilderContext.Provider>
  );
};

export function usePdfBuilder() {
  return useContext(PDFBuilderContext);
}
