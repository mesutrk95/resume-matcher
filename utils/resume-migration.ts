// utils/skills-migration.ts
import { randomNDigits } from '@/lib/utils';
import { ResumeContent, ResumeSkillSet, ResumeSkillItem } from '@/types/resume';

/**
 * Migrates the old resume skills format to the new category-based format
 *
 * Old format: Array<{ id: string, content: string, category: string, enabled: boolean }>
 * New format: Array<{ category: string, enabled: boolean, skills: Array<{ id: string, content: string, enabled: boolean }> }>
 */
export function migrateSkills(resumeContent: ResumeContent): ResumeContent {
  // Check if skills is already in the new format
  if (resumeContent.skills.length > 0 && 'skills' in resumeContent.skills[0]) {
    // Already migrated
    return resumeContent;
  }

  // Convert old format to new format
  const categoriesMap = new Map<string, ResumeSkillItem[]>();

  // @ts-ignore - Handling old format
  (
    resumeContent.skills as unknown as {
      id: string;
      content: string;
      category: string;
      enabled: boolean;
    }[]
  ).forEach((oldSkill: { id: string; content: string; category: string; enabled: boolean }) => {
    const skillItem: ResumeSkillItem = {
      id: oldSkill.id,
      content: oldSkill.content,
      enabled: oldSkill.enabled,
    };

    if (!categoriesMap.has(oldSkill.category)) {
      categoriesMap.set(oldSkill.category, []);
    }

    categoriesMap.get(oldSkill.category)?.push(skillItem);
  });

  // Convert the map to array of skill sets
  const newSkills: ResumeSkillSet[] = Array.from(categoriesMap.entries()).map(
    ([category, skills]) => ({
      category,
      enabled: skills.some(skill => skill.enabled), // Category is enabled if any skill is enabled
      skills,
    }),
  );

  // Default category if no categories exist
  if (newSkills.length === 0) {
    newSkills.push({
      category: 'Default',
      enabled: true,
      skills: [],
    });
  }

  return {
    ...resumeContent,
    skills: newSkills,
  };
}

function getIdPrefixV1(path?: string) {
  switch (path) {
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

export function shuffleResumeIds(data: any, keyName?: string): any {
  if (Array.isArray(data)) {
    return data.map(item => shuffleResumeIds(item, keyName));
  } else if (typeof data === 'object' && data !== null) {
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        if (key === 'id' && typeof data[key] === 'string') {
          let prefix = getIdPrefixV1(keyName);
          data[key] = `${prefix}${randomNDigits()}`;
        } else {
          data[key] = shuffleResumeIds(data[key], (keyName ? keyName + '.' : '') + key);
        }
      }
    }
    return data;
  }

  return data;
}

export function migrateResumeContent(resume: ResumeContent): ResumeContent {
  function migrateV1(data: ResumeContent): any {
    if (typeof data.version !== 'undefined' && data.version > 1) return data;
    console.info(`migrating resume to v2 ...`);

    return { ...shuffleResumeIds(data), version: 2 };
  }

  function migrateV2(data: ResumeContent): any {
    if (typeof data.version !== 'undefined' && data.version > 2) return data;
    console.info(`migrating resume to v3 ...`);

    return { ...migrateSkills(data), version: 3 };
  }

  let updatedResume = resume;
  const migrations = [migrateV1, migrateV2];
  for (const migration of migrations) {
    updatedResume = migration(updatedResume);
  }

  return updatedResume;
}
