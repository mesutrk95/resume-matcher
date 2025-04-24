import { ResumeContent } from '@/types/resume';

export type WizardExperience = {
  id: string;
  role?: string;
  companyName?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  currentlyWorking: boolean;
  descriptions: string[];
  // tools: string[];
};

// export type WizardResumeContent = Omit<ResumeContent, 'experiences'> & {
//   includeOptionalSteps?: boolean;
//   experiences: WizardExperience[];
// };

export type WizardResumeContent = ResumeContent & {
  includeOptionalSteps?: boolean;
};
