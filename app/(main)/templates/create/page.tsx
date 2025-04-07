import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CreateNewTemplateForm } from "@/components/resume-templates/create-new-template-button";
import { TemplateGallery } from "@/components/resume-templates/template-gallery";

interface CreateResumePageProps {
  params: {};
}

export default async function CreateResumeTemplate({
  params,
}: CreateResumePageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Create Resume Template</h2>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/templates">Templates</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Create New</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Card className="border-dashed border-2 ">
        <CardContent className="flex justify-between items-center p-6">
          <div className="">
            <h3 className="text-xl font-bold ">Start Fresh 🌿</h3>
            <p>
              Create a completely customized resume template without content
            </p>
          </div>
          <div>
            {/* <CreateResumeButton /> */}
            <CreateNewTemplateForm blank />
          </div>
        </CardContent>
      </Card>

      <TemplateGallery />
    </div>
  );
}
