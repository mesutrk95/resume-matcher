import React, { useMemo, useState, useTransition } from "react";
import { analyzeResumeScore } from "@/actions/job-resume";
import { useResumeBuilder } from "@/components/job-resumes/resume-builder/context/useResumeBuilder";
import { ResumeDocument } from "@/components/job-resumes/resume-document";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Textarea } from "@/components/ui/textarea";
import { findVariation, resumeSkillsToString } from "@/lib/resume-content";
import { randomNDigits } from "@/lib/utils";
import { ResumeAnalyzedImprovementNote } from "@/types/resume";
import { arrayMove } from "@dnd-kit/sortable";
import { JobResume } from "@prisma/client";
import { BlobProvider } from "@react-pdf/renderer";
import { CheckCircle, CircleX, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { ConnectJobToResume } from "../../../../../components/job-resumes/connect-job-to-resume";

const ImprovementNote = ({
  index,
  note,
}: {
  index: number;
  note: ResumeAnalyzedImprovementNote;
}) => {
  const { saveResume, resume } = useResumeBuilder();
  const variation = findVariation(resume, note?.id);
  const [newContent, setNewContent] = useState(note.action_text);

  const applyAction = () => {
    if (note.id === "skills") {
      const newSkills = newContent
        .split(/,\s*(?![^()]*\))/)
        .map((s) => s.trim());

      const resumeSkills = new Set(
        resume.skills.map((s) =>
          s.content
            .trim()
            .replace(/\u200B/g, "")
            .toLowerCase()
        )
      );

      // add missing skills
      const skillsToAdd = newSkills.filter(
        (rs) => !resumeSkills.has(rs.toLowerCase())
      );

      skillsToAdd.forEach((s) => {
        const newSkill = {
          id: `skill_${randomNDigits()}`,
          content: s.trim(),
          category: "Default",
          enabled: true,
        };
        resume.skills.push(newSkill);
      });

      let finalList = resume.skills.map((s) => ({ ...s, enabled: false }));

      // sort skills
      newSkills.forEach((ns, index) => {
        const oldIndex = finalList.findIndex(
          (skill) => skill.content.replace(/\u200B/g, "").trim() === ns
        );

        if (oldIndex !== index)
          finalList = arrayMove(finalList, oldIndex, index);
        finalList[index].enabled = true;
      });
      saveResume({ ...resume, skills: finalList });
      toast.success("Resume skills updated!");
    } else if (variation) {
      variation.content = newContent;
      toast.success("Update applied to the resume!");
      saveResume({ ...resume });
    }
  };

  const sourceContent = useMemo(() => {
    return note.id === "skills"
      ? resumeSkillsToString(resume)
      : variation?.content?.trim().replace(/\u200B/g, "");
  }, [resume?.skills, variation]);

  return (
    <div className="flex flex-col gap-2" key={note.title}>
      <h4 className=" font-bold">
        {index + 1}. {note.title}
      </h4>
      {/* {note.text && (
          <div className="flex ">
            <div>
              <LucideX className="text-red-500" size={18} />
            </div>
            <p
              className="px-2 text-sm  "
              dangerouslySetInnerHTML={{ __html: note.text }}
            ></p>
          </div>
        )} */}
      {note.explanation && (
        <div className="flex ">
          {/* <div>
              <LucideCheck className="text-green-500" size={18} />
            </div> */}
          <p
            className="px-0 text-sm  "
            dangerouslySetInnerHTML={{
              __html: note.explanation,
            }}
          ></p>
        </div>
      )}
      {note.action_type && note.action_text !== sourceContent && (
        <div className="flex flex-col gap-2 border rounded p-3 text-sm">
          <h5 className="font-bold capitalize">{note.action_type} Action</h5>
          {variation && (
            <p className="border px-3 py-2 rounded bg-slate-100">
              {variation.content}
            </p>
          )}
          {note.id === "skills" && (
            <p className="border  px-3 py-2 rounded bg-slate-100">
              {resumeSkillsToString(resume)}
            </p>
          )}
          <Textarea
            onChange={(e) => setNewContent(e.target.value)}
            value={newContent}
          />
          {/* <p className="border p-2">{note.action.content}</p> */}
          <div>
            <Button className="text-sm" size={"sm"} onClick={applyAction}>
              <WandSparkles size={16} />
              Apply It!
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export const ResumeScoreTab = ({ jobResume }: { jobResume: JobResume }) => {
  const { resume, resumeAnalyzeResults, setResumeAnalyzeResults } =
    useResumeBuilder();
  const [isRatingResume, startRatingResumeTransition] = useTransition();
  const handleResumeScore = (resumePdfBlob: Blob) => {
    startRatingResumeTransition(async () => {
      try {
        const file = new File([resumePdfBlob], "resume.pdf", {
          type: "application/pdf",
        });
        const formData = new FormData();
        formData.append("file", file);

        const analyzeResults = await analyzeResumeScore(formData, jobResume.id);
        setResumeAnalyzeResults(analyzeResults);
        console.log(analyzeResults);
        toast.success("Successfully analyzed resume score!");
      } catch (error) {
        toast.error("Failed to analyze resume score.");
      }
    });
  };

  if (!resumeAnalyzeResults) return;

  if (!jobResume.jobId) {
    return (
      <div className="p-4 flex justify-center items-center ">
        <div className="text-center py-5">
          <h3 className="text-lg font-bold">Target a Job!</h3>
          <p className="text-muted-foreground text-xs mb-4">
            Select the job you’re targeting so we can personalize this resume
            for you!
          </p>
          <ConnectJobToResume jobResumeId={jobResume.id} />
        </div>
      </div>
    );
  }

  return (
    <>
      <BlobProvider
        document={
          <ResumeDocument resume={resume} withIdentifiers skipFont={true} />
        }
      >
        {({ blob, url, loading, error }) => {
          // if (error) {
          //   return <div>Error: {error}</div>;
          // }

          return (
            <LoadingButton
              onClick={() => handleResumeScore(blob!)}
              loading={loading || isRatingResume}
              loadingText="Thinking ..."
            >
              Rate Resume!
            </LoadingButton>
          );
        }}
      </BlobProvider>

      {resumeAnalyzeResults?.missed_keywords && (
        <div className="flex flex-col gap-5 mt-10">
          <h3 className="text-xl font-bold">
            Rate: {resumeAnalyzeResults.score}%
          </h3>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <CircleX className="text-red-500" size={18} />
              Missed Keywords ({resumeAnalyzeResults.missed_keywords.length})
            </h3>
            <div className="flex flex-wrap gap-1">
              {resumeAnalyzeResults.missed_keywords.map((k) => (
                <span
                  key={k}
                  className="px-2 py-1 text-sm bg-slate-200 rounded-full"
                >
                  {k}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <CheckCircle className="text-green-500" size={18} />
              Matched Keywords ({resumeAnalyzeResults.matched_keywords.length})
            </h3>
            <div className="flex flex-wrap gap-1">
              {resumeAnalyzeResults.matched_keywords.map((k) => (
                <span
                  key={k}
                  className="px-2 py-1 text-sm bg-slate-200 rounded-full"
                >
                  {k}
                </span>
              ))}
            </div>
          </div>
          {resumeAnalyzeResults.notes?.length > 0 && (
            <div className="flex flex-col gap-2 pb-5">
              <h3 className="text-lg font-bold flex items-center gap-2">
                Improvement Notes ({resumeAnalyzeResults.notes.length})
              </h3>
              <div className="flex flex-col gap-4">
                {resumeAnalyzeResults.notes.map((note, index) => (
                  <ImprovementNote key={note.title} index={index} note={note} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
