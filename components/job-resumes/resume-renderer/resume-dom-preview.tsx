import { ResumeContent } from '@/types/resume';
import {
  ResumeTemplateClass,
  ResumeTemplateContent,
  ResumeTemplateElement,
} from '@/types/resume-template';
import { parseDate } from 'chrono-node';
import { JSONPath } from 'jsonpath-plus';
import moment from 'moment';
import React, { useCallback, useMemo } from 'react';

const HOVER_CLASSES = 'hover:bg-slate-100 hover:rounded cursor-pointer';

export const ResumeDomPreview = ({
  resume,
  resumeTemplate,
  onClickItem,
}: {
  resume: ResumeContent;
  resumeTemplate: ResumeTemplateContent;
  onClickItem?: (tag?: string, id?: string) => void;
}) => {
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
            <div
              key={index}
              style={{ ...element.style, ...getClassStyles(element.class) }}
              className={element.tag && HOVER_CLASSES}
              {...(element.tag && {
                'data-tag': element.tag,
              })}
              {...(itemData?.id && {
                'data-id': itemData.id,
                id: 'doc-' + itemData.id,
              })}
              {...props}
            >
              {element.elements &&
                renderNode(
                  element,
                  itemData || baseItemData,
                  index ? [...baseParams, index] : baseParams,
                )}
            </div>
          );
        } else if (element.type === 'Text' || element.type === 'Link') {
          let textData;

          if (element.data) {
            textData = element.data;
          } else if (element.render) {
            const result = runFunction(element.render, itemData);
            if (typeof result === 'string') textData = result;
          } else {
            textData = element.path && getData(itemData, element.path)[0];
          }

          const ElementType = element.type === 'Text' ? 'p' : 'a';
          return (
            <ElementType
              key={index}
              style={{ ...element.style, ...getClassStyles(element.class) }}
              className={element.tag && HOVER_CLASSES}
              {...(element.tag && {
                'data-tag': element.tag,
              })}
              {...(itemData?.id && {
                'data-id': itemData.id,
                id: 'doc-' + itemData.id,
              })}
              {...props}
            >
              {textData}
            </ElementType>
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

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    let currentElement = e.target as HTMLElement;

    // Traverse up the DOM tree until we find an element with data-tag
    // or until we reach the top of the tree
    while (currentElement && !currentElement.dataset.tag) {
      currentElement = currentElement.parentElement as HTMLElement;
      if (!currentElement) break; // Stop if we reach the top
    }

    // If we found an element with data-tag
    if (currentElement) {
      const dataId = currentElement.dataset.id;
      const dataTag = currentElement.dataset.tag;

      console.log('Found element with data-tag:', currentElement);
      console.log('data-id:', dataId);
      console.log('data-tag:', dataTag);

      onClickItem?.(dataTag, dataId);
    } else {
      console.log('No element with data-tag found in the parent hierarchy');
    }
  };

  return (
    <div className="h-full overflow-auto p-8" onClick={handleClick}>
      {resumeTemplate &&
        renderNode({ ...resumeTemplate, type: 'View' } as ResumeTemplateElement, resume, [])}
    </div>
  );
};
