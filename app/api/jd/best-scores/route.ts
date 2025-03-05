import { GoogleGenerativeAI } from '@google/generative-ai';
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/error-handler";
import { NextResponse } from "next/server";


import OpenAI from "openai";

const parseResult = (message: string) => {
    let error = null;
    let object = null;
    try {
        object = JSON.parse(message.replace('```json', '').replace('```', ''))
    } catch (err: any) {
        error = err.toString()
    }

    return { error, result: object, rawResult: message }
}

const getDeepSeekResponse = async (prompt: string, content: string) => {

    const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: process.env.DEEPSEEK_API_KEY
    });

    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: prompt + "\n" + content }],
        model: "deepseek-chat",
    });

    const msg = completion.choices[0].message.content
    const result = parseResult(msg || '')

    return result
};


const getGeminiResponse = async (prompt: string, content: string) => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const generatedContent = await model.generateContent([prompt, { text: content }]);
    const msg = generatedContent.response.text()
    const result = parseResult(msg)
    return result;
};

// POST /jd
export const POST = withErrorHandling(async (request: Request) => {
    const body = await request.json();
    const { content, keywords } = body;

    const prompt = `I'm trying to find best matches of my experiences based on the job description that can pass ATS easily, an experience has items, and each item has variations, you need to give a score (on a scale from 0 to 1) to each variation based on how well it matches the job description, in an experience item only one variation can be selected, give me the best matches in this format [{ "id" : "variation_id", "score": 0.55, "matched_keywords": [...] },...], give me pure json data as normal text!`

    const generatedContent = await getGeminiResponse(prompt, content + '\n' + `keywords: ${keywords} \n Make sure all the variations have score.`)

    return NextResponse.json(
        { ...generatedContent, prompt, content },
        { status: 201 }
    );
});
