import { useRef, useState } from 'react'
import axios, { AxiosError } from 'axios'
import type { Job, JobFilters, SearchResponse } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function useSearch() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)

  const search = async (query: string, location: string, filters?: JobFilters) => {
    if (!query.trim()) return

    const currentRequest = ++requestId.current

    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.post<SearchResponse>(
        `${API_URL}/api/jobs/search`,
        {
          query,
          location: location || undefined,
          page: 1,
          page_size: 40,
          source: filters?.source !== 'all' ? filters?.source : undefined,
          work_mode: filters?.workMode || 'all',
          posted_within: filters?.postedWithin || 'all',
        },
        { timeout: 30000 }
      )
      if (currentRequest === requestId.current) {
        setJobs(response.data.jobs || [])
        setTotal(response.data.total || 0)
      }
    } catch (err) {
      console.error('Search failed:', err)
      const axiosError = err as AxiosError
      if (currentRequest === requestId.current) {
        setError(
          axiosError.code === 'ECONNABORTED'
            ? 'The job boards took too long to respond. Try a narrower search.'
            : axiosError.response?.status && axiosError.response.status >= 500
              ? 'The job service is temporarily unavailable. Please try again shortly.'
              : 'We could not complete that search. Please check your connection and try again.'
        )
        setJobs([])
        setTotal(0)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return { jobs, total, isLoading, error, search }
}
