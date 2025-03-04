export type Variation = {
    id: string
    text: string
}

export type ExperienceItem = {
    id: string
    title: string
    variations: Variation[]
}

export type Experience = {
    id: string
    company: string
    position: string
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

