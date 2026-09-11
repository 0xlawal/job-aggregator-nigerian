import { useState } from 'react'
import { Briefcase, Search, TrendingUp } from 'lucide-react'
import SearchBar from './components/SearchBar'
import JobCard from './components/JobCard'
import { useSearch } from './hooks/useSearch'

export default function App() {
  const { jobs, isLoading, error, search } = useSearch()
  const [searched, setSearched] = useState(false)

  const handleSearch = (query: string, location: string) => {
    setSearched(true)
    search(query, location)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg">Nigerian Jobs</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-primary">AI-Powered Matching</div>
            </div>
          </div>
          <a
            href="https://github.com/0xlawal/job-aggregator-nigerian"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-bold text-gray-600 hover:text-primary transition"
          >
            GitHub
          </a>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {!searched && (
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-dark mb-4">
              Find Your Next <span className="text-primary">Nigerian Job</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Search thousands of jobs from Indeed, Jobberman, and more — with AI-powered matching.
            </p>
          </div>
        )}

        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        {/* Results */}
        <div className="mt-10">
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-4 text-gray-600 font-medium">Searching across job boards…</p>
            </div>
          )}

          {error && (
            <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
              {error}
            </div>
          )}

          {!isLoading && searched && jobs.length === 0 && !error && (
            <div className="text-center py-12 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">No jobs found. Try a different search.</p>
            </div>
          )}

          {!isLoading && jobs.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                  <TrendingUp className="h-4 w-4 text-action" />
                  {jobs.length} jobs found
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="border-t border-gray-200 py-6 mt-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-gray-500">
          Built by <a href="https://github.com/0xlawal" className="font-bold text-primary hover:underline">0xlawal</a> · Data sourced from public job boards
        </div>
      </footer>
    </div>
  )
}