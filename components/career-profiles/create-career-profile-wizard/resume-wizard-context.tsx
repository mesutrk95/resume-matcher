'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  ComponentType,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Briefcase,
  Zap,
  FileText,
  Building,
  GraduationCap,
  Award,
  Globe,
  Code,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { Experience, ResumeContent } from '@/types/resume';
import { OptionalStepsPrompt } from './steps/optional-steps-prompt';
import { TitleStep } from './steps/title-step';
import { SkillsStep } from './steps/skills-step';
import { SummaryStep } from './steps/summary-step';
import { ExperienceStep } from './steps/experience-step';
import { EducationStep } from './steps/education-step';
import { CertificationsStep } from './steps/certifications-step';
import { LanguagesStep } from './steps/languages-step';
import { ProjectsStep } from './steps/projects-step';
import { CompletionStep } from './steps/completion-step';
import { generateId } from '@/lib/resume-content';
import { WizardExperience, WizardResumeContent } from './types';

export type WizardStep = {
  id: string;
  label: string;
  icon: ComponentType;
  optional?: boolean;
};

// Define the core and optional steps with icons
export const coreSteps = [
  { id: 'title', label: 'Title', icon: Briefcase, optional: false },
  { id: 'skills', label: 'Skills', icon: Zap, optional: false },
  {
    id: 'summary',
    label: 'Professional Summary',
    icon: FileText,
    optional: false,
  },
  {
    id: 'experience',
    label: 'Work Experience',
    icon: Building,
    optional: false,
  },
];

export const optionalSteps = [
  {
    id: 'education',
    label: 'Education',
    icon: GraduationCap,
    optional: true,
  },
  {
    id: 'certifications',
    label: 'Certifications',
    icon: Award,
    optional: true,
  },
  { id: 'languages', label: 'Languages', icon: Globe, optional: true },
  { id: 'projects', label: 'Projects', icon: Code, optional: true },
];

export const finalStep = {
  id: 'completion',
  label: 'Done!',
  icon: CheckCircle,
  optional: false,
};

// Initialize empty resume data
export const emptyResumeData: WizardResumeContent = {
  experiences: [],
  titles: [],
  summaries: [],
  educations: [],
  skills: [],
  projects: [],
  contactInfo: {},
  awards: [],
  languages: [],
  certifications: [],
  interests: [],
  references: [],
  version: 1,
  includeOptionalSteps: undefined,
};

// Define the context type
interface ResumeWizardContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  resumeData: ResumeContent;
  updateResumeData: (data: Partial<ResumeContent>) => void;
  step: WizardStep;
  activeSteps: WizardStep[];
  progress: number;
  isLastStep: boolean;
  isFirstStep: boolean;
  isOptionalPromptStep: boolean;
  showOptionalPrompt: boolean;
  handleNext: () => void;
  handleBack: () => void;
  handleSkip: () => void;
  handleOptionalStepsDecision: (includeOptionalSteps: boolean) => void;
  addTitle: (content: string) => void;
  addSkills: (skills: string[]) => void;
  addSummary: (content: string) => void;
  addExperiences: (experiences: any[]) => void;
  addEducations: (educations: any[]) => void;
  addCertifications: (certifications: any[]) => void;
  addLanguages: (languages: any[]) => void;
  addProjects: (projects: any[]) => void;
  renderStep: () => ReactNode | null;
}

// Create the context
const ResumeWizardContext = createContext<ResumeWizardContextType | undefined>(undefined);

// Create a provider component
interface ResumeWizardProviderProps {
  children: ReactNode;
  initialResumeData?: WizardResumeContent;
  onResumeWizardDone?: (resumeData: WizardResumeContent) => void;
}

export function ResumeWizardProvider({
  children,
  onResumeWizardDone,
  initialResumeData,
}: ResumeWizardProviderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [resumeData, setResumeData] = useState<WizardResumeContent>(() => {
    if (initialResumeData) return initialResumeData;
    // Try to load from localStorage on initial render (client-side only)
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('resumeData');
      if (savedData) {
        try {
          return JSON.parse(savedData);
        } catch (e) {
          console.error('Failed to parse saved resume data', e);
        }
      }
    }
    return emptyResumeData;
  });

  // Determine which steps to show based on user's choice
  const [showOptionalPrompt, setShowOptionalPrompt] = useState<boolean>(() => {
    // If we already have a decision stored, don't show the prompt
    return resumeData.includeOptionalSteps === undefined;
  });

  // Calculate the active steps based on the user's choice
  const activeSteps = ((): WizardStep[] => {
    // If user hasn't made a choice yet and we're still in core steps
    if (resumeData.includeOptionalSteps === undefined && currentStep <= coreSteps.length) {
      return [
        ...coreSteps,
        { id: 'optional-prompt', label: 'More Details', icon: HelpCircle },
        finalStep,
      ];
    }
    // If user has chosen to include optional steps
    else if (resumeData.includeOptionalSteps === true) {
      return [...coreSteps, ...optionalSteps, finalStep];
    }
    // If user has chosen to skip optional steps
    else {
      return [...coreSteps, finalStep];
    }
  })();

  const isLastStep = currentStep === activeSteps.length - 1;
  const isFirstStep = currentStep === 0;
  const isOptionalPromptStep =
    activeSteps[currentStep]?.id === 'optional-prompt' && showOptionalPrompt;

  // Add this useEffect to save to localStorage whenever resumeData changes
  useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
  }, [resumeData]);

  // Add this useEffect to call the callback when the user reaches the completion step
  // useEffect(() => {
  //   if (currentStep === activeSteps.length - 1) {
  //     onResumeWizardDone?.(resumeData);
  //   }
  // }, [currentStep, onResumeWizardDone, resumeData, activeSteps.length]);

  // Calculate progress based on current step and total steps
  const progress = Math.round((currentStep / (activeSteps.length - 1)) * 100);

  const handleNext = () => {
    if (isLastStep) {
      onResumeWizardDone?.(resumeData);
      return;
    }
    if (currentStep < activeSteps.length - 1) {
      // If we're at the work experience step and haven't decided on optional steps
      if (
        activeSteps[currentStep].id === 'experience' &&
        resumeData.includeOptionalSteps === undefined
      ) {
        setShowOptionalPrompt(true);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < activeSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleOptionalStepsDecision = (includeOptionalSteps: boolean) => {
    // Update the resume data with the user's choice
    setResumeData(prev => ({
      ...prev,
      includeOptionalSteps,
    }));

    // No longer need to show the prompt
    setShowOptionalPrompt(false);

    // If user chose not to include optional steps, skip to completion
    if (!includeOptionalSteps) {
      setCurrentStep(coreSteps.length); // This will be the completion step index
    } else {
      // Otherwise, proceed to the next step (education)
      setCurrentStep(coreSteps.length);
    }
  };

  const updateResumeData = useCallback((data: Partial<WizardResumeContent>) => {
    setResumeData(prev => ({ ...prev, ...data }));
  }, []);

  // Helper function to add a title
  const addTitle = useCallback(
    (content: string) => {
      updateResumeData({
        titles: [
          {
            id: uuidv4(),
            content,
            enabled: true,
          },
        ],
      });
    },
    [updateResumeData],
  );

  // Helper function to add skills
  const addSkills = useCallback(
    (skills: string[]) => {
      const skillItems = skills.map(skill => ({
        id: uuidv4(),
        content: skill,
        enabled: true,
      }));

      updateResumeData({
        skills: [
          {
            category: 'Technical Skills',
            enabled: true,
            skills: skillItems,
          },
        ],
      });
    },
    [updateResumeData],
  );

  // Helper function to add a summary
  const addSummary = useCallback(
    (content: string) => {
      const newSummary = {
        id: uuidv4(),
        content,
        enabled: true,
      };

      updateResumeData({
        summaries: [newSummary],
      });
    },
    [updateResumeData],
  );

  // Helper function to add experiences
  const addExperiences = useCallback(
    (experiences: WizardExperience[]) => {
      const formattedExperiences = experiences.map(
        exp =>
          ({
            id: exp.id,
            companyName: exp.companyName,
            role: exp.role,
            startDate: exp.startDate,
            endDate: exp.endDate,
            location: exp.location,
            enabled: true,
            items: exp.descriptions
              .filter(desc => !!desc)
              .map(desc => ({
                id: generateId('experiences.items'),
                description: '',
                enabled: true,
                variations: [
                  {
                    id: generateId('experiences.items.variations'),
                    content: desc,
                    enabled: true,
                  },
                ],
              })),
          }) as Experience,
      );

      updateResumeData({
        experiences: formattedExperiences,
      });
    },
    [updateResumeData],
  );

  // Helper function to add education
  const addEducations = useCallback(
    (educations: any[]) => {
      const formattedEducations = educations.map(edu => ({
        id: uuidv4(),
        degree: edu.degree,
        institution: edu.school,
        location: edu.location || '',
        startDate: edu.startDate,
        endDate: edu.endDate,
        content: `${edu.degree} in ${edu.major}`,
        enabled: true,
      }));

      updateResumeData({
        educations: formattedEducations,
      });
    },
    [updateResumeData],
  );

  // Helper function to add certifications
  const addCertifications = useCallback(
    (certifications: any[]) => {
      const formattedCertifications = certifications.map(cert => ({
        id: uuidv4(),
        name: cert.name,
        issuer: cert.organization,
        date: cert.date,
        description: cert.credentialId,
        enabled: true,
      }));

      updateResumeData({
        certifications: formattedCertifications,
      });
    },
    [updateResumeData],
  );

  // Helper function to add languages
  const addLanguages = useCallback(
    (languages: any[]) => {
      const formattedLanguages = languages.map(lang => ({
        id: uuidv4(),
        name: lang.language,
        level: lang.proficiency,
        enabled: true,
      }));

      updateResumeData({
        languages: formattedLanguages,
      });
    },
    [updateResumeData],
  );

  // Helper function to add projects
  const addProjects = useCallback(
    (projects: any[]) => {
      const formattedProjects = projects.map(proj => ({
        id: uuidv4(),
        name: proj.title,
        link: proj.link,
        content: proj.description,
        enabled: true,
      }));

      updateResumeData({
        projects: formattedProjects,
      });
    },
    [updateResumeData],
  );

  // Render the current step
  const renderStep = (): ReactNode | null => {
    const currentStepId = activeSteps[currentStep]?.id;

    // If we're at the optional prompt step and should show it
    if (currentStepId === 'optional-prompt' && showOptionalPrompt) {
      return <OptionalStepsPrompt onContinue={handleOptionalStepsDecision} />;
    }

    switch (currentStepId) {
      case 'title':
        return (
          <TitleStep onSelectTitle={addTitle} initialTitle={resumeData.titles[0]?.content || ''} />
        );
      case 'skills':
        return (
          <SkillsStep
            selectedTitle={resumeData.titles[0]?.content || ''}
            onSelectSkills={addSkills}
            initialSkills={resumeData.skills[0]?.skills.map(skill => skill.content) || []}
          />
        );
      case 'summary':
        return (
          <SummaryStep
            onSaveSummary={addSummary}
            initialSummary={resumeData.summaries[0]?.content || ''}
          />
        );
      case 'experience':
        return (
          <ExperienceStep
            onSaveExperiences={addExperiences}
            initialExperiences={resumeData.experiences.map(exp => ({
              id: exp.id,
              role: exp.role,
              companyName: exp.companyName,
              startDate: exp.startDate,
              endDate: exp.endDate,
              location: exp.location,
              currentlyWorking: false,
              descriptions: exp.items.map(item => item.variations.map(v => v.content)?.[0] || ''),
            }))}
          />
        );
      case 'education':
        return (
          <EducationStep
            onSaveEducations={addEducations}
            initialEducations={resumeData.educations.map(edu => ({
              id: edu.id,
              degree: edu.degree,
              major: edu.content.replace(`${edu.degree} in `, ''),
              school: edu.institution,
              location: edu.location || '',
              startDate: edu.startDate || '',
              endDate: edu.endDate || '',
            }))}
          />
        );
      case 'certifications':
        return (
          <CertificationsStep
            onSaveCertifications={addCertifications}
            initialCertifications={resumeData.certifications.map(cert => ({
              id: cert.id,
              name: cert.name,
              organization: cert.issuer,
              date: cert.date,
              credentialId: cert.description || '',
            }))}
          />
        );
      case 'languages':
        return (
          <LanguagesStep
            onSaveLanguages={addLanguages}
            initialLanguages={resumeData.languages.map(lang => ({
              id: lang.id,
              language: lang.name,
              proficiency: lang.level,
            }))}
          />
        );
      case 'projects':
        return (
          <ProjectsStep
            onSaveProjects={addProjects}
            initialProjects={resumeData.projects.map(proj => ({
              id: proj.id,
              title: proj.name,
              description: proj.content,
              link: proj.link,
            }))}
          />
        );
      case 'completion':
        return <CompletionStep resumeData={resumeData} />;
      default:
        return null;
    }
  };

  const value = {
    currentStep,
    setCurrentStep,
    resumeData,
    updateResumeData,
    step: activeSteps[currentStep],
    activeSteps,
    progress,
    isLastStep,
    isFirstStep,
    isOptionalPromptStep,
    showOptionalPrompt,
    handleNext,
    handleBack,
    handleSkip,
    handleOptionalStepsDecision,
    addTitle,
    addSkills,
    addSummary,
    addExperiences,
    addEducations,
    addCertifications,
    addLanguages,
    addProjects,
    renderStep,
  };

  return <ResumeWizardContext.Provider value={value}>{children}</ResumeWizardContext.Provider>;
}

// Create a hook to use the context
export function useResumeWizard() {
  const context = useContext(ResumeWizardContext);
  if (context === undefined) {
    throw new Error('useResumeWizard must be used within a ResumeWizardProvider');
  }
  return context;
}
