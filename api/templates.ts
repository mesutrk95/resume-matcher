// import { Template } from '@/types/resume'
import { Template } from '@/types/resume'
import { ResumeTemplate } from '@prisma/client'
import axios from 'axios'

export const getTemplates = () => {
    return axios.get<{ data: ResumeTemplate[] }>('/api/templates').then(res => res.data)
}

export const deleteTemplate = (id: string) => {
    return axios.delete(`/api/templates/${id}`).then(res => res.data)
}

export const updateTemplate = (template: ResumeTemplate | Template) => { 
    return axios.put(`/api/templates/${template.id}`, template).then(res => res.data)
}

export const createTemplate = (template: ResumeTemplate | Template) => { 
    return axios.post(`/api/templates`, template).then(res => res.data)
}