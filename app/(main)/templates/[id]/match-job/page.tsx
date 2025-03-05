 
import { db } from "@/lib/db"; 
import { Metadata } from "next";
import Link from "next/link";  
import { Button } from "@/components/ui/button"; 
import { Textarea } from "@/components/ui/textarea";
import { TemplateContent } from "@/types/resume";
import { JobMatcher } from "./JobMatcher";

export const metadata: Metadata = {
  title: "Job Matcher",
};

export default async function TemplateBuilderPage({
  params,
}: {
  params: { id: string };
}) {
  const template = await db.resumeTemplate.findUnique({
    where: { id: params.id },
  });

  if (!template) return null;
  const content = template?.content as TemplateContent;
 
  return (
    <div> 
      <JobMatcher templateContent={content} ></JobMatcher>
    </div>
  );
}
