'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';

// Sample skills by job title
const skillsByTitle: Record<string, string[]> = {
  'Senior Backend Developer': [
    'Node.js',
    'Python',
    'Java',
    'C#',
    'Go',
    'Ruby',
    'PHP',
    'SQL',
    'NoSQL',
    'MongoDB',
    'PostgreSQL',
    'MySQL',
    'Redis',
    'Docker',
    'Kubernetes',
    'AWS',
    'Azure',
    'GCP',
    'REST API',
    'GraphQL',
    'Microservices',
    'CI/CD',
    'Git',
    'Testing',
    'Performance Optimization',
  ],
  'Senior Frontend Developer': [
    'JavaScript',
    'TypeScript',
    'React',
    'Vue.js',
    'Angular',
    'Svelte',
    'HTML5',
    'CSS3',
    'SASS/SCSS',
    'Tailwind CSS',
    'Bootstrap',
    'Material UI',
    'Webpack',
    'Vite',
    'Jest',
    'Testing Library',
    'Cypress',
    'Redux',
    'Responsive Design',
    'Web Performance',
    'Accessibility',
    'SEO',
  ],
  'Senior Full Stack Developer': [
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'Express',
    'Next.js',
    'SQL',
    'NoSQL',
    'MongoDB',
    'PostgreSQL',
    'REST API',
    'GraphQL',
    'Docker',
    'AWS',
    'Git',
    'CI/CD',
    'Testing',
    'Microservices',
    'HTML5',
    'CSS3',
    'Tailwind CSS',
    'Redux',
    'Authentication',
  ],
  'Senior UI/UX Designer': [
    'Figma',
    'Adobe XD',
    'Sketch',
    'InVision',
    'Prototyping',
    'Wireframing',
    'User Research',
    'Usability Testing',
    'Information Architecture',
    'Interaction Design',
    'Visual Design',
    'Design Systems',
    'Accessibility',
    'User-Centered Design',
    'Responsive Design',
    'Mobile Design',
    'Web Design',
  ],
  'Product Manager': [
    'Product Strategy',
    'Roadmapping',
    'User Stories',
    'Agile',
    'Scrum',
    'Market Research',
    'Competitive Analysis',
    'User Research',
    'A/B Testing',
    'Data Analysis',
    'Stakeholder Management',
    'Prioritization',
    'JIRA',
    'Product Discovery',
    'Product Launch',
    'KPIs',
    'OKRs',
  ],
  'Data Scientist': [
    'Python',
    'R',
    'SQL',
    'Machine Learning',
    'Deep Learning',
    'TensorFlow',
    'PyTorch',
    'Pandas',
    'NumPy',
    'Scikit-learn',
    'Data Visualization',
    'Statistical Analysis',
    'A/B Testing',
    'Big Data',
    'Data Mining',
    'Natural Language Processing',
    'Computer Vision',
    'Feature Engineering',
  ],
  'DevOps Engineer': [
    'Docker',
    'Kubernetes',
    'AWS',
    'Azure',
    'GCP',
    'Terraform',
    'Ansible',
    'Jenkins',
    'GitHub Actions',
    'CircleCI',
    'CI/CD',
    'Infrastructure as Code',
    'Monitoring',
    'Logging',
    'Linux',
    'Bash',
    'Python',
    'Networking',
    'Security',
    'Troubleshooting',
    'Performance Optimization',
  ],
};

// Default skills for any title not in the list
const defaultSkills = [
  'Communication',
  'Problem Solving',
  'Teamwork',
  'Time Management',
  'Critical Thinking',
  'Adaptability',
  'Leadership',
  'Project Management',
  'Attention to Detail',
  'Creativity',
  'Analytical Skills',
];

interface SkillsStepProps {
  selectedTitle: string;
  onSelectSkills: (skills: string[]) => void;
  initialSkills?: string[];
}

export function SkillsStep({ selectedTitle, onSelectSkills, initialSkills = [] }: SkillsStepProps) {
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [inputValue, setInputValue] = useState('');
  const [hasEnoughSkills, setHasEnoughSkills] = useState(skills.length >= 5);
  const [shouldSave, setShouldSave] = useState(skills.length >= 5);

  // Get suggested skills based on the selected title
  const suggestedSkills = selectedTitle
    ? skillsByTitle[selectedTitle] || defaultSkills
    : defaultSkills;

  // Check if we have enough skills
  useEffect(() => {
    setHasEnoughSkills(skills.length >= 5);
  }, [skills]);

  // Only save when we have enough skills and the user has triggered a save
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSelectSkills(skills);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [skills, onSelectSkills]);

  const addSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      const newSkills = [...skills, skill];
      setSkills(newSkills);
      setInputValue('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const toggleSuggestedSkill = (skill: string) => {
    if (skills.includes(skill)) {
      removeSkill(skill);
    } else {
      addSkill(skill);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      addSkill(inputValue);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-bold">What are your key skills?</h3>
        <p className="text-sm text-gray-500">
          Add at least 5 strong skills that are relevant to your target position.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a skill and press Enter"
            className="flex-1"
          />
          <Button
            type="button"
            onClick={() => addSkill(inputValue)}
            disabled={!inputValue}
            size="icon"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 min-h-[60px]">
          {skills.map(skill => (
            <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm">
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {skills.length === 0 && (
            <p className="text-sm text-gray-400 italic">No skills added yet</p>
          )}
        </div>

        <div className="space-y-2 pt-4 border-t">
          <p className="text-sm font-medium">
            Suggested skills based on {selectedTitle || 'your profile'}:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedSkills.map(skill => (
              <Badge
                key={skill}
                variant={skills.includes(skill) ? 'default' : 'outline'}
                className="px-3 py-1 text-sm cursor-pointer"
                onClick={() => toggleSuggestedSkill(skill)}
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <p className={`text-sm ${skills.length < 5 ? 'text-red-500' : 'text-green-500'}`}>
            {skills.length < 5
              ? `Please select at least ${5 - skills.length} more skill${5 - skills.length === 1 ? '' : 's'}`
              : "Great! You've selected enough skills."}
          </p>
        </div>
      </div>
    </div>
  );
}
