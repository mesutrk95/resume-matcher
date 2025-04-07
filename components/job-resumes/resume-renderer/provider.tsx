"use client";

import {
  ResumeDesign,
  ResumeDesignElementStyle,
  ResumeDesignTypography,
} from "@/types/resume";
import { createContext, useContext, useState } from "react";

interface ResumeRendererContextType {
  design: ResumeDesign;
  resolveStyle: (
    ...elementStyles: (ResumeDesignElementStyle | undefined)[]
  ) => any;
}

const ResumeRendererContext = createContext<ResumeRendererContextType>(
  {} as ResumeRendererContextType
);

export const ResumeRendererProvider = ({
  children,
  initialResumeDesign,
}: {
  children: React.ReactNode;
  initialResumeDesign: ResumeDesign;
}) => {
  const [design, setDesign] = useState<ResumeDesign>(initialResumeDesign);

  const typo = (name?: ResumeDesignTypography) =>
    (name && design.typography[name]) || {};

  const resolveStyle = (
    ...elementStyles: (ResumeDesignElementStyle | undefined)[]
  ) => {
    if (!elementStyles.length) {
      return {};
    }

    // console.log(elementStyles, elementStyles.reduce(
    //   (acc, elementStyle) => ({
    //     ...acc,
    //     ...typo(elementStyle?.typo),
    //     ...(elementStyle?.style || {}),
    //   }),
    //   {}
    // ));
    

    // Merge all styles in the arguments
    return elementStyles.reduce(
      (acc, elementStyle) => ({
        ...acc,
        ...typo(elementStyle?.typo),
        ...(elementStyle?.style || {}),
      }),
      {}
    );
  };

  return (
    <ResumeRendererContext.Provider
      value={{
        design,
        resolveStyle,
      }}
    >
      {children}
    </ResumeRendererContext.Provider>
  );
};

export const useResumeRenderer = () => {
  return useContext(ResumeRendererContext);
};
