import { Job } from '@prisma/client'
import axios from 'axios'

export const getJobs = (page?: number, limit?: number, search?: string) => {
    return axios.get<{ data: Job[], }>('/api/jobs', { params: { page, limit, search } }).then(res => res.data)
}

export const deleteJob = (id: string) => {
    return axios.delete(`/api/jobs/${id}`).then(res => res.data)
}

export const updateJob = (job: Job) => {
    return axios.put(`/api/jobs/${job.id}`, job).then(res => res.data)
}

export const createJob = (job: Job) => {
    return axios.post(`/api/jobs`, job).then(res => res.data)
}