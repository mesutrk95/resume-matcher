"use client";

import { LoadingButton } from "@/components/ui/loading-button";
import { constructFinalResume } from "@/app/utils/job-matching";
import { ResumeContent } from "@/types/resume";
import React, { useEffect, useMemo, useState, useTransition } from "react";
import { ResumeBuilder } from "@/components/job-resumes/resume-builder";
import { Job, JobResume } from "@prisma/client";
import { JobDescriptionPreview } from "@/components/jobs/job-description-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { analyzeJobByAI, analyzeJobScores } from "@/actions/job";
import { JobAnalyzeResult, JobKeyword, JobKeywordType } from "@/types/job";
import { useParams } from "next/navigation";
import { ResumeScore } from "@/components/job-resumes/resume-builder/context/ResumeBuilderProvider";
import { updateJobResume } from "@/actions/job-resume";
import { format } from "date-fns";
import CVPreview from "@/components/job-resumes/resume-pdf-preview";
// import { useLayout } from "@/app/context/LayoutProvider";

// const ResumePreview = ({ resume }: { resume: ResumeContent }) => {
//   return (
//     <div className="px-5 ">
//       <div className="flex flex-col gap-4 p-10 border rounded">
//         <div>
//           <h1 className="text-xl font-bold">
//             {resume.contactInfo.firstName + "" + resume.contactInfo.lastName}
//           </h1>
//           <p className="text-xs">
//             {[
//               resume.contactInfo.country,
//               resume.contactInfo.email,
//               resume.contactInfo.phone,
//               resume.contactInfo.linkedIn,
//               resume.contactInfo.github,
//               resume.contactInfo.website,
//               resume.contactInfo.twitter,
//             ]
//               .filter((r) => !!r)
//               .join(" • ")}
//           </p>
//         </div>

//         <div className="">
//           <h3 className="text-lg font-bold">
//             {resume.titles.find((t) => t.enabled)?.content}
//           </h3>
//           <p className="text-xs">
//             {resume.summaries.find((s) => s.enabled)?.content}
//           </p>
//         </div>

//         <div>
//           <h5 className="text-green-500 font-bold">Work Experiences</h5>
//           <div className="flex flex-col gap-5">
//             {resume.experiences
//               .filter((e) => e.enabled)
//               .map((experience, index) => (
//                 <div key={index}>
//                   <h2 className="text-lg font-bold">
//                     {experience.companyName}
//                   </h2>
//                   <h3 className="text-md font-bold">{experience.role}</h3>
//                   <p className="text-sm">
//                     {experience.startDate} - {experience.endDate}
//                   </p>
//                   <ul className="list-disc ml-4">
//                     {experience.items
//                       .filter((e) => e.enabled)
//                       .map((item, index) => {
//                         return item.variations
//                           .filter((v) => v.enabled)
//                           .map((variation) => (
//                             <li
//                               className="text-sm"
//                               key={item.id + variation.id}
//                             >
//                               {variation.content}
//                             </li>
//                           ));
//                       })}
//                   </ul>
//                 </div>
//               ))}
//           </div>
//         </div>

//         <div>
//           <h5 className="text-green-500 font-bold">Projects</h5>
//           <div className="flex flex-col gap-5">
//             {resume.projects
//               .filter((p) => p.enabled)
//               .map((p, index) => (
//                 <div key={index}>
//                   <h2 className="text-lg font-bold">{p.name}</h2>
//                   <h3 className="text-sm font-bold">{p.link}</h3>
//                   <p className="text-sm text-muted-foreground">
//                     {format(p.startDate, "yyyy/MM")} -{" "}
//                     {format(p.endDate, "yyyy/MM")}
//                   </p>
//                   <p className="text-sm">{p.content}</p>
//                 </div>
//               ))}
//           </div>
//         </div>

//         <div>
//           <h5 className="text-green-500 font-bold">Educations</h5>
//           <div className="flex flex-col gap-5">
//             {resume.educations
//               .filter((e) => e.enabled)
//               .map((e, index) => (
//                 <div key={index}>
//                   <h2 className="text-lg font-bold">{e.institution}</h2>
//                   <h3 className="text-md font-bold">{e.degree}</h3>
//                   <p className="text-sm text-muted-foreground">
//                     {format(e.startDate, "yyyy/MM")} -{" "}
//                     {format(e.endDate, "yyyy/MM")}
//                   </p>
//                   <p className="text-sm">{e.content}</p>
//                 </div>
//               ))}
//           </div>
//         </div>

//         <div>
//           <h5 className="text-green-500 font-bold">Skills</h5>
//           <div className="flex flex-wrap gap-5 text-sm">
//             {resume.skills
//               .filter((s) => s.enabled)
//               .map((s) => s.content)
//               .join(", ")}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

const KeywordBadge = ({ keyword }: { keyword: JobKeyword }) => {
  return (
    <li className="py-1 text-sm" key={keyword.keyword}>
      {keyword.keyword}
      {/* <span className="rounded-xl px-2 py-1 bg-slate-200 text-xxs font-bold ml-1">
        {keyword.level}
      </span> */}
    </li>
  );
};

const JobTab = ({
  job,
  resume,
  onUpdateJob,
  onScoresUpdate,
}: {
  job: Job;
  resume: ResumeContent;
  onUpdateJob: (j: Job) => void;
  onScoresUpdate: (s: ResumeScore[]) => void;
}) => {
  const [isAnalyzingJob, startJobAnalyzeTransition] = useTransition();

  const jobKeywords = useMemo(() => {
    const results = job.analyzeResults as { keywords: JobKeyword[] };
    return results?.keywords?.reduce((acc, keyword) => {
      const ks = acc[keyword.skill] || [];
      ks.push(keyword);
      acc[keyword.skill] = ks;
      return acc;
    }, {} as Record<JobKeywordType, JobKeyword[]>);
  }, [job]);

  const handleAnalyzeJob = async () => {
    startJobAnalyzeTransition(async () => {
      try {
        const result = await analyzeJobByAI(job.id);

        toast.success("Job analyzed successfully.");
        onUpdateJob({
          ...job,
          analyzeResults: result,
        });
      } catch (error) {
        toast.error("Failed to analyze job.");
      }
    });
  };

  return (
    <Tabs defaultValue="jd" className=" ">
      <TabsList className="grid w-full grid-cols-4" variant={"outline"}>
        <TabsTrigger value="jd" variant={"outline"}>
          Job Description
        </TabsTrigger>
        <TabsTrigger value="keywords" variant={"outline"}>
          Keywords
        </TabsTrigger>
        <TabsTrigger value="summary" variant={"outline"}>
          Job Summary by AI
        </TabsTrigger>
      </TabsList>
      <TabsContent className="px-2 pt-4" value="jd">
        <LoadingButton
          onClick={handleAnalyzeJob}
          loading={isAnalyzingJob}
          loadingText="Thinking ..."
        >
          Analyze Job
        </LoadingButton>
        <JobDescriptionPreview job={job} />
      </TabsContent>
      <TabsContent className="px-2 pt-4" value="keywords">
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-1">
            <h4 className="font-bold">Hard Skills</h4>
            <ul className="  gap-2   ">
              {jobKeywords?.["hard"]
                ?.sort((k1, k2) => k2.level - k1.level)
                .map((keyword) => (
                  <KeywordBadge keyword={keyword} key={keyword.keyword} />
                ))}

              {/* {(jobKeywords?.["hard"]?.length || 0) > 15 && (
                      <li
                        onClick={() => {}}
                        className="py-1 text-sm text-primary"
                      >
                        Show + {(jobKeywords?.["hard"]?.length || 0) - 15} more
                      </li>
                    )} */}
            </ul>
          </div>
          <div className="flex flex-col gap-1">
            <h4 className="  font-bold">Soft Skills</h4>
            <ul className="  gap-2   ">
              {jobKeywords?.["soft"]
                ?.sort((k1, k2) => k2.level - k1.level)
                .map((keyword) => (
                  <KeywordBadge keyword={keyword} key={keyword.keyword} />
                ))}
            </ul>
          </div>
          <div className="flex flex-col gap-1">
            <h4 className="  font-bold">Other</h4>
            <ul className="  gap-2   ">
              {jobKeywords?.["none"]
                ?.sort((k1, k2) => k2.level - k1.level)
                .map((keyword) => (
                  <KeywordBadge keyword={keyword} key={keyword.keyword} />
                ))}
            </ul>
          </div>
        </div>
      </TabsContent>
      <TabsContent className="px-2 pt-4" value="summary">
        <div
          className="jd-preview text-sm"
          dangerouslySetInnerHTML={{
            __html: (job.analyzeResults as { summary: string })?.summary,
          }}
        ></div>
      </TabsContent>
    </Tabs>
  );
};

export const JobMatcher = ({
  jobResume,
  initialResume,
  initialJob,
}: {
  jobResume: JobResume;
  initialResume: ResumeContent;
  initialJob: Job;
}) => {
  const { id: jobResumeId } = useParams();
  const [resume, setResume] = useState<ResumeContent>(initialResume);
  const [scores, setScores] = useState<ResumeScore[]>();
  const [job, setJob] = useState<Job>(initialJob);

  const jobAnalyzeResults = job.analyzeResults as JobAnalyzeResult;

  const [isAnalyzingScores, startAnalyzeScoresTransition] = useTransition();
  const handleAnalyzeScores = async () => {
    startAnalyzeScoresTransition(async () => {
      try {
        const result = await Promise.all(
          resume.experiences.map((experience) => {
            const content = experience.items
              .map(
                (item, index) =>
                  `Experience Item ${index + 1}\n` +
                  item.variations
                    .map((v) => `${v.id} - ${v.content}`)
                    .join("\n")
              )
              .flat()
              .join("\n");
            return analyzeJobScores(jobResumeId as string, content);
          })
        );

        const scores = result.map((r) => r.result).flat() as ResumeScore[];
        setScores(scores);
        console.log(scores);
        toast.success("Analyze rate and scores are successfully done!");
      } catch (error) {
        toast.error("Failed to analyze scores.");
      }
    });
  };

  useEffect(() => {
    if (!jobAnalyzeResults?.keywords) return;
    const fr = constructFinalResume(initialResume, jobAnalyzeResults?.keywords);
    if (!fr) {
      toast.error("Keywords are not extracted, please first analyze keywords.");
      return;
    }
    setResume(fr);
  }, [jobAnalyzeResults?.keywords, initialResume]);

  return (
    <div>
      <div className="grid grid-cols-2 gap-5">
        <div>
          <Tabs defaultValue="builder" className=" ">
            <TabsList className="grid w-full grid-cols-3" variant={"outline"}>
              <TabsTrigger value="builder" variant={"outline"}>
                Resume Builder
              </TabsTrigger>
              <TabsTrigger value="jd" variant={"outline"}>
                Job Description
              </TabsTrigger>
              <TabsTrigger value="keywords" variant={"outline"}>
                Resume Score
              </TabsTrigger>
            </TabsList>
            <TabsContent className="pt-4" value="builder">
              <div className="mb-4 flex flex-col gap-4">
                <div className="flex gap-2">
                  <LoadingButton
                    onClick={handleAnalyzeScores}
                    loading={isAnalyzingScores}
                    loadingText="Thinking ..."
                  >
                    Analyze Scores
                  </LoadingButton>
                </div>
              </div>

              {resume && (
                <ResumeBuilder
                  data={resume}
                  resumeScores={scores}
                  onUpdate={async (tmp) => {
                    setResume(tmp);
                    try {
                      await updateJobResume({ ...jobResume, content: tmp });
                    } catch (ex) {
                      toast.error(
                        "Something went wrong when saving the resume changes."
                      );
                    }
                  }}
                />
              )}
            </TabsContent>
            <TabsContent className="" value="jd">
              <JobTab
                job={job}
                onUpdateJob={setJob}
                onScoresUpdate={setScores}
                resume={resume}
              />
            </TabsContent>
          </Tabs>
        </div>
        {/* <div>{resume && <ResumePreview resume={resume} />}</div> */}
        <div className="">
          <CVPreview data={resume} jobResume={jobResume} />
        </div>
      </div>

      {/* builder preview */}
      {/* <div>
        {finalResume && (
          <ResumeBuilder
            data={finalResume}
            resumeScores={scores}
            onUpdate={(tmp) => {
              setFinalResume(tmp);
            }}
          />
        )}
      </div> */}
    </div>
  );
};
