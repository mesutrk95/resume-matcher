'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash } from 'lucide-react';

interface Certification {
  id: string;
  name: string;
  organization: string;
  date: string;
  credentialId: string;
}

interface CertificationsStepProps {
  onSaveCertifications: (certifications: Certification[]) => void;
  initialCertifications?: Certification[];
}

export function CertificationsStep({
  onSaveCertifications,
  initialCertifications = [],
}: CertificationsStepProps) {
  const [certifications, setCertifications] = useState<Certification[]>(
    initialCertifications.length > 0
      ? initialCertifications
      : [
          {
            id: '1',
            name: '',
            organization: '',
            date: '',
            credentialId: '',
          },
        ],
  );
  const [hasChanged, setHasChanged] = useState(false);

  // Auto-save when certifications change, but only if they've been modified or we have initial data
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSaveCertifications(certifications);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [certifications, onSaveCertifications]);

  const addCertification = () => {
    setCertifications([
      ...certifications,
      {
        id: Date.now().toString(),
        name: '',
        organization: '',
        date: '',
        credentialId: '',
      },
    ]);
    setHasChanged(true);
  };

  const removeCertification = (id: string) => {
    setCertifications(certifications.filter(cert => cert.id !== id));
    setHasChanged(true);
  };

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    setCertifications(
      certifications.map(cert => (cert.id === id ? { ...cert, [field]: value } : cert)),
    );
    setHasChanged(true);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-bold">Certifications</h3>
        <p className="text-sm text-gray-500">Add any relevant certifications you have earned.</p>
      </div>

      <div className="space-y-8">
        {certifications.map((certification, index) => (
          <div key={certification.id} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Certification {index + 1}</h4>
              {certifications.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCertification(certification.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`cert-name-${certification.id}`}>Certification Name</Label>
                <Input
                  id={`cert-name-${certification.id}`}
                  value={certification.name}
                  onChange={e => updateCertification(certification.id, 'name', e.target.value)}
                  placeholder="e.g. AWS Certified Solutions Architect"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`org-${certification.id}`}>Issuing Organization</Label>
                <Input
                  id={`org-${certification.id}`}
                  value={certification.organization}
                  onChange={e =>
                    updateCertification(certification.id, 'organization', e.target.value)
                  }
                  placeholder="e.g. Amazon Web Services"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`date-${certification.id}`}>Issue Date</Label>
                <Input
                  id={`date-${certification.id}`}
                  type="month"
                  value={certification.date}
                  onChange={e => updateCertification(certification.id, 'date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`credential-${certification.id}`}>Credential ID or URL</Label>
                <Input
                  id={`credential-${certification.id}`}
                  value={certification.credentialId}
                  onChange={e =>
                    updateCertification(certification.id, 'credentialId', e.target.value)
                  }
                  placeholder="e.g. ABC123 or https://credential.net/abc123"
                />
              </div>
            </div>
          </div>
        ))}

        <Button type="button" variant="outline" onClick={addCertification} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Another Certification
        </Button>
      </div>
    </div>
  );
}
