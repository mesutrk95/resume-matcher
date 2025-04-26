'use server';

import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { JobResume } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { DEFAULT_RESUME_CONTENT } from './constants';
import {
  ResumeAnalyzeResults,
  ResumeContent,
  ResumeDesign,
  ResumeItemScoreAnalyze,
} from '@/types/resume';
import { ContentWithMeta, getAIJsonResponse, getGeminiChatResponse } from '@/lib/ai';
import { JobAnalyzeResult } from '@/types/job';
import { chunkArray, hashString } from '@/lib/utils';
import { analyzeJobByAI } from './job';
import { convertResumeObjectToString, resumeExperiencesToString } from '@/lib/resume-content';
import {
  BadRequestException,
  ForbiddenException,
  InvalidInputException,
  NotFoundException,
} from '@/lib/exceptions';
import { resumeContentSchema } from '@/schemas/resume';
import z from 'zod';
import { withErrorHandling } from '@/lib/with-error-handling';
import { resumeDesignSchema } from '@/schemas/resume-design.schema';

export const findJobResume = withErrorHandling(async (id: string) => {
  const user = await currentUser();
  const jobResume = await db.jobResume.findUnique({
    where: { id, userId: user?.id },
  });
  return jobResume;
});

export const createJobResume = withErrorHandling(
  async (careerProfileId?: string, jobId?: string, forceRevalidate?: boolean) => {
    const user = await currentUser();
    if (!user?.emailVerified) {
      throw new ForbiddenException('Email not verified.');
    }
    const careerProfile = careerProfileId
      ? await db.careerProfile.findUnique({
          where: { id: careerProfileId, userId: user?.id },
        })
      : null;
    const job =
      jobId &&
      (await db.job.findUnique({
        where: { id: jobId, userId: user?.id },
      }));

    let name = job ? `${job?.title} at ${job?.companyName}` : null;
    if (!name) name = careerProfile ? careerProfile.name : null;

    const resumeJob = await db.jobResume.create({
      data: {
        jobId: jobId,
        baseCareerProfileId: careerProfileId,
        content: (careerProfile?.content as ResumeContent) || DEFAULT_RESUME_CONTENT,
        name: name || 'Blank',
        userId: user?.id!,
      },
    });

    forceRevalidate && revalidatePath('/resumes');

    return resumeJob;
  },
);

export const updateJobResume = withErrorHandling(
  async (resume: Partial<JobResume>, forceRevalidate = false) => {
    const user = await currentUser();
    if (!user?.emailVerified) {
      throw new ForbiddenException('Email not verified.');
    }
    const content = resume.content as ResumeContent;
    const design = resume.design as ResumeDesign;

    const updateJobSchema = z.object({
      content: resumeContentSchema.optional(),
      design: resumeDesignSchema.optional(),
      name: z.string().optional(),
    });

    const validationResult = updateJobSchema.safeParse({
      ...resume,
      content,
      design,
    });

    if (validationResult.error) {
      throw new InvalidInputException(
        'Error in validating the resume data.',
        validationResult.error.errors,
      );
    }

    const updatedJob = await db.jobResume.update({
      where: {
        id: resume.id,
        userId: user?.id,
      },
      data: {
        ...validationResult.data,
        updatedAt: new Date(),
      },
    });

    // revalidatePath("/resumes");
    forceRevalidate && revalidatePath(`/resumes/${resume.id}/builder`);

    // return updatedJob;
  },
);

export const connectJobResumeToJob = withErrorHandling(
  async (jobResumeId: string, jobId: string) => {
    const user = await currentUser();
    if (!user?.emailVerified) {
      throw new ForbiddenException('Email not verified.');
    }

    const job = await db.job.findUnique({
      where: { id: jobId, userId: user?.id },
      select: { id: true },
    });

    if (!job) {
      throw new NotFoundException('Job not found!');
    }
    // Update job in database
    const updatedJob = await db.jobResume.update({
      where: {
        id: jobResumeId,
        userId: user?.id,
      },
      data: {
        jobId: job.id,
        updatedAt: new Date(),
      },
    });

    // revalidatePath("/resumes");
    revalidatePath(`/resumes/${jobResumeId}/builder`);

    return updatedJob;
  },
);

export const deleteJobResume = withErrorHandling(async (id: string) => {
  const user = await currentUser();
  if (!user?.emailVerified) {
    throw new ForbiddenException('Email not verified.');
  }
  await db.jobResume.delete({
    where: { id },
  });

  revalidatePath('/resumes');
  revalidatePath(`/resumes/${id}/builder`);
  return true;
});

export const analyzeResumeScore = withErrorHandling(
  async (formData: FormData, jobResumeId: string) => {
    const file = formData.get('file') as File;

    const bytes = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(bytes);

    const user = await currentUser();
    const jobResume = await db.jobResume.findUnique({
      where: { id: jobResumeId, userId: user?.id },
      include: {
        job: true,
      },
    });

    if (!jobResume) throw new NotFoundException('Resume not found.');
    if (!jobResume.job) throw new BadRequestException('The resume has not been attached to a job!');

    const jobAnalyzeResult = jobResume?.job!.analyzeResults as JobAnalyzeResult;

    const getExperiencesImprovementNotes = async () => {
      const systemInstructions = `
You are an AI-powered resume optimization assistant. Your task is to analyze resumes and provide detailed, actionable suggestions to improve ATS compatibility and alignment with a specific job description.

**Response Requirements:**
- Return suggestions **strictly** in this JSON format (array of objects):
  [
    {
      "title": "Correct [specific issue/area]",
      "explanation": "Suggestion text (use Tailwind CSS classes like [bg|text]-[red|green|orange]-[100-500], font-bold, etc.)",
      "id": "experienceId wrote inside [...]",
      "action_type": "update" | "create",
      "action_text": "Plain text suggestion that will be applied to the resume (no formatting)"
    }
  ]
- **No additional commentary or text** outside the JSON.

**Instructions:**
1. **Analyze** the resume and job description thoroughly.
2. **Identify** ATS optimization opportunities (keywords, structure, readability).
3. **Suggest** concrete improvements (add/remove technologies, rephrase content) in "action_text".
4. **Highlight** key changes with Tailwind CSS classes in "explanation".
5. **Prioritize** suggestions that maximize ATS compatibility and job fit.
6. **Ensure** all suggestions are actionable and directly applicable.`;
      const userPrompt = `
Please analyze and optimize the following resume to better match the job description and ATS requirements.

**Resume:**
${resumeExperiencesToString(jobResume.content as ResumeContent, true, true)}

**Job Description:**
${jobResume?.job!.title}
${jobResume?.job!.description}

Provide your suggestions in the exact JSON format specified.`;

      return getAIJsonResponse(userPrompt, [], systemInstructions);
    };

    const getSkillsImprovementNotes = async () => {
      const systemInstructions = `
You are an AI resume optimization assistant specialized in aligning candidate skills with job descriptions. Your task is to analyze the skills section of a resume and provide the best skill set that matches a specific job description.

You must provide your response in the exact following JSON format:

{
    "title": "Correct Skill Alignment",
    "text": "Source text in resume",
    "improvement": "AI suggestion text, allowed to use Tailwind CSS classes to highlight texts by [bg|text]-[red|green|orange]-[100-500], font-bold, etc.",
    "id": "skills",
    "action_type": "update",
    "action_text": "pure and complete suggested skills list separated by comma"
}

Instructions:
1. Provide the best skill set that aligns perfectly with the job description
2. Use Tailwind CSS classes for highlighting important changes in improvement
3. Ensure suggestions are actionable and directly applicable
4. Return ONLY the valid JSON response with no extra text or commentary`;

      const userPrompt = `
Please analyze and optimize the following resume skills section to better match the job description.

Job Description:
${jobResume?.job!.title}
${jobResume?.job!.description}

Provide your optimization suggestion in the required JSON format.`;

      return getAIJsonResponse(userPrompt, [], systemInstructions);
    };

    const getScore = async () => {
      const systemInstructions = `
You are an expert ATS (Applicant Tracking System) analyzer.
Your task is to evaluate how well a resume matches a given job description.

CRITICAL SECTION VALIDATION:
Before scoring, verify that the following resume sections contain substantive content:
- Experience/Work History: Must contain relevant work experience with dates, organizations, and responsibilities
- Skills: Must list specific technical and soft skills relevant to the position
- Education: Must include degree information and institutions
- Contact Information: Must have basic contact details

SCORING RULES:
- If ANY of these critical sections are empty or missing, the total score CANNOT exceed 30
- If Experience section is empty or very sparse, experience_score MUST be 0
- If Skills section is missing key technical skills mentioned in job description, skills_score CANNOT exceed 10
- Resume with no relevant experience to the job description CANNOT score above 40 overall

INSTRUCTIONS:
- Carefully analyze the resume structure and content sections
- Compare the resume content against the job description
- Calculate a realistic match score from 0-100
- Be strict and critical in your evaluation

SCORING METHODOLOGY:
- Score range: 0-100
- Keyword matching: 40% of total score
- Skills alignment: 30% of total score
- Experience relevance: 20% of total score
- Education & certifications: 10% of total score

RESPONSE FORMAT:
Provide ONLY a JSON object with the following structure:
{
  "score": [0-100 integer],
  "breakdown": {
    "keyword_score": [0-40 integer],
    "skills_score": [0-30 integer],
    "experience_score": [0-20 integer],
    "education_score": [0-10 integer]
  }
}

IMPORTANT:
- Your entire response must be ONLY valid JSON with no additional text
- Do not include any explanations, breakdown, improvement suggestions, or conclusions
- You must be rigorous and realistic in your scoring - empty sections MUST result in low scores
- Only focus on important/relevant keywords that would impact ATS scoring`;

      const prompt = `Job Description: \n${jobResume?.job!.title}\n${jobResume?.job!.description}
    Remember to carefully validate all resume sections and ensure the response is in a valid JSON format with no extra text!`;

      return getAIJsonResponse(
        prompt,
        [{ data: pdfBuffer, mimeType: 'application/pdf' }],
        systemInstructions,
      );
    };

    const getMatchedKeywords = async () => {
      const systemInstructions = `
You are an expert ATS (Applicant Tracking System) keyword analyzer.
Your task is to identify which important keywords from the job description match or are missing in the resume.
321 | You are an expert ATS (Applicant Tracking System) keyword analyzer.
322 | Your task is to identify which important keywords from the job description match or are missing in the resume.
323 | 
324 | INSTRUCTIONS:
325 | - Extract only significant keywords from the job description that would impact ATS scoring
326 | - Compare these keywords against the resume content
327 | - Identify which important keywords are present (matched) in the resume
328 | - Identify which important keywords are absent (missed) in the resume
329 | - Only include meaningful technical skills, qualifications, and experience keywords
330 | - Do NOT include generic words or phrases that wouldn't affect ATS scoring
331 | 
332 | KEYWORD SELECTION CRITERIA:
333 | - Technical skills (programming languages, tools, platforms)
334 | - Industry-specific terminology
335 | - Required certifications or qualifications
336 | - Specific methodologies or processes mentioned
337 | - Job-specific responsibilities or functions
338 | - Required years of experience with specific technologies
339 | - Educational requirements (degrees, fields of study)
340 | 
341 | RESPONSE FORMAT:
342 | Provide ONLY a JSON object with the following structure:
343 | {
344 |   "matched_keywords": [array of important matched keywords],
345 |   "missed_keywords": [array of important missed keywords]
346 | }
347 | 
348 | IMPORTANT:
349 | - Your entire response must be ONLY valid JSON with no additional text
350 | - Do not include any explanations, scoring, or conclusions outside the JSON
351 | - Focus only on significant keywords that genuinely impact ATS evaluation
352 | - Limit to maximum 20 most important keywords in each category
353 | - Sort keywords by importance/relevance (most important first)`;
      const prompt = `Job Keywords: ${jobAnalyzeResult.keywords.map(k => k.keyword).join(',')}

    Resume:
    ${convertResumeObjectToString(jobResume.content as ResumeContent)}
    Remember to carefully validate all resume sections and ensure the response is in a valid JSON format with no extra text!`;

      return getAIJsonResponse(prompt, [], systemInstructions);
    };

    const results = await Promise.all([
      getScore(),
      getMatchedKeywords(),
      getSkillsImprovementNotes(),
      getExperiencesImprovementNotes(),
    ]);

    const newAnalyzeResults = {
      ...((jobResume?.analyzeResults as ResumeAnalyzeResults) || {}),
      ...results[0].result,
      ...results[1].result,
      notes: [results[2].result, ...results[3].result],
    } as ResumeAnalyzeResults;

    await db.jobResume.update({
      where: { id: jobResumeId },
      data: {
        analyzeResults: newAnalyzeResults,
      },
    });

    return newAnalyzeResults;
  },
);

const analyzeResumeExperiencesScores = async (
  analyzeResults: JobAnalyzeResult,
  content: string,
) => {
  const systemInstructions = `I'm trying to find the best matches of my experiences based on the job description to ensure they pass ATS easily. For each variation or project item, you need to:
  
  1. Assign a score (on a scale from 0 to 1) that it reflects the relevance of the item to the JD.
  2. Provide a list of exact words or phrases (matched_keywords) that appear in both the item and the job description. Only include words or phrases that are an exact match.
  
  Return the results in the following format:
  [{ "id": "variation_id", "score": 0.55, "matched_keywords": ["exact_word1", "exact_word2", ...] }, ...]`;

  const prompt =
    `## Job description summary: ${analyzeResults.summary}\n ## My Resume Items\n` +
    content +
    '\n Ensure the response is in a valid JSON format with no extra text! Make sure all the variations have score.';

  const generatedContent = await getAIJsonResponse(prompt, [], systemInstructions);

  return generatedContent;
};

const analyzeResumeProjectsScores = async (analyzeResults: JobAnalyzeResult, content: string) => {
  const prompt = `I'm trying to find best matches of my experiences based on the job description that can pass ATS easily, you need to give a score (on a scale from 0 to 1) to each project item based on how well it matches the job description, give me the best matches in this format [{ "id" : "project_..", "score": 0.55, "matched_keywords": [...] },...], Ensure the response is in a valid JSON format with no extra text!`;

  const generatedContent = await getAIJsonResponse(prompt, [
    content +
      '\n' +
      `Job description summary: ${analyzeResults.summary} \n Make sure all the variations have score.`,
  ]);

  return generatedContent;
};

export const analyzeResumeItemsScores = withErrorHandling(
  async (jobResumeId: string, forceCheckAll?: boolean) => {
    const user = await currentUser();

    const jobResume = await db.jobResume.findUnique({
      where: {
        id: jobResumeId,
        userId: user?.id,
      },
      include: {
        job: true,
      },
    });

    if (!jobResume) {
      throw new NotFoundException('Job Resume not found');
    }
    if (!jobResume.job) throw new BadRequestException('The resume has not been attached to a job!');

    const resumeAnalyzeResults = jobResume.analyzeResults as ResumeAnalyzeResults;
    const oldItemsScore = resumeAnalyzeResults.itemsScore;

    const resume = jobResume?.content as ResumeContent;
    let variations = resume.experiences
      .map(experience => experience.items.map(i => i.variations).flat())
      .flat()
      .filter(v => !!v.content)
      .map(v => ({ ...v, hash: hashString(v.content!, 8) }));

    // concat with project items
    variations = [
      ...variations,
      ...resume.projects.map(p => ({
        enabled: p.enabled,
        id: p.id,
        content: p.content,
        hash: hashString(p.content, 8),
      })),
    ];

    variations = forceCheckAll
      ? variations
      : variations.filter(v => oldItemsScore?.[v.id]?.hash !== v.hash);

    if (variations.length === 0) return resumeAnalyzeResults;

    let jobAnalyzeResults = jobResume.job.analyzeResults as JobAnalyzeResult;
    if (!jobAnalyzeResults?.summary) {
      jobAnalyzeResults = (await analyzeJobByAI(jobResume.jobId!)).analyzeResults!;
    }

    // const content = variations.map((v) => `${v.id} - ${v.content}`).join("\n");

    const chunks = chunkArray(variations, 10);

    const results = await Promise.all(
      chunks.map(items =>
        analyzeResumeExperiencesScores(
          jobAnalyzeResults,
          items.map(v => `${v.id} - ${v.content}`).join('\n'),
        ),
      ),
    );
    const scores = results.map(res => res.result as ResumeItemScoreAnalyze[]).flat();

    // const resp = await analyzeResumeExperiencesScores(
    //   jobAnalyzeResults,
    //   variations.map((v) => `${v.id} - ${v.content}`).join("\n")
    // )

    // const scores = allItems ;
    const scoresMap = scores.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.id]: {
          ...curr,
          hash: hashString(variations.find(v => curr.id === v.id)?.content || '', 8),
        },
      }),
      {},
    );

    const newAnalyzeResults = {
      ...resumeAnalyzeResults,
      itemsScore: {
        ...resumeAnalyzeResults.itemsScore,
        ...scoresMap,
      },
    };

    await db.jobResume.update({
      where: { id: jobResumeId },
      data: {
        analyzeResults: newAnalyzeResults,
      },
    });

    return newAnalyzeResults;
  },
);

export const askCustomQuestionFromAI = withErrorHandling(
  async (
    jobResumeId: string,
    question: string,
    pdfFile: string | null,
    shareJobDescription: boolean,
    history: ContentWithMeta[] = [],
  ) => {
    const user = await currentUser();

    const jobResume = await db.jobResume.findUnique({
      where: {
        id: jobResumeId,
        userId: user?.id,
      },
      select: {
        job: {
          select: {
            description: true,
            companyName: true,
          },
        },
      },
    });

    if (!jobResume) {
      throw new NotFoundException('Resume not found');
    }
    const jd =
      (shareJobDescription &&
        jobResume.job &&
        jobResume.job.description &&
        `## Job description:
    Company: ${jobResume.job.companyName}
    ${jobResume.job.description}`) ||
      '';

    const messageParts: ({ inlineData: { data: string; mimeType: string } } | { text: string })[] =
      [{ text: question }];

    if (pdfFile) {
      messageParts.push({
        inlineData: {
          data: pdfFile.split(',')[1],
          mimeType: 'application/pdf',
        },
      });
    }

    const systemInstruction = `Your role is to answer the question based on my resume and JD, give ready to user answers.
  ${jd}
  give me your message in html format and feel free to use font-bold class and br tag for new line. I wanna show the html output in a message bubble.`;

    const instructionSuffix =
      " Reminder: Respond in HTML format using <br>, <span class='font-bold'>, etc.";

    const result = await getGeminiChatResponse(
      systemInstruction,
      messageParts,
      instructionSuffix,
      history,
    );
    return result;
  },
);
