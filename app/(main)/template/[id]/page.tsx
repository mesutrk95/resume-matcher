import ResumeBuilder from "@/app/_components/resume-builder";
import { currentUser } from "@/lib/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume Template Builder",
};

export default async function TemplateBuilder() {
  return <ResumeBuilder />;
}
