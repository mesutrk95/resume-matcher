import React, { ReactNode } from 'react';
import { useHighlight } from './context';
export const HighlightElement = ({
  id,
  children,
  highlightClass = 'highlight-active',
  style = {},
}: {
  id: string;
  children: ReactNode;
  highlightClass?: string;
  style?: React.CSSProperties;
}) => {
  const { highlightedId } = useHighlight();
  const isHighlighted = highlightedId === id;

  return (
    <div
      id={id}
      className={isHighlighted ? `bg-yellow-50 ${highlightClass}` : ''}
      style={{
        transition: 'background-color 0.3s ease',
        // ...(isHighlighted ? { backgroundColor: '#ffff9c' } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
};
