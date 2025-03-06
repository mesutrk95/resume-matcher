"use client";

import { Job } from "@prisma/client";
import { format } from "date-fns";
import React from "react";

export const JobDescriptionPreview = ({ job }: { job: Job }) => {
  return (
    <div className="md:col-span-2 bg-white rounded-lg  ">
      <div className="space-y-4">
        <h3 className="text-2xl font-bold">{job.title}</h3>
        <p className="text-sm text-muted-foreground">
          {job.companyName} - {job.location} - Posted at{" "}
          {job.postedAt && format(job.postedAt || "", "yyyy/MM/dd")}
        </p>
        <h3 className="text-xl font-bold">Job Description</h3>
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: job.description || "" }}
        ></div>
      </div>
    </div>
  );
};
