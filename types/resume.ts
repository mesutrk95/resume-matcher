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

export type ResumeProfessionalSummary = {
    id: string
    content: string
    enabled: boolean
}

export type ResumeSkill = {
    id: string
    content: string
    category: string
    enabled: boolean
}

export type ResumeProject = {
    id: string
    name: string
    content: string
    startDate: string
    endDate: string
    enabled: boolean
}

export type ResumeContactInfo = {
    firstName: string
    lastName: string
    phone: string
    email: string
    linkedIn: string
    twitter: string
    address: string
    country: string
    pronouns: string
}

export type ResumeTargetTitle = {
    id: string
    content: string
    enabled: boolean
}

export type ResumeEducation = {
    id: string
    content: string
    enabled: boolean
    startDate: string
    endDate: string
    location: string
    degree: string
}

export type ResumeContent = {
    experiences: Experience[]
    titles: ResumeTargetTitle[]
    summaries: ResumeProfessionalSummary[]
    educations: ResumeEducation[]
    skills: ResumeSkill[]
    projects: ResumeProject[]
    contactInfo: ResumeContactInfo
}
