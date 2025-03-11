"use client";

import { analyzeJobByAI } from "@/actions/job";
import { Job } from "@prisma/client";
import React, { useTransition } from "react";
import { toast } from "sonner";
import moment from "moment";
import { LoadingButton } from "../ui/loading-button";
import { Briefcase, LucideExternalLink } from "lucide-react";

export const JobDescriptionPreview = ({
  job,
  onJobUpdated,
}: {
  job: Job;
  onJobUpdated?: (j: Job) => void;
}) => {
  const [isAnalyzingJob, startJobAnalyzeTransition] = useTransition();
  const handleAnalyzeJob = async () => {
    startJobAnalyzeTransition(async () => {
      try {
        const result = await analyzeJobByAI(job.id);

        toast.success("Job analyzed successfully.");
        onJobUpdated?.({
          ...job,
          analyzeResults: result,
        });
      } catch (error) {
        toast.error("Failed to analyze job.");
      }
    });
  };
  return (
    <div className="md:col-span-2 bg-white rounded-lg  ">
      <div className="space-y-4">
        <div className="flex justify-between">
          <div>
            <h3 className="text-2xl font-bold">{job.title}</h3> 
            <p className="text-sm text-muted-foreground">
              {job.companyName} - {job.location} - Posted at{" "}
              {job.postedAt && <>{moment(job.postedAt).format("YYYY/MM/DD")} ({moment(job.postedAt).fromNow()})</> }
            </p>
            {job.url && (
              <a href={job.url} className="flex items-center text-sm gap-1 text-muted-foreground mt-1" target="_blank">
                 Job post Link
                 <LucideExternalLink size={14} />
              </a>
            )}
          </div>
          <LoadingButton
            variant={"outline"}
            onClick={handleAnalyzeJob}
            loading={isAnalyzingJob}
            loadingText="Thinking ..."
          >
            <Briefcase size={16} />
            Analyze Job
          </LoadingButton>
        </div>
        <h3 className="text-xl font-bold">Job Description</h3>
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: job.description || "" }}
        ></div>
      </div>
    </div>
  );
};
