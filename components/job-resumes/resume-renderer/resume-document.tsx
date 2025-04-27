import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { ResumeContent } from '@/types/resume';
import React, { useCallback, useMemo } from 'react';
import {
  ResumeTemplate,
  ResumeTemplateClass,
  ResumeTemplateElement,
} from '@/types/resume-template';

import { JSONPath } from 'jsonpath-plus';
import moment from 'moment';
import { parseDate } from '@/components/ui/year-month-picker';

// Register fonts (optional but recommended for professional CVs)
Font.register({
  family: 'Open Sans',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf',
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf',
      fontWeight: 600,
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf',
      fontWeight: 700,
    },
  ],
});
// Register fonts (optional but recommended for professional CVs)
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
      fontWeight: 500,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 700,
    },
  ],
});

// Helper function to register additional custom fonts if needed
const registerFonts = (design: ResumeTemplate) => {
  // If the design uses a different font than what we already registered, register it here
  // if (
  //   design.fonts.family !== 'Open Sans' &&
  //   !Font.getRegisteredFontFamilies().includes(design.fonts.family)
  // ) {
  //   // Logic to register additional fonts if needed
  //   // This would require a font registry/lookup table to map font names to CDN URLs
  // }
  // // Same for heading font if specified separately
  // if (
  //   design.fonts.headingFamily &&
  //   design.fonts.headingFamily !== design.fonts.family &&
  //   !Font.getRegisteredFontFamilies().includes(design.fonts.headingFamily)
  // ) {
  //   // Register heading font
  // }
};

/*
text component valid props:
  render:
    p: (relPath: string) => string
    p is used to get data using jsonpath-plus the path must be relative
    
    renderDates: (dates: string[], separator?: string = '-') => string
    it does the formating on the input dates and seperate them by separator

    join: (strs: string[], separator?: string = '•') => string
    it joins all the input strings and disposes null & undefined then seperates them by separator

    $r : refers to resume data object

    $item : refers to current object is trying to render

  data: 
    displays literal string

  path: 
    directly gives the content to json path (relative)
*/
export const ResumeDocument = ({
  resume,
  withIdentifiers,
  skipFont,
  resumeTemplate,
}: {
  resume: ResumeContent;
  withIdentifiers?: boolean;
  skipFont?: boolean;
  resumeTemplate?: ResumeTemplate | null;
}) => {
  // // Register any custom fonts needed by this design
  // if (!skipFont) {
  //   registerFonts(resumeDesign);
  // }

  const getClassStyles = useCallback(
    (name?: ResumeTemplateClass) => {
      if (!name || !resumeTemplate) return {};
      const classes = name.split(' ').map(c => resumeTemplate.classDefs[c]);
      return classes.reduce(
        (acc, classStyles) => ({
          ...acc,
          ...classStyles,
        }),
        {},
      );
    },
    [resumeTemplate],
  );

  const getData = (source: any, path: string, params?: number[]): string => {
    const result = JSONPath({
      path,
      json: source,
      // sandbox: params?.reduce((acc, item, index) => {
      //   acc['i' + index] = item;
      //   return acc;
      // }, {} as any),
    });
    return result;
  };

  const runFunction = useMemo(() => {
    const formatDate = (date?: string) => {
      if (!date) return '';
      if (date === 'Present') return 'Present';
      return moment(parseDate(date)).format(resumeTemplate?.dateFormat || 'MMM YYYY');
    };

    const renderDates = (dates: string[], separator: string = '-'): string => {
      const validDates = dates.filter(date => !!date).map(d => formatDate(d));
      return validDates.join(separator);
    };

    const join = (strs: string[], separator: string = ' • '): string => {
      const validStrs = strs.filter(str => !!str);
      return validStrs.join(separator);
    };

    function createFunction<T, R>(
      functionStr: string,
      resume: ResumeContent,
      propertyAccessor: (path: string) => any,
    ): (itemData?: any) => R {
      const dynamicFn = new Function(
        '$r',
        '$item',
        'p',
        'join',
        'renderDates',
        `return ${functionStr}`,
      );

      return (itemData: any) => dynamicFn(resume, itemData, propertyAccessor, join, renderDates);
    }

    function runFunction(func: string, itemData: any) {
      const evaluate = createFunction<ResumeContent, string>(func, resume, (path: string) =>
        getData(itemData, path),
      );
      let result = evaluate(itemData);
      if (typeof result === 'function') {
        result = (result as () => string)();
      }

      // console.log('run function', func, result);
      return result;
    }

    return runFunction;
  }, [resume, resumeTemplate, resumeTemplate?.dateFormat]);

  const renderNode = (
    baseElement: ResumeTemplateElement,
    baseItemData: any,
    baseParams: number[],
  ) => {
    if (!baseElement) return null;

    function renderChilds(itemData: any, itemIndex?: number) {
      return baseElement?.elements?.map((element, index) => {
        const props = {
          ...(typeof element.wrap !== 'undefined' && { wrap: element.wrap }),
          ...(typeof element.break !== 'undefined' && { break: element.break }),
        };

        const tHide = typeof element.hide;
        if (tHide !== 'undefined') {
          // console.log('tHide', tHide);
          if (tHide === 'boolean') return null;
          else if (tHide === 'string') {
            const hide = runFunction(element.hide as string, itemData);
            // console.log(element.hide, hide);

            if (typeof hide === 'boolean' && hide) return null;
          }
        }

        if (element.type === 'View') {
          return (
            <View
              key={index}
              style={{ ...element.style, ...getClassStyles(element.class) }}
              {...props}
            >
              {element.elements &&
                renderNode(
                  element,
                  itemData || baseItemData,
                  index ? [...baseParams, index] : baseParams,
                )}
            </View>
          );
        } else if (element.type === 'Text') {
          let textData;

          if (element.data) {
            textData = element.data;
          } else if (element.render) {
            const result = runFunction(element.render, itemData);
            if (typeof result === 'string') textData = result;
          } else {
            textData = element.path && getData(itemData, element.path)[0];
          }
          return (
            <Text
              key={index}
              style={{ ...element.style, ...getClassStyles(element.class) }}
              {...props}
            >
              {/* ({element.path})  */}
              {textData}
            </Text>
          );
        }

        return null;
      });
    }

    const elementData = baseElement.path && getData(baseItemData, baseElement.path, baseParams);

    if (Array.isArray(elementData)) {
      return (
        <>
          {elementData.map((childData, index) => (
            <React.Fragment key={index}>{renderChilds(childData, index)}</React.Fragment>
          ))}
        </>
      );
    } else {
      return renderChilds(baseItemData);
    }
  };

  // Generate styles based on the resume design configuration
  const styles = useMemo(() => {
    // const spacing = (units: number) => units * design.spacing.unit;

    if (!resumeTemplate) return null;
    const styles = StyleSheet.create({
      page: {
        // flexDirection: "column",
        // backgroundColor: design.colors.background,
        padding: `${resumeTemplate.spacing.pagePadding.top}pt ${resumeTemplate.spacing.pagePadding.right}pt ${resumeTemplate.spacing.pagePadding.bottom}pt ${resumeTemplate.spacing.pagePadding.left}pt`,
        margin: 0,
        fontFamily: skipFont ? undefined : resumeTemplate.fonts.family,
        fontSize: resumeTemplate.fonts.baseSize,
        // color: design.colors.text,
      },
      twoColumnContainer: {
        flexDirection: 'row',
        flexGrow: 1,
      },

      pageNumber: {
        borderBottom: '',
        position: 'absolute',
        bottom: resumeTemplate.spacing.pagePadding.bottom / 2,
        right: resumeTemplate.spacing.pagePadding.right,
        fontSize: 9,
      },
    });
    return styles;
  }, [resumeTemplate, skipFont]);

  return (
    <Document>
      <Page size={'A4'} style={styles?.page} orientation={'portrait'}>
        {resumeTemplate &&
          renderNode({ ...resumeTemplate, type: 'View' } as ResumeTemplateElement, resume, [])}

        {resumeTemplate?.enablePageNumbers && (
          <Text
            style={styles?.pageNumber}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
            fixed
          />
        )}
      </Page>
    </Document>
  );
};
