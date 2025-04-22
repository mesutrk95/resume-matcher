import { currentUser } from "@/lib/auth";
import {
  ResumeWizard,
  ResumeWizardBody,
  ResumeWizardFooter,
  ResumeWizardHeader,
} from "@/components/resume-templates/create-career-profile-wizard";
import { ResumeHighlighter } from "./resume-highlighter";

interface CreateResumePageProps {
  params: {
    id: string;
  };
}

export default async function ResumeWizardPage({
  params,
}: CreateResumePageProps) {
  const user = await currentUser();

  const keys = ["experiences", "skills", "projects"];
  return (
    <div className="">
      <div className="grid grid-cols-12">
        <div className="col-span-9">
          <ResumeWizard className="bg-white border-e border-s h-screen rounded-none flex flex-col">
            <ResumeWizardHeader className="" />
            {/* <ScrollArea className="me-2" type="always"> */}
            <ResumeWizardBody className="flex-grow overflow-auto" />
            <ResumeWizardFooter className="" />
          </ResumeWizard>
        </div>
        <div className="col-span-3 bg-gray-50 h-screen overflow-hidden">
          <div className="overflow-auto">
            {/* <ResumeHighlighter activeKey="experiences" /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
