"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { FormInput } from "@/components/shared/form-input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  createJob,
  extractJobDescriptionFromUrl,
  updateJob,
} from "@/actions/job";
import { jobSchema } from "@/schemas";
import { LoadingButton } from "../ui/loading-button";
import { JoeditInput } from "../shared/joedit-input";

type JobFormValues = z.infer<typeof jobSchema>;

interface JobFormProps {
  initialData?: JobFormValues & { id?: string };
}

export const JobForm = ({ initialData }: JobFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isExtractingJD, startExtractingJDTransition] = useTransition();

  const isEditing = !!initialData?.id;

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    mode: "onChange",
    defaultValues: {
      title: initialData?.title || "",
      companyName: initialData?.companyName || "",
      description: initialData?.description || "",
      location: initialData?.location || "",
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
          if (data.error) {
            return toast.error(data.error?.message || "Something went wrong!");
          }

          toast.success(
            isEditing
              ? "Job updated successfully!"
              : "Job created successfully!"
          );
          return router.push("/jobs");
        })
        .catch((error) => toast.error("Something went wrong."));
    });
  });

  const handleExtractJD = () => {
    startExtractingJDTransition(async () => {
      try {
        const data = await extractJobDescriptionFromUrl(
          form.getValues().url || ""
        );
        data?.description && form.setValue("description", data?.description);
        data?.companyName && form.setValue("companyName", data?.companyName);
        data?.location && form.setValue("location", data?.location);
        data?.title && form.setValue("title", data?.title);
        data?.postedDate && form.setValue("postedAt", data?.postedDate);
      } catch (error: unknown) {
        toast.error(error?.toString() || "Something went wrong.");
      }
    });
  };

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-4">
        {isEditing ? "Edit Job" : "Add New Job"}
      </h1>
      <p className="text-muted-foreground mb-6">
        Please fill out the form below with the job details.
      </p>

      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Input Fields */}
            <div className="space-y-4">
              <div className="flex items-end gap-2">
                <FormInput
                  className="flex-grow"
                  control={form.control}
                  name="url"
                  label="Job URL"
                  placeholder="https://example.com/job-posting"
                  isPending={isPending || isExtractingJD}
                />
                <LoadingButton
                  className="flex-shrink-0 cursor-pointer"
                  loading={isExtractingJD}
                  loadingText="Extracting ..."
                  onClick={(e) => {
                    e.preventDefault();
                    handleExtractJD();
                  }}
                >
                  Extract From Link
                </LoadingButton>
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

              <FormInput
                control={form.control}
                name="location"
                label="Location"
                placeholder="e.g. Remote, USA"
                isPending={isPending}
              />

              <FormInput
                control={form.control}
                name="postedAt"
                label="Posted Date"
                type="text"
                isPending={isPending}
              />
              {/* Submit Button */}
              <LoadingButton
                variant={"default"}
                type="submit"
                loading={isPending}
                loadingText={
                  isEditing ? "Updating Job ..." : "Creating Job ..."
                }
              >
                {isEditing ? "Update Job" : "Create Job"}
              </LoadingButton>
            </div>

            {/* Right Column: Job Description */}
            <div className="space-y-4">
              <JoeditInput
                control={form.control}
                name="description"
                label="Job Description"
                placeholder="Describe the job role, responsibilities, and requirements..."
                isPending={isPending}
                config={{ height: "400px" }}
              />
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};
