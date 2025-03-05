import { ResumeScore } from "@/app/_components/resume-template-editor/context/ResumeTemplateEditorProvider";
import { TemplateContent } from "@/types/resume";
import axios from "axios"

export type Keyword = {
    keyword: string;
    level: number;
    skill: "hard" | "soft" | "none"
}

export const extractKeywords = (description: string) => {
    return axios.post<{ result: Keyword[] }>('/api/jd/keywords/extract', { description }).
        then(res => res.data.result || [])
}
export const getResumeScore = async (templateContent: TemplateContent, keywords: Keyword[]) => {
    // const experience = templateContent.experiences[0]
    // const content = experience.items
    //     .map((item, index) =>
    //         `Experience Item ${index + 1}\n` +
    //         item.variations.map(v => `${v.id} - ${v.content}`).join('\n'))
    //     .flat().join('\n')

    // const keys = keywords.map(k => `${k.keyword} (${k.level})`).join(',')

    // return axios.post<{ result: ResumeScore[] }>('/api/jd/best-scores', { content, keywords: keys }).
    //     then(res => res.data.result || [])

    const result = await Promise.all(templateContent.experiences.map(experience => {
        const content = experience.items
            .map((item, index) =>
                `Experience Item ${index + 1}\n` +
                item.variations.map(v => `${v.id} - ${v.content}`).join('\n'))
            .flat().join('\n')

        const keys = keywords.map(k => `${k.keyword} (${k.level})`).join(',')

        return axios.post<{ result: ResumeScore[] }>('/api/jd/best-scores', { content, keywords: keys }).
            then(res => res.data.result || [])
    }))

    return result.flat()
}