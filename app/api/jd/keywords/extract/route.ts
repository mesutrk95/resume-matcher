import { GoogleGenerativeAI } from '@google/generative-ai';
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/error-handler";
import { NextResponse } from "next/server";

// POST /jd
export const POST = withErrorHandling(async (request: Request) => {
    const body = await request.json();
    const { description } = body;
    // const user = await currentUser()

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // const prompt = `Give me the important keywords in this job description
    //  and give each one a skill type (hard/soft/none) and level of importance(between 0-1) in this format [{ "keyword" : "something", "skill": "hard", "level": 0.55 },...], give me pure json data as normal text no need to format it.` ;

    const prompt = `Analyze the following job description and extract important keywords. 
Categorize each keyword as either "hard", "soft", or "none" based on whether it represents a hard skill, soft skill, or neither (e.g., industry terms like "SaaS"). 
Additionally, assign a level of importance to each keyword on a scale from 0 to 1, where 1 is highly important and 0 is minimally important. 
Provide the results in a structured JSON format as an array of objects, where each object contains the fields "keyword", "skill", and "level". 
Ensure the output is pure JSON data as plain text, without any additional formatting or explanations. catch whatever is important for ATSs, Here is the job:`
    
    const result = await model.generateContent([prompt, {text : description}]);
    // console.log(result.response.text());
    const text = result.response.text()
    let error = null;
    let object = null;
    try {
        object = JSON.parse(text.replace('```json', '').replace('```', ''))
    } catch (err: any) {
        error = err.toString()
    }

    return NextResponse.json(
        { text, result: object, error },
        { status: 201 }
    );
});
