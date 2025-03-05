import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { ResumeTemplate } from "@prisma/client";
import { Metadata } from "next";
import Link from "next/link";
// import Moment from 'react-moment';
import moment from "moment";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Templates",
};

function ResumeTemplateItem({ template }: { template: ResumeTemplate }) {
  return (
    <Link href={`/templates/${template.id}`}>
      <Card className="">
        <CardHeader className="flex  ">
          <CardTitle className="text-2xl">{template.name}</CardTitle>
          <p className="text-muted-foreground mt-1">{template.description}</p>
          <p className="text-muted-foreground text-sm">
            {moment(template.createdAt).format("YYYY/MM/DD HH:MM:SS")} {" "}
            ({moment(template.createdAt).fromNow()})
          </p>
        </CardHeader>
      </Card>
    </Link>
  );
}

export default async function TemplatesPage() {
  const templates = await db.resumeTemplate.findMany();

  return (
    <div>
      <div className="mb-4">
        <Button asChild>
          <Link href="/templates/create">Create New</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {templates.map((template) => (
          <ResumeTemplateItem key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}
