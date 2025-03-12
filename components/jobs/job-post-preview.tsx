import { JobKeyword, JobKeywordType } from "@/types/job";
import { Job } from "@prisma/client";
import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { JobDescriptionPreview } from "./job-description-preview";

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


export const JobPostPreview = ({
  job, 
  onJobUpdated, 
}: {
  job: Job; 
  onJobUpdated?: (j: Job) => void; 
}) => {
  const jobKeywords = useMemo(() => {
    const results = job.analyzeResults as { keywords: JobKeyword[] };
    return results?.keywords?.reduce((acc, keyword) => {
      const ks = acc[keyword.skill] || [];
      ks.push(keyword);
      acc[keyword.skill] = ks;
      return acc;
    }, {} as Record<JobKeywordType, JobKeyword[]>);
  }, [job]);

  return (
    <Tabs defaultValue="jd" className=" ">
      <TabsList className="grid w-full grid-cols-3" variant={"outline"}>
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
      <TabsContent className="px-2" value="jd">
        <JobDescriptionPreview job={job} onJobUpdated={onJobUpdated} />
      </TabsContent>
      <TabsContent className="px-2" value="keywords">
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
            <h4 className="font-bold">Other</h4>
            <ul className="gap-2">
              {jobKeywords?.["none"]
                ?.sort((k1, k2) => k2.level - k1.level)
                .map((keyword) => (
                  <KeywordBadge keyword={keyword} key={keyword.keyword} />
                ))}
            </ul>
          </div>
        </div>
      </TabsContent>
      <TabsContent className="px-2" value="summary">
        <div
          className="jd-preview text-sm"
          dangerouslySetInnerHTML={{
            __html: (job.analyzeResults as { summary: string })?.summary || '',
          }}
        ></div>
      </TabsContent>
    </Tabs>
  );
};
