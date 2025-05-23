import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { db } from '@/lib/db';
import { Metadata } from 'next';
import { CareerProfilePage } from './career-profile-page';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Career Profile Builder',
};

export default async function CareerProfileBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const paramsResult = await params;

  const careerProfile = await db.careerProfile.findUnique({
    where: { id: paramsResult.id },
  });

  if (!careerProfile) return notFound();

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">Edit Career Profile</h2>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/career-profiles">Career Profiles</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{careerProfile.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <CareerProfilePage careerProfile={careerProfile} />
    </>
  );
}
