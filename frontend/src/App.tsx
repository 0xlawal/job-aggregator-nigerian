import { useState } from 'react'
import { Briefcase, Search, TrendingUp, Sparkles, Globe, Zap, MapPin } from 'lucide-react'
import SearchBar from './components/SearchBar'
import JobCard from './components/JobCard'
import { useSearch } from './hooks/useSearch'

const POPULAR_SEARCHES = [
  'Software Developer',
  'Data Analyst',
  'Product Manager',
  'Graphic Designer',
  'Customer Service',
  'Marketing',
]

export default function App() {
  const { jobs, isLoading, error, search } = useSearch()
  const [searched, setSearched] = useState(false)

  const handleSearch = (query: string, location: string) => {
    setSearched(true)
    search(query, location)
  }

  const handleQuickSearch = (term: string) => {
    setSearched(true)
    search(term, '')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
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
          <>
            {/* Hero */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-bold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Aggregating from 5+ job sources
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-dark mb-4">
                Find Your Next <span className="text-primary">Nigerian Job</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Search thousands of jobs from Nigeria and remote boards — all in one place.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">5+</div>
                <div className="text-xs text-gray-500 font-medium">Job Sources</div>
              </div>
              <div className="text-center border-x border-gray-200">
                <div className="text-2xl font-bold text-primary">100+</div>
                <div className="text-xs text-gray-500 font-medium">Live Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">0₦</div>
                <div className="text-xs text-gray-500 font-medium">Always Free</div>
              </div>
            </div>

            {/* Search */}
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />

            {/* Popular Searches */}
            <div className="max-w-3xl mx-auto mt-6">
              <div className="text-center text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                Popular Searches
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleQuickSearch(term)}
                    className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-full hover:border-primary hover:text-primary transition"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-16">
              <div className="p-6 bg-white rounded-2xl border border-gray-200">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold mb-1">Multi-Source</h3>
                <p className="text-sm text-gray-600">Jobs from Nigeria and global remote boards.</p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-gray-200">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-3">
                  <Zap className="h-5 w-5 text-action" />
                </div>
                <h3 className="font-bold mb-1">Fast & Simple</h3>
                <p className="text-sm text-gray-600">One search, results in seconds. No sign-up.</p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-gray-200">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-bold mb-1">Location Aware</h3>
                <p className="text-sm text-gray-600">Filter by Nigerian cities or browse remote roles.</p>
              </div>
            </div>
          </>
        )}

        {searched && (
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        )}

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
            <div className="text-center py-12 text-gray-500 max-w-md mx-auto">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-bold text-lg mb-1">No jobs found</p>
              <p className="text-sm">Try a different keyword or clear the location filter.</p>
            </div>
          )}

          {!isLoading && jobs.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                  <TrendingUp className="h-4 w-4 text-action" />
                  {jobs.length} jobs found
                </div>
                <button
                  onClick={() => setSearched(false)}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  New Search
                </button>
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