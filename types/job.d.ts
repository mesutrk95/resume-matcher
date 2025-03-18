
export type JobKeywordType = "hard" | "soft" | "none"

export type JobKeyword = {
    keyword: string;
    level: number;
    skill: JobKeywordType
}

export type JobAnalyzeResult = {
    keywords: JobKeyword[]
    summary: string
}
