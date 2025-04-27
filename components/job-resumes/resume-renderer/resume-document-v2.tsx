import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { ResumeContent } from '@/types/resume';
import React, { useCallback, useMemo } from 'react';
import { ResumeDesign } from '@/types/resume-design';
import {
  ResumeTemplate,
  ResumeTemplateClass,
  ResumeTemplateElement,
  ResumeTemplateElementStyle,
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

// export const ResumeDocument = ({
//   resumeDesign,
//   ...props
// }: {
//   resume: ResumeContent;
//   withIdentifiers?: boolean;
//   skipFont?: boolean;
//   resumeDesign?: ResumeDesign | null;
// }) => {
//   return (
//     <ResumeRendererProvider initialResumeDesign={resumeDesign || DEFAULT_RESUME_DESIGN}>
//       <ResumeDocumentRenderer {...props} />
//     </ResumeRendererProvider>
//   );
// };

/*
text component valid props:
  render:
    p: (relPath: string) => string
    p is used to get data using jsonpath-plus the path must be relative
    
    renderDates: (dates: string[], separator?: string = '-') => string
    it does the formating on the input dates and seperate them by separator

    join: (strs: string[], separator?: string = '•') => string
    it joins all the input strings and disposes null & undefined then seperates them by separator

  data: 
    displays literal string

  path: 
    directly gives the content to json path (relative)
*/
export const initial: ResumeTemplate = {
  name: 'Professional Full-Stack Developer',
  version: 1,
  pageSize: 'A4',
  orientation: 'portrait',
  fonts: {
    family: 'Open Sans',
    fallback: 'Helvetica, Arial, sans-serif',
    baseSize: 10,
  },
  spacing: {
    unit: 4,
    sectionGap: 2,
    itemGap: 1,
    pagePadding: { top: 30, right: 30, bottom: 30, left: 30 },
  },
  classDefs: {
    'text-muted': { color: '#666' },
    h1: { fontSize: 24, fontWeight: 'bold', marginBottom: 2 },
    h2: { fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
    h3: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    h4: { fontSize: 14, fontWeight: 'bold' },
    h5: { fontSize: 12, fontWeight: 'bold' },
    h6: { fontSize: 10, fontWeight: 'bold' },
    p: { fontSize: 10, fontWeight: 'normal' },
    'section-header': {
      fontSize: 16,
      fontWeight: 'bold',
      borderBottom: '2pt solid #006400',
      paddingBottom: 2,
      marginBottom: 6,
      marginTop: 8,
    },
    'main-title': {
      fontSize: 26,
      fontWeight: 'bold',
      marginBottom: 2,
    },
    'contact-info': {
      fontSize: 10,
      color: '#333',
      marginBottom: 8,
    },
    'date-range': {
      fontSize: 10,
      fontWeight: 'normal',
      color: '#333',
      marginLeft: 4,
    },
    'company-info': {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    'experience-item': {
      marginBottom: 4,
    },
    'bullet-point': {
      display: 'flex',
      flexDirection: 'row',
      gap: 2,
      marginBottom: 2,
      paddingLeft: 4,
    },
    'project-title': {
      fontSize: 14,
      fontWeight: 'bold',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 2,
    },
    'project-link': {
      fontSize: 10,
      color: '#666',
      marginBottom: 2,
    },
  },
  elements: [
    // Header Section
    {
      type: 'View',
      style: { display: 'flex', flexDirection: 'column', marginBottom: 4 },
      elements: [
        {
          type: 'Text',
          path: 'titles[0].content',
          class: 'main-title',
        },
        {
          type: 'Text',
          render: '$r.contactInfo.firstName + " " + $r.contactInfo.lastName',
          class: 'h2',
        },
        {
          type: 'View',
          style: { display: 'flex', flexDirection: 'row', gap: 4 },
          elements: [
            {
              type: 'Text',
              render:
                'join([p("contactInfo.country"), p("contactInfo.email"), p("contactInfo.phone"), p("contactInfo.linkedIn")])',
              class: 'contact-info',
            },
          ],
        },
      ],
    },

    // Professional Summary Section
    {
      type: 'View',
      style: { marginBottom: 8 },
      elements: [
        {
          type: 'Text',
          data: 'Professional Summary',
          class: 'section-header',
        },
        {
          type: 'Text',
          path: 'summaries[0].content',
          class: 'p',
        },
      ],
    },

    // Skills Section
    {
      type: 'View',
      style: { marginBottom: 8 },
      elements: [
        {
          type: 'Text',
          data: 'Skills',
          class: 'section-header',
        },
        {
          type: 'View',
          path: '$.skills[?(@.enabled==true)]',
          style: { marginBottom: 4 },
          elements: [
            {
              type: 'Text',
              render: 'join(p("skills[*].content"), ", ")',
              class: 'p',
            },
          ],
        },
      ],
    },

    // Experiences Section
    {
      type: 'View',
      style: { marginBottom: 8 },
      elements: [
        {
          type: 'Text',
          data: 'Experiences',
          class: 'section-header',
        },
        {
          type: 'View',
          path: '$.experiences[?(@.enabled==true)]',
          style: { display: 'flex', flexDirection: 'column', gap: 4 },
          elements: [
            {
              type: 'View',
              style: { marginBottom: 8 },
              elements: [
                {
                  type: 'View',
                  class: 'company-info',
                  elements: [
                    {
                      type: 'Text',
                      path: 'role',
                      class: 'h4',
                    },
                    {
                      type: 'Text',
                      render: 'renderDates([$item.startDate, $item.endDate])',
                      class: 'date-range',
                    },
                  ],
                },
                {
                  type: 'View',
                  style: { display: 'flex', flexDirection: 'row', marginBottom: 4 },
                  elements: [
                    {
                      type: 'Text',
                      render: 'join([$item.companyName, $item.location, $item.type])',
                      class: 'p',
                    },
                  ],
                },
                {
                  type: 'View',
                  style: { display: 'flex', flexDirection: 'column', gap: 4 },
                  path: 'items[?(@.enabled==true)].variations[?(@.enabled==true)]',
                  elements: [
                    {
                      type: 'View',
                      class: 'bullet-point',
                      elements: [
                        {
                          type: 'Text',
                          data: '• ',
                        },
                        {
                          type: 'Text',
                          path: 'content',
                          class: 'p',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },

    // Education Section
    {
      type: 'View',
      style: { marginBottom: 8 },
      elements: [
        {
          type: 'Text',
          data: 'Education',
          class: 'section-header',
        },
        {
          type: 'View',
          path: '$.educations[?(@.enabled==true)]',
          style: { display: 'flex', flexDirection: 'column', gap: 8 },
          elements: [
            {
              type: 'View',
              style: { display: 'flex', flexDirection: 'column', marginBottom: 4 },
              elements: [
                {
                  type: 'View',
                  style: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between' },
                  elements: [
                    {
                      type: 'Text',
                      path: 'degree',
                      class: 'h4',
                    },
                    {
                      type: 'Text',
                      render: 'renderDates([$item.startDate, $item.endDate])',
                      class: 'date-range',
                    },
                  ],
                },
                {
                  type: 'Text',
                  path: 'institution',
                  class: 'p',
                },
              ],
            },
          ],
        },
      ],
    },

    // Projects Section
    {
      type: 'View',
      style: { marginBottom: 8 },
      elements: [
        {
          type: 'Text',
          data: 'Projects',
          class: 'section-header',
        },
        {
          type: 'View',
          path: '$.projects[?(@.enabled==true)]',
          style: { display: 'flex', flexDirection: 'column', gap: 8 },
          elements: [
            {
              type: 'View',
              style: { marginBottom: 6 },
              elements: [
                {
                  type: 'View',
                  class: 'project-title',
                  elements: [
                    {
                      type: 'Text',
                      path: 'name',
                      class: 'h4',
                    },
                    {
                      type: 'Text',
                      render: 'renderDates([$item.startDate, $item.endDate])',
                      class: 'date-range',
                    },
                  ],
                },
                {
                  type: 'Text',
                  path: 'link',
                  class: 'project-link',
                },
                {
                  type: 'Text',
                  path: 'content',
                  class: 'p',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const ResumeDocumentV2 = ({
  resume,
  withIdentifiers,
  skipFont,
  resumeTemplate = initial,
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

    console.log('geeeeeeeeeeeeeeeeeeeeeeeeeeeeeeet: ', path, source, result);

    return result;
  };

  const createFunction = useMemo(() => {
    const formatDate = (date?: string) => {
      if (!date) return '';
      if (date === 'Present') return 'Present';
      return moment(parseDate(date)).format(resumeTemplate?.dateFormat || 'MMM YYYY');
    };

    const renderDates = (dates: string[], separator: string = '-'): string => {
      const validDates = dates.filter(date => !!date).map(d => formatDate(d));
      return validDates.join(separator);
    };

    const join = (strs: string[], separator: string = '•'): string => {
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

    return createFunction;
  }, [resume, resumeTemplate, resumeTemplate?.dateFormat]);

  const renderNode = (
    baseElement: ResumeTemplateElement,
    baseItemData: any,
    baseParams: number[],
  ) => {
    if (!baseElement) return null;

    function renderChilds(itemData: any, itemIndex?: number) {
      return baseElement?.elements?.map((element, index) => {
        if (element.type === 'View') {
          console.log('hereeeeeeeee View', element, {
            ...element.style,
            ...getClassStyles(element.class),
          });
          return (
            <View key={index} style={{ ...element.style, ...getClassStyles(element.class) }}>
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
            const func = element.render;
            const evaluate = createFunction<ResumeContent, string | Function>(
              func,
              resume,
              (path: string) => getData(itemData, path),
            );
            let result = evaluate(itemData);
            if (typeof result === 'function') {
              result = result() as string;
            }
            if (typeof result === 'string') textData = result;
          } else {
            textData = element.path && getData(itemData, element.path)[0];
          }
          console.log('hereeeeeeeee Text', {
            element,
            baseElement,
            baseParams,
            textData,
          });
          return (
            <Text key={index} style={{ ...element.style, ...getClassStyles(element.class) }}>
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
        // bottom: design.spacing.pagePadding.bottom / 2,
        // right: design.spacing.pagePadding.right,
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
      </Page>
    </Document>
  );
};
