import { useContext } from 'react';
import { ResumeBuilderContext } from './ResumeBuilderProvider';

export const useResumeBuilder = () => {
  return useContext(ResumeBuilderContext);
};
