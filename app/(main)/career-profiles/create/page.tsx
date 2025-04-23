import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { CareerProfileGallery } from '@/components/career-profiles/career-profile-gallery';
import { CreateCareerProfileOptions } from './create-career-profile-options';

export default async function CreateCareerProfile() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Create Career Profile</h2>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/career-profiles">Career Profiles</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Create New</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {/* <p className="text-muted-foreground mt-4">
          With resume templates, you only need to build your resume once. Easily
          clone and customize it for each job application, ensuring every
          submission is tailored and professional. Save time and stay organized
          with a dedicated resume for every opportunity.
        </p> */}
      </div>

      <CreateCareerProfileOptions />
      <CareerProfileGallery />
    </div>
  );
}
