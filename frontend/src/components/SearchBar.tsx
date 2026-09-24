import { useState } from 'react'
import { ChevronDown, MapPin, Search, X } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string, location: string) => void
  isLoading: boolean
  initialQuery?: string
  initialLocation?: string
  compact?: boolean
}

export default function SearchBar({ onSearch, isLoading, initialQuery = '', initialLocation = '', compact = false }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const [location, setLocation] = useState(initialLocation)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query, location)
  }

  const clear = () => {
    setQuery('')
    setLocation('')
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={`search-shell ${compact ? 'search-shell-compact' : ''}`}>
        <div className="flex min-w-0 flex-1 items-center gap-3 px-4">
          <Search className="h-5 w-5 shrink-0 text-slate-400" />
          <input
            aria-label="Search jobs"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Job title, skill, or company"
            className="h-14 w-full bg-transparent text-[15px] font-medium text-slate-950 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="hidden h-8 w-px bg-slate-200 md:block" />

        <div className="flex min-w-0 flex-1 items-center gap-3 px-4">
          <MapPin className="h-5 w-5 shrink-0 text-slate-400" />
          <input
            aria-label="Job location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Lagos, Abuja, Remote..."
            className="h-14 w-full bg-transparent text-[15px] font-medium text-slate-950 outline-none placeholder:text-slate-400"
          />
        </div>

        {(query || location) && (
          <button type="button" onClick={clear} aria-label="Clear search" className="hidden rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 md:block">
            <X className="h-4 w-4" />
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="search-button"
        >
          <Search className="h-4 w-4" />
          {isLoading ? 'Searching...' : 'Search jobs'}
        </button>
      </div>
      <div className="mt-2 flex items-center justify-center gap-1 text-[11px] font-medium text-slate-400">
        <ChevronDown className="h-3 w-3" />
        Search across Nigerian and remote job boards
      </div>
    </form>
  )
}
