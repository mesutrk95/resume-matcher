'use client';

import { ContactInfoSection } from './contact-information';
import { ProjectsSection } from './projects';
import { ExperiencesSection } from './experiences';
import { EducationsSection } from './educations';
import { SummariesSection } from './summaries';
import { TitlesSection } from './titles';
import { SkillsSection } from './skills';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Minus, Plus } from 'lucide-react';
import { ReactNode, useState } from 'react';
import clsx from 'clsx';

export function ResumeBuilder() {
  return (
    <div className="flex flex-col gap-2">
      <ContactInfoSection />
      <TitlesSection />
      <SummariesSection />
      <ExperiencesSection />
      <EducationsSection />
      <ProjectsSection />
      <SkillsSection />
    </div>
  );
}

function AccordionElement({
  title,
  name,
  isOpen,
  children,
}: {
  children: ReactNode;
  title: string;
  name: string;
  isOpen: boolean;
}) {
  return (
    <AccordionItem value={name}>
      <AccordionTrigger asChild>
        <div className={clsx('flex justify-between px-4 bg-slate-50/80', isOpen && 'border-b')}>
          {title}
          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
        </div>
      </AccordionTrigger>
      <AccordionContent>{children}</AccordionContent>
    </AccordionItem>
  );
}

export function AccordionResumeBuilder() {
  const [tabs, setTabs] = useState<Record<string, boolean>>({});

  return (
    <Accordion
      type="multiple"
      className="w-full"
      onValueChange={items =>
        setTabs(
          items.reduce(
            (acc, item) => {
              acc[item] = true;
              return acc;
            },
            {} as Record<string, boolean>,
          ),
        )
      }
    >
      <AccordionElement title="Contact Information" name="item-1" isOpen={tabs['item-1']}>
        <ContactInfoSection />
      </AccordionElement>

      <AccordionElement title="Titles" name="item-2" isOpen={tabs['item-2']}>
        <TitlesSection />
      </AccordionElement>

      <AccordionElement title="Professional Summeries" name="item-3" isOpen={tabs['item-3']}>
        <SummariesSection />
      </AccordionElement>

      <AccordionElement title="Experiences" name="item-4" isOpen={tabs['item-4']}>
        <ExperiencesSection />
      </AccordionElement>

      <AccordionElement title="Educations" name="item-5" isOpen={tabs['item-5']}>
        <EducationsSection />
      </AccordionElement>

      <AccordionElement title="Projects" name="item-6" isOpen={tabs['item-6']}>
        <ProjectsSection />
      </AccordionElement>

      <AccordionElement title="Skills" name="item-7" isOpen={tabs['item-7']}>
        <SkillsSection />
      </AccordionElement>
    </Accordion>
  );
}
