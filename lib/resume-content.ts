import { ResumeContent } from '@/types/resume';
import { randomNDigits } from './utils';

export function findVariation(resume: ResumeContent, varId: string) {
  for (const exp of resume.experiences) {
    for (const expItem of exp.items) {
      for (const variation of expItem.variations) {
        if (variation.id === varId) return variation;
      }
    }
  }
}

export function generateId(
  key:
    | 'experiences'
    | 'experiences.items'
    | 'experiences.items.variations'
    | 'titles'
    | 'summaries'
    | 'educations'
    | 'skills'
    | 'skills.skills'
    | 'projects'
    | 'awards'
    | 'certifications'
    | 'languages'
    | 'interests'
    | 'references',
) {
  function getPrefix() {
    switch (key) {
      case 'experiences':
        return 'exp_';
      case 'experiences.items':
        return 'expitem_';
      case 'experiences.items.variations':
        return 'var_';
      case 'titles':
        return 'title_';
      case 'summaries':
        return 'summary_';
      case 'educations':
        return 'edu_';
      case 'skills':
        return 'skill_';
      case 'skills.skills':
        return 'skill_';
      case 'projects':
        return 'project_';
      case 'awards':
        return 'award_';
      case 'certifications':
        return 'cert_';
      case 'languages':
        return 'lang_';
      case 'interests':
        return 'interest_';
      case 'references':
        return 'ref_';
    }
  }

  return getPrefix() + randomNDigits();
}

export const resumeExperiencesToString = (
  resume: ResumeContent,
  withIdentifiers?: boolean,
  onlyEnabledItems?: boolean,
) => {
  let content = '';
  resume.experiences.forEach(exp => {
    if (onlyEnabledItems && !exp.enabled) return;
    const items = onlyEnabledItems ? exp.items.filter(i => i.enabled) : exp.items;
    items.forEach(item => {
      const variation = item.variations.find(v => v.enabled);
      if (variation?.content)
        content += `${(withIdentifiers && `[${variation.id}]`) || ''} ${variation.content}\n`;
    });
  });
  return content;
};
export const resumeSkillsToString = (resume: ResumeContent) => {
  return resume.skills
    .filter(e => e.enabled)
    .map(s => s.skills.filter(s => s.enabled))
    .flat()
    .join(', ')
    .replace(/\u200B/g, '');
};

export const convertResumeObjectToString = (
  resume: ResumeContent,
  withIdentifiers?: boolean,
  _onlyEnabledItems?: boolean,
) => {
  let content = '';

  const title = resume.titles.find(t => t.enabled)?.content;
  if (title) {
    content += title + '\n';
  }

  const summary = resume.summaries.find(t => t.enabled)?.content;
  if (summary) {
    content += summary + '\n';
  }

  content += `Experiences:\n`;
  content += resumeExperiencesToString(resume, withIdentifiers, true);

  content += `Projects:\n`;
  resume.projects.forEach(prj => {
    if (!prj.enabled) return;
    content += `${prj?.content}\n`;
  });

  content += `Educations:\n`;
  const edu = resume.educations.find(e => e.enabled);
  if (edu) {
    content += `Education\n${edu.degree} • ${edu.institution} • ${edu.content} \n`;
  }
  content += 'Skills: ' + resumeSkillsToString(resume) + '\n';
  return content;
};
