export interface Job {
  id: string
  title: string
  company: string
  location: string
  description?: string
  salary?: string
  url: string
  source: string
  posted_date?: string
}

export interface SearchResponse {
  jobs: Job[]
  total: number
  query: string
  location?: string
  cached: boolean
}