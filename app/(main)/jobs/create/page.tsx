import { JobForm } from "@/components/form/job-form";
import { LoginForm } from "@/components/form/login-form";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Create New Job",
};

export default async function CreateJobPage( ) { 
  return <JobForm />;
}
