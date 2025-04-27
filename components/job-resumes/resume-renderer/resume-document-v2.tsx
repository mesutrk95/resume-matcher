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

    $r : refers to resume data object

    $item : refers to current object is trying to render

  data: 
    displays literal string

  path: 
    directly gives the content to json path (relative)
*/
export const initial: ResumeTemplate =
  // Complete Resume Template
  {
    name: 'Complete one-column resume template',
    version: 1,
    pageSize: 'A4',
    orientation: 'portrait',
    enablePageNumbers: true,
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
      h1: { fontSize: 24, fontWeight: 'bold', paddingBottom: 2 },
      h2: { fontSize: 18, fontWeight: 'bold', paddingBottom: 2 },
      h3: { fontSize: 16, fontWeight: 'bold', paddingBottom: 4 },
      h4: { fontSize: 14, fontWeight: 'bold' },
      h5: { fontSize: 12, fontWeight: 'bold' },
      h6: { fontSize: 10, fontWeight: 'bold' },
      p: { fontSize: 10, fontWeight: 'normal' },
      'section-header': {
        fontSize: 16,
        fontWeight: 'bold',
        borderBottom: '2pt solid #006400',
        paddingTop: 8,
        paddingBottom: 5,
        marginBottom: 5,
      },
      'main-title': {
        fontSize: 26,
        fontWeight: 'bold',
        paddingBottom: 2,
      },
      'contact-info': {
        fontSize: 10,
        color: '#333',
        paddingBottom: 8,
      },
      'date-range': {
        fontSize: 10,
        fontWeight: 'normal',
        color: '#333',
        paddingLeft: 4,
      },
      'company-info': {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 4,
      },
      'experience-item': {
        paddingBottom: 4,
      },
      'bullet-point': {
        display: 'flex',
        flexDirection: 'row',
        gap: 2,
        paddingBottom: 2,
        paddingLeft: 4,
      },
      'project-title': {
        fontSize: 14,
        fontWeight: 'bold',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 2,
      },
      'project-link': {
        fontSize: 10,
        color: '#666',
        paddingBottom: 2,
      },
      'skills-section': {
        paddingBottom: 4,
      },
      'skills-category': {
        fontSize: 12,
        fontWeight: 'bold',
        paddingBottom: 2,
      },
      'languages-section': {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
      },
      'language-item': {
        display: 'flex',
        flexDirection: 'row',
        gap: 2,
      },
      'award-item': {
        paddingBottom: 4,
      },
      'certification-item': {
        paddingBottom: 4,
      },
      'interest-item': {
        display: 'flex',
        flexDirection: 'row',
        gap: 2,
        paddingBottom: 2,
      },
      'reference-item': {
        paddingBottom: 6,
      },
    },
    elements: [
      // Header Section
      {
        type: 'View',
        style: { display: 'flex', flexDirection: 'column', paddingBottom: 4 },
        elements: [
          {
            type: 'Text',
            path: '$.titles[?(@.enabled==true)].content',
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
                  'join([p("contactInfo.email"), p("contactInfo.phone"), p("contactInfo.linkedIn"), p("contactInfo.github"), p("contactInfo.website"), p("contactInfo.twitter"), p("contactInfo.address"), p("contactInfo.country")], " • ")',
                class: 'contact-info',
              },
            ],
          },
        ],
      },

      // Professional Summary Section
      {
        type: 'View',
        style: { paddingBottom: 8 },
        hide: 'p("$.summaries[?(@.enabled==true)]").length > 0',
        elements: [
          {
            type: 'Text',
            data: 'Professional Summary',
            class: 'section-header',
          },
          {
            type: 'View',
            path: '$.summaries[?(@.enabled==true)]',
            elements: [
              {
                type: 'Text',
                path: 'content',
                class: 'p',
              },
            ],
          },
        ],
      },

      // Skills Section
      {
        type: 'View',
        style: { paddingBottom: 8 },
        hide: 'p("$.skills[?(@.enabled==true)]").length > 0',
        elements: [
          {
            type: 'Text',
            data: 'Skills',
            class: 'section-header',
          },
          {
            type: 'View',
            path: '$.skills[?(@.enabled==true)]',
            class: 'skills-section',
            elements: [
              // {
              //   type: 'Text',
              //   path: 'category',
              //   class: 'skills-category',
              // },
              {
                type: 'Text',
                render: 'join(p("skills[?(@.enabled==true)].content"), ", ")',
                class: 'p',
              },
            ],
          },
        ],
      },

      // Experiences Section
      {
        type: 'View',
        style: { paddingBottom: 8 },
        hide: 'p("$.experiences[?(@.enabled==true)]").length > 0',
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
                style: { paddingBottom: 8 },
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
                    style: { display: 'flex', flexDirection: 'row', paddingBottom: 4 },
                    elements: [
                      {
                        type: 'Text',
                        render: 'join([$item.companyName, $item.location, $item.type], ", ")',
                        class: 'p',
                      },
                    ],
                  },
                  {
                    type: 'View',
                    style: { display: 'flex', flexDirection: 'column', gap: 4 },
                    path: 'items[?(@.enabled==true)]',
                    elements: [
                      {
                        type: 'Text',
                        path: 'description',
                        class: 'p',
                      },
                      {
                        type: 'View',
                        style: { display: 'flex', flexDirection: 'column' },
                        path: 'variations[?(@.enabled==true)]',
                        elements: [
                          {
                            type: 'View',
                            class: 'bullet-point',
                            wrap: false,
                            break: false,
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
        ],
      },

      // Education Section
      {
        type: 'View',
        style: { paddingBottom: 8 },
        hide: 'p("$.educations[?(@.enabled==true)]").length > 0',
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
                style: { display: 'flex', flexDirection: 'column', paddingBottom: 4 },
                elements: [
                  {
                    type: 'View',
                    style: {
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    },
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
                    render: 'join([$item.institution, $item.location], ", ")',
                    class: 'p',
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

      // Projects Section
      {
        type: 'View',
        style: { paddingBottom: 8 },
        hide: 'p("$.projects[?(@.enabled==true)]").length > 0',
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
                style: { paddingBottom: 6 },
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

      // Certifications Section
      {
        type: 'View',
        style: { paddingBottom: 8 },
        hide: 'p("$.certifications[?(@.enabled==true)]").length > 0',
        elements: [
          {
            type: 'Text',
            data: 'Certifications',
            class: 'section-header',
          },
          {
            type: 'View',
            path: '$.certifications[?(@.enabled==true)]',
            style: { display: 'flex', flexDirection: 'column', gap: 4 },
            elements: [
              {
                type: 'View',
                class: 'certification-item',
                elements: [
                  {
                    type: 'View',
                    style: {
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    },
                    elements: [
                      {
                        type: 'Text',
                        path: 'name',
                        class: 'h4',
                      },
                      {
                        type: 'Text',
                        path: 'date',
                        class: 'date-range',
                      },
                    ],
                  },
                  {
                    type: 'Text',
                    path: 'issuer',
                    class: 'p',
                  },
                  {
                    type: 'Text',
                    path: 'description',
                    class: 'p',
                  },
                ],
              },
            ],
          },
        ],
      },

      // Awards Section
      {
        type: 'View',
        style: { paddingBottom: 8 },
        hide: 'p("$.awards[?(@.enabled==true)]").length > 0',
        elements: [
          {
            type: 'Text',
            data: 'Awards',
            class: 'section-header',
          },
          {
            type: 'View',
            path: '$.awards[?(@.enabled==true)]',
            style: { display: 'flex', flexDirection: 'column', gap: 4 },
            elements: [
              {
                type: 'View',
                class: 'award-item',
                elements: [
                  {
                    type: 'View',
                    style: {
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    },
                    elements: [
                      {
                        type: 'Text',
                        path: 'issuer',
                        class: 'h4',
                      },
                      {
                        type: 'Text',
                        path: 'date',
                        class: 'date-range',
                      },
                    ],
                  },
                  {
                    type: 'Text',
                    path: 'description',
                    class: 'p',
                  },
                ],
              },
            ],
          },
        ],
      },

      // Languages Section
      {
        type: 'View',
        style: { paddingBottom: 8 },
        hide: 'p("$.languages[?(@.enabled==true)]").length > 0',
        elements: [
          {
            type: 'Text',
            data: 'Languages',
            class: 'section-header',
          },
          {
            type: 'View',
            class: 'languages-section',
            path: '$.languages[?(@.enabled==true)]',
            elements: [
              {
                type: 'View',
                class: 'language-item',
                elements: [
                  {
                    type: 'Text',
                    render: '$item.name + " (" + $item.level + ")"',
                    class: 'p',
                  },
                ],
              },
            ],
          },
        ],
      },

      // Interests Section
      {
        type: 'View',
        style: { paddingBottom: 8 },
        hide: 'p("$.interests[?(@.enabled==true)]").length > 0',
        elements: [
          {
            type: 'Text',
            data: 'Interests',
            class: 'section-header',
          },
          {
            type: 'View',
            style: { display: 'flex', flexDirection: 'column' },
            path: '$.interests[?(@.enabled==true)]',
            elements: [
              {
                type: 'View',
                class: 'interest-item',
                elements: [
                  {
                    type: 'Text',
                    data: '• ',
                  },
                  {
                    type: 'Text',
                    path: 'description',
                    class: 'p',
                  },
                ],
              },
            ],
          },
        ],
      },

      // References Section
      {
        type: 'View',
        style: { paddingBottom: 8 },
        elements: [
          {
            type: 'Text',
            data: 'References',
            class: 'section-header',
          },
          {
            type: 'View',
            path: '$.references[?(@.enabled==true)]',
            style: { display: 'flex', flexDirection: 'column', gap: 6 },
            elements: [
              {
                type: 'View',
                class: 'reference-item',
                elements: [
                  {
                    type: 'Text',
                    path: 'name',
                    class: 'h4',
                  },
                  {
                    type: 'Text',
                    render: 'join([$item.title, $item.company], ", ")',
                    class: 'p',
                  },
                  {
                    type: 'Text',
                    render: 'join([$item.email, $item.phone], " • ")',
                    class: 'p',
                  },
                  {
                    type: 'Text',
                    path: 'relationship',
                    class: 'text-muted',
                  },
                  {
                    type: 'Text',
                    path: 'description',
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
      const evaluate = createFunction<ResumeContent, string | Function>(
        func,
        resume,
        (path: string) => getData(itemData, path),
      );
      let result = evaluate(itemData);
      if (typeof result === 'function') {
        result = result() as string;
      }

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
          if (tHide === 'boolean') return null;
          else if (tHide === 'string') {
            const result = runFunction(element.hide as string, itemData);
            if (!result) return null;
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
