import { useRef, useState } from 'react'
import axios, { AxiosError } from 'axios'
import type { Job, JobFilters, SearchResponse } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function useSearch() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)

  const search = async (query: string, location: string, filters?: JobFilters, sort: 'relevance' | 'newest' = 'relevance', page = 1, append = false) => {
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
          page,
          page_size: 40,
          source: filters?.source !== 'all' ? filters?.source : undefined,
          work_mode: filters?.workMode || 'all',
          posted_within: filters?.postedWithin || 'all',
          sort,
        },
        { timeout: 30000 }
      )
      if (currentRequest === requestId.current) {
        setJobs((current) => append ? [...current, ...(response.data.jobs || [])] : (response.data.jobs || []))
        setTotal(response.data.total || 0)
        setHasMore(Boolean(response.data.has_more))
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
        setHasMore(false)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return { jobs, total, hasMore, isLoading, error, search }
}
