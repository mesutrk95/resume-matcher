"use client";

import { CardWrapper } from "@/components/shared/card-wrapper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { FormInput } from "@/components/shared/form-input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createJob, updateJob } from "@/actions/job";
import { FormTextarea } from "../shared/form-text-area";
import { jobSchema } from "@/schemas";
import { extractJobDetailsFromUrl } from "@/api/job-matcher";

type JobFormValues = z.infer<typeof jobSchema>;

interface JobFormProps {
  initialData?: JobFormValues & { id?: string };
}

export const JobForm = ({ initialData }: JobFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEditing = !!initialData?.id;

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    mode: "onChange",
    defaultValues: {
      title: initialData?.title || "",
      companyName: initialData?.companyName || "",
      description: initialData?.description || "",
      url: initialData?.url || "",
      postedAt: initialData?.postedAt || null,
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    startTransition(() => {
      const action = isEditing
        ? updateJob({ ...values, id: initialData!.id! })
        : createJob({ ...values });

      action
        .then((data) => {
          if (!data) return;
          if (!data.success) {
            return toast.error(data.error?.message || "Problem in job action");
          }

          toast.success(
            isEditing
              ? "Job updated successfully!"
              : "Job created successfully!"
          );
          return router.push("/jobs");
        })
        .catch(() => toast.error("Something went wrong."));
    });
  });

  const handleExtractJD = async () => {
    const url = form.getValues().url;
    if (!url) return;
    const content = await extractJobDetailsFromUrl(url);
    console.log(content);
  };

  return (
    <CardWrapper
      className="w-[600px] shadow mx-4 md:mx-0"
      headerTitle={isEditing ? "Edit Job" : "Add New Job"}
      headerDescription="Please fill out the form below with the job details."
      backButtonLabel="Back to jobs"
      backButtonHref="/jobs"
    >
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="w-full flex items-end gap-2">
              <FormInput
                className="flex-grow"
                control={form.control}
                name="url"
                label="Job URL"
                placeholder="https://example.com/job-posting"
                isPending={isPending}
              />
              <Button
                className="flex-shrink-0"
                onClick={(e) => {
                  e.preventDefault();  
                  handleExtractJD();
                }}
              >
                Extract From Link
              </Button>
            </div>

            <FormInput
              control={form.control}
              name="title"
              label="Job Title"
              placeholder="e.g. Frontend Developer"
              isPending={isPending}
            />

            <FormInput
              control={form.control}
              name="companyName"
              label="Company Name"
              placeholder="e.g. Acme Inc."
              isPending={isPending}
            />

            <FormTextarea
              control={form.control}
              name="description"
              label="Job Description"
              placeholder="Describe the job role, responsibilities, and requirements..."
              isPending={isPending}
            />

            <FormInput
              control={form.control}
              name="postedAt"
              label="Posted Date"
              type="date"
              isPending={isPending}
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isEditing ? "Update Job" : "Create Job"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
