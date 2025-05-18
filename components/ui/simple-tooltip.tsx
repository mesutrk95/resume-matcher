import React, { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

export const SimpleTooltip = ({ children, text }: { children: ReactNode; text?: string }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  );
};
