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
 
  return (
    <div className="md:col-span-2 bg-white rounded-lg  ">
      <div className="space-y-4"> 
        <h3 className="text-xl font-bold">Job Description</h3>
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: job.description || "" }}
        ></div>
      </div>
    </div>
  );
};
