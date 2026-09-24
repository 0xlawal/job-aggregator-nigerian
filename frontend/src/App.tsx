import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, Bookmark, BriefcaseBusiness, ChevronRight, Globe2, MapPin, RefreshCw, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react'
import SearchBar from './components/SearchBar'
import JobCard from './components/JobCard'
import { useSearch } from './hooks/useSearch'
import type { Job, JobFilters } from './types'

const POPULAR_SEARCHES = ['Software Engineer', 'Product Designer', 'Data Analyst', 'Frontend Developer', 'Product Manager']
const EMPTY_FILTERS: JobFilters = { source: 'all', workMode: 'all', postedWithin: 'all' }

function withinDate(date: string | undefined, range: JobFilters['postedWithin']) {
  if (!date || range === 'all') return true
  const parsed = new Date(date).getTime()
  if (Number.isNaN(parsed)) return true
  const age = Date.now() - parsed
  const limit = range === '24h' ? 86400000 : range === '7d' ? 604800000 : 2592000000
  return age <= limit
}

export default function App() {
  const { jobs, total, hasMore, isLoading, error, search } = useSearch()
  const [searched, setSearched] = useState(false)
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [filters, setFilters] = useState<JobFilters>(EMPTY_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [saved, setSaved] = useState<Job[]>(() => {
    try { return JSON.parse(localStorage.getItem('nigerian-jobs:saved') || '[]') as Job[] } catch { return [] }
  })
  const [savedOnly, setSavedOnly] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [sort, setSort] = useState<'relevance' | 'newest'>('relevance')
  const [recentSearches, setRecentSearches] = useState<{ query: string; location: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem('nigerian-jobs:recent') || '[]') } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('nigerian-jobs:saved', JSON.stringify(saved))
  }, [saved])

  const runSearch = (nextQuery: string, nextLocation: string) => {
    setQuery(nextQuery)
    setLocation(nextLocation)
    setSearched(true)
    setSavedOnly(false)
    const nextRecent = [{ query: nextQuery.trim(), location: nextLocation.trim() }, ...recentSearches.filter((item) => item.query.toLowerCase() !== nextQuery.trim().toLowerCase())].slice(0, 5)
    setRecentSearches(nextRecent)
    localStorage.setItem('nigerian-jobs:recent', JSON.stringify(nextRecent))
    search(nextQuery, nextLocation, filters, sort)
  }

  const toggleSave = (job: Job) => {
    setSaved((current) => current.some((item) => item.id === job.id)
      ? current.filter((item) => item.id !== job.id)
      : [job, ...current])
  }

  const sources = useMemo(() => ['all', ...Array.from(new Set(jobs.map((job) => job.source).filter(Boolean))).sort()], [jobs])

  const visibleJobs = useMemo(() => (savedOnly ? saved : jobs).filter((job) => {
    if (filters.source !== 'all' && job.source !== filters.source) return false
    if (filters.workMode === 'remote' && !/remote|anywhere|worldwide/i.test(`${job.location} ${job.title}`)) return false
    if (filters.workMode === 'onsite' && /remote|anywhere|worldwide/i.test(`${job.location} ${job.title}`)) return false
    return withinDate(job.posted_date, filters.postedWithin)
  }), [jobs, saved, savedOnly, filters])

  const activeFilterCount = [filters.source !== 'all', filters.workMode !== 'all', filters.postedWithin !== 'all'].filter(Boolean).length

  const applyFilters = (next: JobFilters) => {
    setFilters(next)
    if (searched && query) search(query, location, next, sort)
  }

  const changeSort = (nextSort: 'relevance' | 'newest') => {
    setSort(nextSort)
    if (query) search(query, location, filters, nextSort)
  }

  return (
    <div className="site-shell min-h-screen overflow-x-hidden">
      <header className="site-header">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <button type="button" onClick={() => { setSearched(false); setSavedOnly(false); setSelectedJob(null) }} className="brand-lockup" aria-label="Nigerian Jobs home">
            <span className="brand-mark"><BriefcaseBusiness className="h-[17px] w-[17px]" /></span>
            <span><strong>Nigerian Jobs</strong><small>Opportunity, collected.</small></span>
          </button>
          <nav className="flex items-center gap-1 sm:gap-2">
            <button type="button" onClick={() => { setSearched(true); setSavedOnly(true) }} className={`nav-button ${savedOnly ? 'nav-button-active' : ''}`}>
              <Bookmark className="h-4 w-4" /> <span>Saved</span>{saved.length > 0 && <b>{saved.length}</b>}
            </button>
            <a href="https://github.com/0xlawal/job-aggregator-nigerian" target="_blank" rel="noreferrer" className="nav-button hidden sm:flex">Open source <ArrowUpRight className="h-3.5 w-3.5" /></a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-5 pb-24 sm:px-8 lg:px-10">
        {!searched ? (
          <section className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow"><span className="live-dot" /> Nigerian + remote opportunities</p>
              <h1>Find work that <em>moves you</em> forward.</h1>
              <p className="hero-lede">One clean search across multiple job boards. Built for people who would rather spend their time applying than hunting.</p>
              <SearchBar onSearch={runSearch} isLoading={isLoading} />
              <div className="popular-row">
                <span>Popular</span>
                {POPULAR_SEARCHES.map((term) => <button key={term} type="button" onClick={() => runSearch(term, '')}>{term}<ChevronRight className="h-3 w-3" /></button>)}
              </div>
              {recentSearches.length > 0 && <div className="recent-row"><span>Recent</span>{recentSearches.slice(0, 3).map((item) => <button key={`${item.query}:${item.location}`} type="button" onClick={() => runSearch(item.query, item.location)}>{item.query}<small>{item.location || 'Anywhere'}</small></button>)}</div>}
            </div>

            <div className="hero-panel" aria-hidden="true">
              <div className="hero-panel-top"><span>THE JOB MARKET</span><span>LIVE SEARCH</span></div>
              <div className="hero-panel-title">One query.<br /><strong>Many boards.</strong></div>
              <div className="signal-lines">
                <div><span>01</span><strong>Local roles</strong><small>Lagos · Abuja · PH · Kano</small></div>
                <div><span>02</span><strong>Remote roles</strong><small>Global companies · distributed teams</small></div>
                <div><span>03</span><strong>One shortlist</strong><small>Save what matters. Compare later.</small></div>
              </div>
              <div className="hero-orbit"><Globe2 className="h-5 w-5" /><span>Search less. See more.</span></div>
            </div>
          </section>
        ) : (
          <section className="results-page">
            <div className="results-search"><SearchBar key={`${query}:${location}`} onSearch={runSearch} isLoading={isLoading} initialQuery={query} initialLocation={location} compact /></div>

            <div className="results-heading">
              <div>
                <p className="eyebrow">{savedOnly ? 'Your shortlist' : 'Search results'}</p>
                <h2>{savedOnly ? 'Saved jobs' : query || 'Jobs'} <span>{savedOnly ? saved.length : total}</span></h2>
                <p>{savedOnly ? 'Roles you kept for a second look.' : location ? `Opportunities around ${location}.` : 'Opportunities from Nigerian and remote boards.'}</p>
              </div>
              <div className="results-actions">
                <button type="button" onClick={() => setFilterOpen((open) => !open)} className={`control-button ${filterOpen || activeFilterCount ? 'control-button-active' : ''}`}>
                  <SlidersHorizontal className="h-4 w-4" /> Filters {activeFilterCount > 0 && <b>{activeFilterCount}</b>}
                </button>
                <label className="sort-control"><span>Sort</span><select value={sort} onChange={(e) => changeSort(e.target.value as 'relevance' | 'newest')}><option value="relevance">Best match</option><option value="newest">Newest first</option></select></label>
                <button type="button" onClick={() => { setFilters(EMPTY_FILTERS); setSavedOnly(false); setSort('relevance'); if (query) search(query, location, EMPTY_FILTERS, 'relevance') }} className="control-button">Reset</button>
              </div>
            </div>

            {filterOpen && (
              <div className="filter-drawer">
                <div><span>Source</span><select value={filters.source} onChange={(e) => applyFilters({ ...filters, source: e.target.value })}><option value="all">All sources</option>{sources.filter((source) => source !== 'all').map((source) => <option key={source}>{source}</option>)}</select></div>
                <div><span>Work mode</span><select value={filters.workMode} onChange={(e) => applyFilters({ ...filters, workMode: e.target.value as JobFilters['workMode'] })}><option value="all">All locations</option><option value="remote">Remote only</option><option value="onsite">On-site / hybrid</option></select></div>
                <div><span>Posted</span><select value={filters.postedWithin} onChange={(e) => applyFilters({ ...filters, postedWithin: e.target.value as JobFilters['postedWithin'] })}><option value="all">Any time</option><option value="24h">Past 24 hours</option><option value="7d">Past 7 days</option><option value="30d">Past 30 days</option></select></div>
              </div>
            )}

            <div className="results-layout">
              <aside className="results-aside">
                <div className="aside-note"><Sparkles className="h-4 w-4" /><span>Curated by search</span></div>
                <div className="aside-block"><span className="aside-label">Your search</span><strong>{query}</strong>{location && <span><MapPin className="h-3.5 w-3.5" /> {location}</span>}</div>
                <div className="aside-block"><span className="aside-label">Shortlist</span><strong>{saved.length} saved</strong><button type="button" onClick={() => setSavedOnly(true)}>View saved <ArrowUpRight className="h-3.5 w-3.5" /></button></div>
                <div className="aside-block hidden lg:block"><span className="aside-label">Sources found</span><div className="source-stack">{sources.filter((source) => source !== 'all').slice(0, 5).map((source) => <span key={source}>{source}</span>)}</div></div>
              </aside>

              <div className="job-feed">
                {isLoading && <div className="job-skeletons">{[1,2,3,4,5].map((item) => <div className="job-skeleton" key={item}><div /><div><span /><span /><span /></div></div>)}</div>}
                {!isLoading && error && <div className="state-card"><RefreshCw className="h-5 w-5" /><h3>Search needs another try.</h3><p>{error}</p><button type="button" onClick={() => search(query, location, filters)}>Try again</button></div>}
                {!isLoading && !error && visibleJobs.length === 0 && <div className="state-card"><Search className="h-5 w-5" /><h3>Nothing matches this search.</h3><p>Try a broader role, remove a filter, or keep the location blank.</p><button type="button" onClick={() => { setFilters(EMPTY_FILTERS); setSavedOnly(false) }}>Clear filters</button></div>}
                {!isLoading && !error && visibleJobs.length > 0 && visibleJobs.map((job, index) => <JobCard key={job.id} job={job} index={index} saved={saved.some((item) => item.id === job.id)} onToggleSave={toggleSave} onView={setSelectedJob} />)}
                {!isLoading && !error && !savedOnly && hasMore && <div className="load-more"><button type="button" onClick={() => search(query, location, filters, sort, Math.floor(jobs.length / 40) + 1, true)}>Load more jobs <ChevronRight className="h-4 w-4" /></button><span>Showing {jobs.length} of {total}</span></div>}
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="site-footer"><div><strong>Nigerian Jobs</strong><span>A sharper way to search.</span></div><a href="https://github.com/0xlawal/job-aggregator-nigerian" target="_blank" rel="noreferrer">Built in public <ArrowUpRight className="h-4 w-4" /></a></footer>

      {selectedJob && <div className="detail-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedJob(null) }}><article className="detail-sheet"><button type="button" className="detail-close" onClick={() => setSelectedJob(null)} aria-label="Close details"><X className="h-5 w-5" /></button><div className="detail-source"><span className="company-mark">{selectedJob.company?.trim()?.charAt(0)?.toUpperCase() || 'J'}</span><span><strong>{selectedJob.company}</strong><small>{selectedJob.source}</small></span></div><h2>{selectedJob.title}</h2><div className="detail-meta"><span><MapPin className="h-3.5 w-3.5" /> {selectedJob.location || 'Nigeria'}</span>{selectedJob.salary && <span>{selectedJob.salary}</span>}</div><div className="detail-copy"><h3>The role</h3><p>{selectedJob.description || 'Open the original listing for the full description, requirements, and application instructions.'}</p></div><div className="detail-actions"><a href={selectedJob.url} target="_blank" rel="noreferrer">Open original listing <ArrowUpRight className="h-4 w-4" /></a><button type="button" onClick={() => toggleSave(selectedJob)}><Bookmark className="h-4 w-4" fill={saved.some((item) => item.id === selectedJob.id) ? 'currentColor' : 'none'} />{saved.some((item) => item.id === selectedJob.id) ? 'Saved' : 'Save job'}</button></div></article></div>}
    </div>
  )
}
