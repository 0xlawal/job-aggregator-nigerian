import { useState } from 'react'
import { Search, MapPin, Loader2 } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string, location: string) => void
  isLoading: boolean
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query, location)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2 flex flex-col md:flex-row gap-2">
        <div className="flex-1 flex items-center gap-2 px-3">
          <Search className="h-5 w-5 text-gray-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Job title, skills, or company"
            className="w-full h-12 bg-transparent outline-none text-sm font-medium"
          />
        </div>

        <div className="hidden md:block w-px bg-gray-200 my-2" />

        <div className="flex-1 flex items-center gap-2 px-3">
          <MapPin className="h-5 w-5 text-gray-400 shrink-0" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location (e.g. Lagos)"
            className="w-full h-12 bg-transparent outline-none text-sm font-medium"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="h-12 px-8 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
          {isLoading ? 'Searching' : 'Search'}
        </button>
      </div>
    </form>
  )
}