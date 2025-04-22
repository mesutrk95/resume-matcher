"use client";

import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WizardResumeContent } from "../resume-wizard-context";

interface CompletionStepProps {
  resumeData: WizardResumeContent;
}

export function CompletionStep({ resumeData }: CompletionStepProps) {
  const handleDownload = () => {
    // Create a blob with the JSON data
    const blob = new Blob([JSON.stringify(resumeData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    // Create a link and trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume-data.json";
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
      <div className="rounded-full bg-green-100 p-3">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-bold">All Set!</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          You've successfully completed all the steps to create your resume.
          Your information has been automatically saved.
        </p>
      </div>
      <div className="space-y-4 w-full max-w-md">
        <Button onClick={handleDownload} className="w-full">
          Download Resume Data
        </Button>
      </div>
      {/* <div className="space-y-4 w-full max-w-md">
        <Button onClick={handleDownload} className="w-full">
          Download Resume Data
        </Button>

        <div className="text-sm text-gray-500">
          <p>
            Your data has been saved to your browser's local storage. You can return to this wizard anytime to continue
            editing.
          </p>
        </div>
      </div> */}
    </div>
  );
}
