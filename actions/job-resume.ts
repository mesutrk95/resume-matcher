'use server';

import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ResumeAnalyzeResults, ResumeContent, ResumeItemScoreAnalyze } from '@/types/resume';
import { AIRequestModel, ChatHistoryItem, getAIServiceManager, getChatResponse } from '@/lib/ai';
import { JobAnalyzeResult } from '@/types/job';
import { convertResumeObjectToString, resumeExperiencesToString } from '@/lib/resume-content';
import { BadRequestException, ForbiddenException, NotFoundException } from '@/lib/exceptions';
import {
  ExperienceImprovements,
  ExperienceImprovementsSchema,
  KeywordMatchingResult,
  KeywordMatchingResultSchema,
  ResumeScore,
  ResumeScoreSchema,
  SkillAlignment,
  SkillAlignmentSchema,
} from '@/schemas/resume';
import { withErrorHandling } from '@/lib/with-error-handling';
import { Reasons } from '@/domains/reasons';

export const analyzeResumeScore = withErrorHandling(
  async (formData: FormData, jobResumeId: string) => {
    const file = formData.get('file') as File;

    const bytes = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(bytes);

    const user = await currentUser();
    const jobResume = await db.jobResume.findUnique({
      where: { id: jobResumeId, userId: user.id },
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

      const request: AIRequestModel<ExperienceImprovements> = {
        prompt: userPrompt,
        responseFormat: 'json',
        zodSchema: ExperienceImprovementsSchema,
        context: {
          reason: Reasons.RESUME_ANALYZE_EXPERIENCES,
        },
        contents: [
          {
            data: systemInstructions,
            type: 'text',
          },
        ],
      };

      try {
        const result = await getAIServiceManager().executeRequest(request);
        return {
          result,
          prompt: userPrompt,
        };
      } catch (error) {
        return {
          error,
          prompt: userPrompt,
        };
      }
    };

    const getSkillsImprovementNotes = async () => {
      const systemInstructions = `
You are an AI resume optimization assistant specialized in aligning candidate skills with job descriptions. Your task is to analyze the skills section of a resume and provide the best skill set that matches a specific job description.

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

      const request: AIRequestModel<SkillAlignment> = {
        prompt: userPrompt,
        responseFormat: 'json',
        zodSchema: SkillAlignmentSchema,
        context: {
          reason: Reasons.RESUME_ANALYZE_SKILLS,
        },
        contents: [
          {
            data: systemInstructions,
            type: 'text',
          },
        ],
      };

      try {
        const result = await getAIServiceManager().executeRequest(request);
        return {
          result,
          prompt: userPrompt,
        };
      } catch (error) {
        return {
          error,
          prompt: userPrompt,
        };
      }
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

IMPORTANT:
- Do not include any explanations, breakdown, improvement suggestions, or conclusions
- You must be rigorous and realistic in your scoring - empty sections MUST result in low scores
- Only focus on important/relevant keywords that would impact ATS scoring`;

      const prompt = `Job Description: \n${jobResume?.job!.title}\n${jobResume?.job!.description}
    Remember to carefully validate all resume sections and ensure the response is in a valid JSON format with no extra text!`;

      const request: AIRequestModel<ResumeScore> = {
        prompt,
        responseFormat: 'json',
        zodSchema: ResumeScoreSchema,
        context: {
          reason: Reasons.SCORE_RESUME,
        },
        contents: [
          {
            data: systemInstructions,
            type: 'text',
          },
          {
            data: pdfBuffer,
            type: 'pdf',
          },
        ],
      };

      try {
        const result = await getAIServiceManager().executeRequest(request);
        return {
          result,
          prompt,
        };
      } catch (error) {
        return {
          error,
          prompt,
        };
      }
    };

    const getMatchedKeywords = async () => {
      const systemInstructions = `
You are an expert ATS (Applicant Tracking System) keyword analyzer.
Your task is to identify which important keywords from the job description match or are missing in the resume.
You are an expert ATS (Applicant Tracking System) keyword analyzer.
Your task is to identify which important keywords from the job description match or are missing in the resume.
 
INSTRUCTIONS:
- Extract only significant keywords from the job description that would impact ATS scoring
- Compare these keywords against the resume content
- Identify which important keywords are present (matched) in the resume
- Identify which important keywords are absent (missed) in the resume
- Only include meaningful technical skills, qualifications, and experience keywords
- Do NOT include generic words or phrases that wouldn't affect ATS scoring

KEYWORD SELECTION CRITERIA:
- Technical skills (programming languages, tools, platforms)
- Industry-specific terminology
- Required certifications or qualifications
- Specific methodologies or processes mentioned
- Job-specific responsibilities or functions
- Required years of experience with specific technologies
- Educational requirements (degrees, fields of study)

RESPONSE FORMAT:
Provide ONLY a JSON object with the following structure:
{
  "matched_keywords": [array of important matched keywords],
  "missed_keywords": [array of important missed keywords]
}

IMPORTANT:
- Your entire response must be ONLY valid JSON with no additional text
- Do not include any explanations, scoring, or conclusions outside the JSON
- Focus only on significant keywords that genuinely impact ATS evaluation
- Limit to maximum 20 most important keywords in each category
- Sort keywords by importance/relevance (most important first)`;
      const prompt = `Job Keywords: ${jobAnalyzeResult.keywords.map(k => k.keyword).join(',')}

    Resume:
    ${convertResumeObjectToString(jobResume.content as ResumeContent)}
    Remember to carefully validate all resume sections and ensure the response is in a valid JSON format with no extra text!`;

      const request: AIRequestModel<KeywordMatchingResult> = {
        prompt: prompt,
        responseFormat: 'json',
        zodSchema: KeywordMatchingResultSchema,
        context: {
          reason: Reasons.MATCH_KEYWORDS_RESUME,
        },
        contents: [
          {
            data: systemInstructions,
            type: 'text',
          },
        ],
      };

      try {
        const result = await getAIServiceManager().executeRequest(request);
        return {
          result,
          prompt,
        };
      } catch (error) {
        return {
          error,
          prompt,
        };
      }
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
      notes: [results[2].result, ...(results[3].result || [])],
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

export const askCustomQuestionFromAI = withErrorHandling(
  async (
    jobResumeId: string,
    question: string,
    pdfFile: string | null,
    shareJobDescription: boolean,
    history: ChatHistoryItem[] = [],
  ) => {
    const user = await currentUser();

    const jobResume = await db.jobResume.findUnique({
      where: {
        id: jobResumeId,
        userId: user.id,
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

    const result = await getChatResponse(
      systemInstruction,
      messageParts,
      instructionSuffix,
      history,
      Reasons.CUSTOM_QUESTION,
    );
    return result;
  },
);
