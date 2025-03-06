import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

export const getAIJsonResponse = async (prompt: string, content?: string[]) => {
    const response = await getGeminiResponse(prompt, content)
    return parseJson(response)
}
export const getAIHtmlResponse = async (prompt: string, content?: string[]) => {
    const result = await getGeminiResponse(prompt, content)
    return parseHtml(result)
}

const getDeepSeekResponse = async (prompt: string, contents?: string[]) => {
    const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: process.env.DEEPSEEK_API_KEY
    });

    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: prompt + "\n" + contents?.join(', ') }],
        model: "deepseek-chat",
    });

    const msg = completion.choices[0].message.content
    return msg
};


const getGeminiResponse = async (prompt: string, contents?: string[]) => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const generatedContent = await model.generateContent([prompt, ...(contents?.map(c => ({ text: c })) || [])]);
    const msg = generatedContent.response.text()
    return msg;
};

const parseJson = (message: string) => {
    let error = null;
    let object = null;
    try {
        object = JSON.parse(message.replace('```json', '').replace('```', ''))
    } catch (err: any) {
        error = err.toString()
    }

    return { error, result: object, rawResult: message }
}

const parseHtml = (message: string) => {
    let error = null;
    return { error, result: message.replace('```html', '').replace('```', ''), rawResult: message }
}
