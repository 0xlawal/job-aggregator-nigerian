import { useRef, useState } from 'react'
import axios, { AxiosError } from 'axios'
import type { Job, SearchResponse } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function useSearch() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)

  const search = async (query: string, location: string) => {
    if (!query.trim()) return

    const currentRequest = ++requestId.current

    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.post<SearchResponse>(
        `${API_URL}/api/jobs/search`,
        { query, location: location || undefined },
        { timeout: 30000 }
      )
      if (currentRequest === requestId.current) setJobs(response.data.jobs || [])
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
      }
    } finally {
      setIsLoading(false)
    }
  }

  return { jobs, isLoading, error, search }
}
