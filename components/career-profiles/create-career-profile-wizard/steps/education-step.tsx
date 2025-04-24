'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash } from 'lucide-react';
import { YearMonthPicker } from '@/components/ui/year-month-picker';

interface Education {
  id: string;
  degree: string;
  major: string;
  school: string;
  location: string;
  startDate: string;
  endDate: string;
}

interface EducationStepProps {
  onSaveEducations: (educations: Education[]) => void;
  initialEducations?: Education[];
}

export function EducationStep({ onSaveEducations, initialEducations = [] }: EducationStepProps) {
  const [educations, setEducations] = useState<Education[]>(
    initialEducations.length > 0
      ? initialEducations
      : [
          {
            id: '1',
            degree: '',
            major: '',
            school: '',
            location: '',
            startDate: '',
            endDate: '',
          },
        ],
  );
  const [hasChanged, setHasChanged] = useState(false);

  // Auto-save when educations change, but only if they've been modified or we have initial data
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSaveEducations(educations);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [educations, onSaveEducations]);

  const addEducation = () => {
    setEducations([
      ...educations,
      {
        id: Date.now().toString(),
        degree: '',
        major: '',
        school: '',
        location: '',
        startDate: '',
        endDate: '',
      },
    ]);
    setHasChanged(true);
  };

  const removeEducation = (id: string) => {
    setEducations(educations.filter(edu => edu.id !== id));
    setHasChanged(true);
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducations(educations.map(edu => (edu.id === id ? { ...edu, [field]: value } : edu)));
    setHasChanged(true);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-bold">Educations</h3>
        <p className="text-sm text-gray-500">
          Add your educational background, starting with the most recent.
        </p>
      </div>

      <div className="space-y-8">
        {educations.map((education, index) => (
          <div key={education.id} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Education {index + 1}</h4>
              {educations.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEducation(education.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`degree-${education.id}`}>Degree</Label>
                <Input
                  id={`degree-${education.id}`}
                  value={education.degree}
                  onChange={e => updateEducation(education.id, 'degree', e.target.value)}
                  placeholder="e.g. Bachelor of Science"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`major-${education.id}`}>Major / Field of Study</Label>
                <Input
                  id={`major-${education.id}`}
                  value={education.major}
                  onChange={e => updateEducation(education.id, 'major', e.target.value)}
                  placeholder="e.g. Computer Science"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`school-${education.id}`}>School / University</Label>
                <Input
                  id={`school-${education.id}`}
                  value={education.school}
                  onChange={e => updateEducation(education.id, 'school', e.target.value)}
                  placeholder="e.g. University of California"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`location-${education.id}`}>Location</Label>
                <Input
                  id={`location-${education.id}`}
                  value={education.location}
                  onChange={e => updateEducation(education.id, 'location', e.target.value)}
                  placeholder="e.g. Berkeley, CA"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`start-date-${education.id}`}>Start Date</Label>

                <YearMonthPicker
                  date={education.startDate}
                  setDate={date => updateEducation(education.id, 'startDate', date || '')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`end-date-${education.id}`}>End Date</Label>

                <YearMonthPicker
                  date={education.endDate}
                  setDate={date => updateEducation(education.id, 'endDate', date || '')}
                />
              </div>
            </div>
          </div>
        ))}

        <Button type="button" variant="outline" onClick={addEducation} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Another Education
        </Button>
      </div>
    </div>
  );
}
