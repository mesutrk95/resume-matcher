import { withErrorHandling } from "@/lib/api-error-handler";
import { NextResponse } from "next/server";
import { getAIJsonResponse } from '@/lib/ai';

// POST /jd/keywords/analyze
export const POST = withErrorHandling(async (request: Request) => {
    const body = await request.json();
    const { description } = body;

    // const prompt = `Give me the important keywords in this job description
    //  and give each one a skill type (hard/soft/none) and level of importance(between 0-1) in this format [{ "keyword" : "something", "skill": "hard", "level": 0.55 },...], give me pure json data as normal text no need to format it.` ;

    const prompt = `Analyze the following job description and extract important keywords. 
Categorize each keyword as either "hard", "soft", or "none" based on whether it represents a hard skill, soft skill, or neither (e.g., industry terms like "SaaS"). 
Additionally, assign a level of importance to each keyword on a scale from 0 to 1, where 1 is highly important and 0 is minimally important. 
Provide the results in a structured JSON format as an array of objects, where each object contains the fields "keyword", "skill", and "level". 
Ensure the response is in a valid JSON format with no extra text, without any additional formatting or explanations. catch whatever is important for ATSs, Here is the job:`

    const result = await getAIJsonResponse(prompt, [description])

    return NextResponse.json(
        { prompt, ...result },
        { status: 201 }
    );
});
