import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-error-handler";
import { getAIJsonResponse } from "@/lib/ai";
import cheerio from 'cheerio';
import axios from "axios";

// GET /jd/extract-from-url?url=
export const GET = withErrorHandling(async (request: Request) => {
    // const user = await currentUser()

    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json(
            { error: "URL is required" },
            { status: 400 }
        );
    }
    // Fetch the content of the URL
    const response = await axios.get(url);
    const html = response.data;

    // Load the HTML into cheerio
    const $ = cheerio.load(html);
    const cardTop = $('.top-card-layout__entity-info-container').text().trim();
    const description = $('.description__text--rich .show-more-less-html__markup').html()?.trim();


    const jd = `Banner: ${cardTop}, Description: ${description}`.replaceAll('\n', '')
    const prompt = `Extract the following details from the given text, with this keys "description", "companyName", "location" , "title", "postedDate".keep the description in html format and make sure postedDate is in correct date format. Ensure the response is in a valid JSON format with no extra text:\n ${jd}`;

    const result = await getAIJsonResponse(prompt)

    return NextResponse.json(
        { ...result, prompt }, ///companyName, , location, title, postedDate },
        { status: 200 }
    );
});
