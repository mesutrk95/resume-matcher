export type Variation = {
    id: string
    content: string
}

export type ExperienceItem = {
    id: string
    description: string
    variations: Variation[]
}

export type Experience = {
    id: string
    companyName: string
    role: string
    startDate: string
    endDate: string
    items: ExperienceItem[]
}

export type Template = {
    id: string
    name: string
    description: string
    experiences: Experience[]
}

