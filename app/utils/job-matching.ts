import { Keyword } from "@/api/job-matcher";
import { ResumeContent, Variation } from "@/types/resume";

function findDuplicates(arr: string[]): { keyword: string; repeats: number }[] {
    const counts = arr.reduce<Record<string, number>>((acc, item) => {
        acc[item] = (acc[item] || 0) + 1;
        return acc;
    }, {});

    return Object.entries(counts).map(([keyword, repeats]) => ({
        keyword,
        repeats,
    }));
}

function extractKeywords(jobDescription: string) {
    // Simple keyword extraction (split by space and filter out common words)
    const commonWords = new Set([
        "the",
        "and",
        "of",
        "in",
        "to",
        "a",
        "with",
        "for",
        "on",
        "at",
        "are",
        "you",
        "from",
        "our",
        "has",
        "that",
        "we",
        "need",
    ]);

    return findDuplicates(
        jobDescription
            .toLowerCase()
            .split(/\W+/)
            .filter((word) => word.length > 2 && !commonWords.has(word))
    );
}

function scoreVariation(variation: Variation, keywords: Keyword[]): number {
    const contentWords = variation.content.toLowerCase().split(/\W+/).map(w => w.toLowerCase());

    return keywords.filter((word) => contentWords.includes(word.keyword.toLowerCase()))
        .length;
}

function selectBestVariations(
    resume: ResumeContent,
    keywords: Keyword[]
): ResumeContent {
    let scores: any = {

    }
    const selectedResume: ResumeContent = {
        experiences: resume.experiences.map((experience, index) => {
            const items = experience.items.map((item) => {
                const bestVariation = item.variations.reduce(
                    (best, variation) => {
                        const score = scoreVariation(variation, keywords);
                        console.log(variation.id, score, { variation, keywords });
                        scores[item.id + '-' + variation.id] = score
                        return score > best.score ? { variation, score } : best;
                    },
                    {
                        variation: item.variations[0],
                        score: scoreVariation(item.variations[0], keywords),
                    }
                );

                return {
                    ...item,
                    variations: [bestVariation.variation], // Only keep the best variation
                };
            });

            // Apply the rules for the number of items per experience
            let itemCount;
            if (index === 0) {
                itemCount = 5;
            } else if (index === 1) {
                itemCount = 3;
            } else {
                itemCount = 2;
            }

            return {
                ...experience,
                items: items.slice(0, itemCount), // Only keep the required number of items
            };
        }),
    };

    console.log('scores', scores);


    return selectedResume;
}

export const constructFinalResume = (templateContent: ResumeContent, keywords: Keyword[]) => {
    // const keywords = extractKeywords(jobDescription);
    // setKeywords(keywords);
    console.log("keywords", keywords);

    if (!keywords) return null;
    return selectBestVariations(templateContent, keywords);
};