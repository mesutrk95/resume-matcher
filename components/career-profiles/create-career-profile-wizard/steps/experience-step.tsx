'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface Experience {
  id: string;
  jobTitle: string;
  companyName: string;
  location: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
  tools: string[];
}

interface ExperienceStepProps {
  onSaveExperiences: (experiences: Experience[]) => void;
  initialExperiences?: Experience[];
}

export function ExperienceStep({
  onSaveExperiences,
  initialExperiences = [],
}: ExperienceStepProps) {
  const [experiences, setExperiences] = useState<Experience[]>(
    initialExperiences.length > 0
      ? initialExperiences
      : [
          {
            id: '1',
            jobTitle: '',
            companyName: '',
            location: '',
            startDate: '',
            endDate: '',
            currentlyWorking: false,
            description: '',
            tools: [],
          },
        ],
  );
  const [currentTool, setCurrentTool] = useState('');
  const [hasChanged, setHasChanged] = useState(false);

  // Auto-save when experiences change, but only if they've been modified or we have initial data
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSaveExperiences(experiences);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [experiences, onSaveExperiences]);

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        id: Date.now().toString(),
        jobTitle: '',
        companyName: '',
        location: '',
        startDate: '',
        endDate: '',
        currentlyWorking: false,
        description: '',
        tools: [],
      },
    ]);
    setHasChanged(true);
  };

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
    setHasChanged(true);
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    setExperiences(experiences.map(exp => (exp.id === id ? { ...exp, [field]: value } : exp)));
    setHasChanged(true);
  };

  const addTool = (id: string) => {
    if (currentTool && !experiences.find(exp => exp.id === id)?.tools.includes(currentTool)) {
      updateExperience(id, 'tools', [
        ...(experiences.find(exp => exp.id === id)?.tools || []),
        currentTool,
      ]);
      setCurrentTool('');
    }
  };

  const removeTool = (id: string, tool: string) => {
    updateExperience(
      id,
      'tools',
      experiences.find(exp => exp.id === id)?.tools.filter(t => t !== tool) || [],
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-bold">Work Experiences</h3>
        <p className="text-sm text-gray-500">
          Add your work experience, starting with the most recent position.
        </p>
      </div>

      <div className="space-y-8">
        {experiences.map((experience, index) => (
          <div key={experience.id} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Position {index + 1}</h4>
              {experiences.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExperience(experience.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`job-title-${experience.id}`}>Job Title</Label>
                <Input
                  id={`job-title-${experience.id}`}
                  value={experience.jobTitle}
                  onChange={e => updateExperience(experience.id, 'jobTitle', e.target.value)}
                  placeholder="e.g. Software Engineer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`company-name-${experience.id}`}>Company Name</Label>
                <Input
                  id={`company-name-${experience.id}`}
                  value={experience.companyName}
                  onChange={e => updateExperience(experience.id, 'companyName', e.target.value)}
                  placeholder="e.g. Acme Inc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`location-${experience.id}`}>Location</Label>
                <Input
                  id={`location-${experience.id}`}
                  value={experience.location}
                  onChange={e => updateExperience(experience.id, 'location', e.target.value)}
                  placeholder="e.g. New York, NY"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`start-date-${experience.id}`}>Start Date</Label>
                <Input
                  id={`start-date-${experience.id}`}
                  type="month"
                  value={experience.startDate}
                  onChange={e => updateExperience(experience.id, 'startDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id={`currently-working-${experience.id}`}
                    checked={experience.currentlyWorking}
                    onCheckedChange={checked => {
                      updateExperience(experience.id, 'currentlyWorking', checked);
                      if (checked) {
                        updateExperience(experience.id, 'endDate', '');
                      }
                    }}
                  />
                  <label
                    htmlFor={`currently-working-${experience.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Currently working here
                  </label>
                </div>
                {!experience.currentlyWorking && (
                  <>
                    <Label htmlFor={`end-date-${experience.id}`}>End Date</Label>
                    <Input
                      id={`end-date-${experience.id}`}
                      type="month"
                      value={experience.endDate}
                      onChange={e => updateExperience(experience.id, 'endDate', e.target.value)}
                    />
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`description-${experience.id}`}>Description / Responsibilities</Label>
              <Textarea
                id={`description-${experience.id}`}
                value={experience.description}
                onChange={e => updateExperience(experience.id, 'description', e.target.value)}
                placeholder="Describe your responsibilities and achievements..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Tools/Technologies Used (Optional)</Label>
              <div className="flex space-x-2">
                <Input
                  value={currentTool}
                  onChange={e => setCurrentTool(e.target.value)}
                  placeholder="e.g. React, Python, AWS"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && currentTool) {
                      e.preventDefault();
                      addTool(experience.id);
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => addTool(experience.id)}
                  disabled={!currentTool}
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {experience.tools.map(tool => (
                  <Badge key={tool} variant="secondary" className="px-3 py-1 text-sm">
                    {tool}
                    <button
                      type="button"
                      onClick={() => removeTool(experience.id, tool)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {experience.tools.length === 0 && (
                  <p className="text-sm text-gray-400 italic">No tools/technologies added</p>
                )}
              </div>
            </div>
          </div>
        ))}

        <Button type="button" variant="outline" onClick={addExperience} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Another Position
        </Button>
      </div>
    </div>
  );
}
