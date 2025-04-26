import React, { useMemo, useState, useTransition } from 'react';
import { analyzeResumeScore } from '@/actions/job-resume';
import { useResumeBuilder } from '@/components/job-resumes/resume-builder/context/useResumeBuilder';
import { ResumeDocument } from '@/components/job-resumes/resume-renderer/resume-document';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { Textarea } from '@/components/ui/textarea';
import { findVariation, resumeSkillsToString } from '@/lib/resume-content';
import { randomNDigits } from '@/lib/utils';
import { ResumeAnalyzedImprovementNote } from '@/types/resume';
import { arrayMove } from '@dnd-kit/sortable';
import { JobResume } from '@prisma/client';
import { pdf } from '@react-pdf/renderer';
import { CheckCircle, CircleX, RefreshCw, WandSparkles } from 'lucide-react';
import { toast } from 'sonner';
import { ConnectJobToResume } from '../../../../../components/job-resumes/connect-job-to-resume';

import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { LottieAnimatedIcon } from '@/app/_components/lottie-animated-icon';
import Image from 'next/image';
const GaugeComponent = dynamic(() => import('react-gauge-component'), {
  ssr: false,
});

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
    if (note.id === 'skills') {
      // const newSkills = newContent
      //   .split(/,\s*(?![^()]*\))/)
      //   .map((s) => s.trim());
      // const resumeSkills = new Set(
      //   resume.skills.map((s) =>
      //     s.content
      //       .trim()
      //       .replace(/\u200B/g, "")
      //       .toLowerCase()
      //   )
      // );
      // // add missing skills
      // const skillsToAdd = newSkills.filter(
      //   (rs) => !resumeSkills.has(rs.toLowerCase())
      // );
      // skillsToAdd.forEach((s) => {
      //   const newSkill = {
      //     id: `skill_${randomNDigits()}`,
      //     content: s.trim(),
      //     category: "Default",
      //     enabled: true,
      //   };
      //   resume.skills.push(newSkill);
      // });
      // let finalList = resume.skills.map((s) => ({ ...s, enabled: false }));
      // // sort skills
      // newSkills.forEach((ns, index) => {
      //   const oldIndex = finalList.findIndex(
      //     (skill) => skill.content.replace(/\u200B/g, "").trim() === ns
      //   );
      //   if (oldIndex !== index)
      //     finalList = arrayMove(finalList, oldIndex, index);
      //   finalList[index].enabled = true;
      // });
      // saveResume({ ...resume, skills: finalList });
      // toast.success("Resume skills updated!");
    } else if (variation) {
      variation.content = newContent;
      toast.success('Update applied to the resume!');
      saveResume({ ...resume });
    }
  };

  const sourceContent = useMemo(() => {
    return note.id === 'skills'
      ? resumeSkillsToString(resume)
      : variation?.content?.trim().replace(/\u200B/g, '');
  }, [variation, note?.id, resume]);

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
            <p className="border px-3 py-2 rounded bg-slate-100">{variation.content}</p>
          )}
          {note.id === 'skills' && (
            <p className="border  px-3 py-2 rounded bg-slate-100">{resumeSkillsToString(resume)}</p>
          )}
          <Textarea onChange={e => setNewContent(e.target.value)} value={newContent} />
          {/* <p className="border p-2">{note.action.content}</p> */}
          <div>
            <Button className="text-sm" size={'sm'} onClick={applyAction}>
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
  const { resume, resumeAnalyzeResults, setResumeAnalyzeResults } = useResumeBuilder();
  const [isRatingResume, startRatingResumeTransition] = useTransition();
  const handleResumeScore = () => {
    startRatingResumeTransition(async () => {
      try {
        const blobData = await pdf(
          <ResumeDocument resume={resume} withIdentifiers skipFont={true} />,
        ).toBlob();
        const file = new File([blobData], 'resume.pdf', {
          type: 'application/pdf',
        });
        const formData = new FormData();
        formData.append('file', file);

        const analyzeResults = await analyzeResumeScore(formData, jobResume.id);
        if (!analyzeResults.data) {
          toast.error('Failed to analyze resume score.');
          return;
        }
        setResumeAnalyzeResults(analyzeResults.data);
        // console.log(analyzeResults);
        toast.success('Successfully analyzed resume score!');
      } catch (error) {
        toast.error('Failed to analyze resume score.');
      }
    });
  };

  if (!resumeAnalyzeResults) return;

  if (!jobResume.jobId) {
    return (
      <Card className=" ">
        <CardContent className="p-5">
          <div className="p-4 flex justify-center items-center ">
            <div className="text-center py-5">
              <h3 className="text-lg font-bold">Target a Job!</h3>
              <p className="text-muted-foreground text-xs mb-4">
                Select the job you’re targeting so we can personalize this resume for you!
              </p>
              <ConnectJobToResume jobResumeId={jobResume.id} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (typeof resumeAnalyzeResults.score === 'undefined') {
    return (
      <Card className=" ">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="">
              <h4 className="text-lg text-slate-700 font-bold">Resume Score 🎯</h4>
              <p>
                Minova evaluates key factors such as relevant skills, experience, keywords, and
                overall structure. A higher score means your resume is more tailored to the job and
                likely to catch the attention of recruiters and ATS systems!
              </p>
              <LoadingButton
                onClick={() => handleResumeScore()}
                loading={isRatingResume}
                loadingText="Thinking ..."
                className="mt-5"
                variant={'default'}
                size={'sm'}
              >
                Score It!
              </LoadingButton>
            </div>
            <div className=" flex justify-center">
              <Image src="/assets/resume-score.svg" width={200} alt="" />

              {/* <LottieAnimatedIcon icon="/iconly/AiProcessor.json" width={150} height={150}/> */}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className=" ">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="">
              {resumeAnalyzeResults.score < 50 && (
                <>
                  <h4 className="text-xl text-red-500 font-bold">Needs Improvement! 🚧</h4>
                  <p className="text-xs">
                    Your resume could use some work! Consider improving clarity, structure, and
                    content. Focus on showcasing your skills, using strong action verbs, and
                    tailoring it to the job you’re applying for.
                  </p>
                </>
              )}
              {resumeAnalyzeResults.score < 80 && resumeAnalyzeResults.score > 50 && (
                <>
                  <h4 className="text-xl text-yellow-500 font-bold">
                    Decent, But Can Be Better! ⚡
                  </h4>
                  <p className="text-xs">
                    Your resume is on the right track! To make it stronger, refine your bullet
                    points, highlight key achievements, and ensure it’s ATS-friendly. A few tweaks
                    can significantly boost your chances!
                  </p>
                </>
              )}
              {resumeAnalyzeResults.score >= 80 && (
                <>
                  <h4 className="text-xl text-green-500 font-bold">Great Job!</h4>
                  <p>
                    Your resume is well-crafted and optimized! It effectively highlights your skills
                    and experience. Consider fine-tuning small details to make it even more
                    compelling and stand out to recruiters.
                  </p>
                </>
              )}

              <LoadingButton
                onClick={() => handleResumeScore()}
                loading={isRatingResume}
                loadingText="Checking ..."
                className="mt-5 flex gap-2 items-center"
                variant={'outline'}
                size={'sm'}
              >
                <RefreshCw size={16} />
                Check Again!
              </LoadingButton>
            </div>
            <div className="min-w-[280px]">
              <GaugeComponent
                type="semicircle"
                // style={{ padding: '0 25px'}}
                arc={{
                  colorArray: ['#FF4040', '#FEDC01', '#68CA68'],
                  padding: 0.025,
                  cornerRadius: 3,
                  subArcs: [{ limit: 50 }, { limit: 80 }, { limit: 100, showTick: false }],
                }}
                labels={{
                  valueLabel: {
                    style: {
                      fontSize: 35,
                      fill: 'hsl(var(--muted-foreground))',
                      textShadow: 'none',
                      fontWeight: 'bold',
                    },
                    formatTextValue: value => `${value}%`,
                  },
                  tickLabels: {
                    type: 'outer',
                    ticks: [
                      {
                        value: 0,
                        lineConfig: { hide: false },
                        valueConfig: { formatTextValue: () => 'Bad' },
                      },
                      {
                        value: 50,
                        lineConfig: { hide: false },
                        valueConfig: { formatTextValue: () => 'Normal' },
                      },
                      {
                        value: 80,
                        lineConfig: { hide: false },
                        valueConfig: { formatTextValue: () => 'Very Good!' },
                      },
                      {
                        value: 100,
                        lineConfig: { hide: true },
                        valueConfig: { hide: true },
                      },
                    ],
                  },
                }}
                pointer={{ type: 'arrow', elastic: true, length: 2, width: 12 }}
                value={resumeAnalyzeResults.score}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {(resumeAnalyzeResults?.missed_keywords.length > 0 ||
        resumeAnalyzeResults.matched_keywords.length > 0 ||
        resumeAnalyzeResults.notes.length > 0) && (
        <Card className="mt-2">
          <CardContent className="p-5">
            {resumeAnalyzeResults?.missed_keywords && (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <CircleX className="text-red-500" size={18} />
                    Missed Keywords ({resumeAnalyzeResults.missed_keywords.length})
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {resumeAnalyzeResults.missed_keywords.map(k => (
                      <span key={k} className="px-2 py-1 text-sm bg-slate-200 rounded-full">
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
                    {resumeAnalyzeResults.matched_keywords.map(k => (
                      <span key={k} className="px-2 py-1 text-sm bg-slate-200 rounded-full">
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
          </CardContent>
        </Card>
      )}
    </>
  );
};
