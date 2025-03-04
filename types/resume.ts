export type Variation = {
    id: string
    content: string
    enabled: boolean
}

export type ExperienceItem = {
    id: string
    description: string
    enabled: boolean
    variations: Variation[]
}

export type Experience = {
    id: string
    companyName: string
    role: string
    startDate: string
    endDate: string
    enabled: boolean
    items: ExperienceItem[]
}

export type Template = {
    id: string
    name: string
    description: string
    experiences: Experience[]
}

