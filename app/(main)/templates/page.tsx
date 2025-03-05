"use client";

import { db } from "@/lib/db";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ResumeTemplateItem } from "./template-resume-item";
import { useQuery } from "@tanstack/react-query";
import { getTemplates } from "@/api/templates";
import { ContentLoading } from "@/app/_components/loading";

// export const metadata: Metadata = {
//   title: "Templates",
// };

export default function TemplatesPage() {
  // const templates = await db.resumeTemplate.findMany();

  const { data: templates, isFetching } = useQuery({
    queryKey: ["/templates"],
    queryFn: getTemplates,
  });

  return (
    <div>
      <div className="mb-4">
        <Button asChild>
          <Link href="/templates/create">Create New</Link>
        </Button>
      </div>
      <ContentLoading loading={isFetching}>
        <div className="grid grid-cols-2 gap-2">
          {templates?.data.map((template) => (
            <ResumeTemplateItem key={template.id} template={template} />
          ))}
        </div>
      </ContentLoading>
    </div>
  );
}
