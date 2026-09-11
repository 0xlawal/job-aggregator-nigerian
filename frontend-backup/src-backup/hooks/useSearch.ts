import { useState } from 'react'
import axios from 'axios'
import type { Job, SearchResponse } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function useSearch() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = async (query: string, location: string) => {
    if (!query.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.post<SearchResponse>(
        `${API_URL}/api/jobs/search`,
        { query, location: location || undefined },
        { timeout: 30000 }
      )
      setJobs(response.data.jobs || [])
    } catch (err: any) {
      console.error('Search failed:', err)
      setError(
        err.code === 'ECONNABORTED'
          ? 'Search timed out. Please try again.'
          : 'Failed to search jobs. Please try again.'
      )
      setJobs([])
    } finally {
      setIsLoading(false)
    }
  }

  return { jobs, isLoading, error, search }
}