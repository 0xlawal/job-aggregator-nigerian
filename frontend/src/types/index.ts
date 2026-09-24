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

export type JobFilters = {
  source: string
  workMode: 'all' | 'remote' | 'onsite'
  postedWithin: 'all' | '24h' | '7d' | '30d'
}

export interface SearchResponse {
  jobs: Job[]
  total: number
  query: string
  location?: string
  cached: boolean
  page?: number
  page_size?: number
  has_more?: boolean
  sources?: string[]
}
