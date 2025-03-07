import { withErrorHandling } from "@/lib/api-error-handler";
import { NextResponse } from "next/server";
import { getAIJsonResponse } from '@/lib/ai';

// POST /jd/best-scores
export const POST = withErrorHandling(async (request: Request) => {
    const body = await request.json();
    const { content, keywords } = body;

    const prompt = `I'm trying to find best matches of my experiences based on the job description that can pass ATS easily, an experience has items, and each item has variations, you need to give a score (on a scale from 0 to 1) to each variation based on how well it matches the job description, in an experience item only one variation can be selected, give me the best matches in this format [{ "id" : "variation_id", "score": 0.55, "matched_keywords": [...] },...], Ensure the response is in a valid JSON format with no extra text!`

    const generatedContent = await getAIJsonResponse(prompt, [content + '\n' + `keywords: ${keywords} \n Make sure all the variations have score.`])

    return NextResponse.json(
        { ...generatedContent, prompt, content },
        { status: 201 }
    );
});
