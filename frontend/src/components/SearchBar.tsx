import { useState } from 'react'
import { MapPin, Search, X } from 'lucide-react'

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
          <Search className="h-[18px] w-[18px] shrink-0 text-[#777a74]" />
          <input
            aria-label="Search jobs"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Job title, skill, or company"
            className="h-14 w-full bg-transparent text-[14px] font-semibold text-[#101315] outline-none placeholder:text-[#9b9c95]"
          />
        </div>

        <div className="hidden h-8 w-px bg-slate-200 md:block" />

        <div className="flex min-w-0 flex-1 items-center gap-3 px-4">
          <MapPin className="h-[18px] w-[18px] shrink-0 text-[#777a74]" />
          <input
            aria-label="Job location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Lagos, Abuja, Remote..."
            className="h-14 w-full bg-transparent text-[14px] font-semibold text-[#101315] outline-none placeholder:text-[#9b9c95]"
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
      <div className="mt-2 text-center text-[10px] font-semibold text-[#96978f]">Search across Nigerian and remote job boards</div>
    </form>
  )
}
