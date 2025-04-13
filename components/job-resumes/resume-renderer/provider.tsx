'use client';

import React from 'react';
import { ResumeDesign, ResumeDesignClass, ResumeDesignElementStyle } from '@/types/resume';
import { createContext, useContext, useState } from 'react';
import moment from 'moment';
import { parseDate } from '@/components/ui/year-month-picker';

interface ResumeRendererContextType {
  design: ResumeDesign;
  resolveStyle: (...elementStyles: (ResumeDesignElementStyle | undefined)[]) => any;
  formatDate: (date?: string) => string;
}

const ResumeRendererContext = createContext<ResumeRendererContextType>(
  {} as ResumeRendererContextType,
);

export const ResumeRendererProvider = ({
  children,
  initialResumeDesign,
}: {
  children: React.ReactNode;
  initialResumeDesign: ResumeDesign;
}) => {
  const [design, setDesign] = useState<ResumeDesign>(initialResumeDesign);

  const getClassStyles = (name?: ResumeDesignClass) => {
    if (!name) return {};
    const classes = name.split(' ').map(c => design.classDefs[c]);
    return classes.reduce(
      (acc, classStyles) => ({
        ...acc,
        ...classStyles,
      }),
      {},
    );
  };

  const resolveStyle = (...elementStyles: (ResumeDesignElementStyle | undefined)[]) => {
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
        ...getClassStyles(elementStyle?.class),
        ...(elementStyle?.style || {}),
      }),
      {},
    );
  };

  const formatDate = (date?: string) => {
    if (!date) return '';
    if (date === 'Present') return 'Present';
    return moment(parseDate(date)).format(design.dateFormat || 'MMM YYYY');
  };

  return (
    <ResumeRendererContext.Provider
      value={{
        design,
        resolveStyle,
        formatDate,
      }}
    >
      {children}
    </ResumeRendererContext.Provider>
  );
};

export const useResumeRenderer = () => {
  return useContext(ResumeRendererContext);
};
