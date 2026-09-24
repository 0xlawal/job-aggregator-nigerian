import { useEffect, useMemo, useState } from 'react'
import { Bookmark, BriefcaseBusiness, ChevronDown, Clock3, ExternalLink, Filter, Globe2, MapPin, RefreshCw, Search, Sparkles, X } from 'lucide-react'
import SearchBar from './components/SearchBar'
import JobCard from './components/JobCard'
import { useSearch } from './hooks/useSearch'
import type { Job, JobFilters } from './types'

const POPULAR_SEARCHES = ['Software Engineer', 'Product Designer', 'Data Analyst', 'Frontend Developer', 'Customer Success', 'Marketing']
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
  const { jobs, isLoading, error, search } = useSearch()
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

  useEffect(() => {
    localStorage.setItem('nigerian-jobs:saved', JSON.stringify(saved))
  }, [saved])

  const handleSearch = (nextQuery: string, nextLocation: string) => {
    setQuery(nextQuery)
    setLocation(nextLocation)
    setSearched(true)
    setSavedOnly(false)
    search(nextQuery, nextLocation)
  }

  const toggleSave = (job: Job) => {
    setSaved((current) => current.some((item) => item.id === job.id) ? current.filter((item) => item.id !== job.id) : [job, ...current])
  }

  const sources = useMemo(() => ['all', ...Array.from(new Set(jobs.map((job) => job.source).filter(Boolean))).sort()], [jobs])

  const visibleJobs = useMemo(() => jobs.filter((job) => {
    if (savedOnly && !saved.some((item) => item.id === job.id)) return false
    if (filters.source !== 'all' && job.source !== filters.source) return false
    if (filters.workMode === 'remote' && !/remote/i.test(`${job.location} ${job.title}`)) return false
    if (filters.workMode === 'onsite' && /remote/i.test(`${job.location} ${job.title}`)) return false
    return withinDate(job.posted_date, filters.postedWithin)
  }), [jobs, saved, savedOnly, filters])

  const activeFilterCount = [filters.source !== 'all', filters.workMode !== 'all', filters.postedWithin !== 'all'].filter(Boolean).length

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-[#f7f8fa]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <button type="button" onClick={() => { setSearched(false); setSavedOnly(false) }} className="flex items-center gap-3 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm"><BriefcaseBusiness className="h-5 w-5" /></div>
            <div><div className="text-[15px] font-black tracking-tight text-slate-950">Nigerian Jobs</div><div className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Search once. Apply smarter.</div></div>
          </button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => { setSavedOnly(true); setSearched(true) }} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition ${savedOnly ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-white'}`}>
              <Bookmark className="h-4 w-4" /> <span className="hidden sm:inline">Saved</span>{saved.length > 0 && <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-white">{saved.length}</span>}
            </button>
            <a href="https://github.com/0xlawal/job-aggregator-nigerian" target="_blank" rel="noreferrer" className="hidden rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-white sm:block">GitHub</a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pt-16">
        {!searched ? (
          <section className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 shadow-sm"><Sparkles className="h-3.5 w-3.5 text-primary" /> Jobs from multiple sources</div>
              <h1 className="max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[76px]">Your next opportunity is <span className="text-primary">closer than you think.</span></h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">Search Nigerian and remote jobs from multiple boards in one place. Less tab switching. More relevant opportunities.</p>
            </div>

            <div className="mt-10"><SearchBar onSearch={handleSearch} isLoading={isLoading} /></div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Try</span>
              {POPULAR_SEARCHES.map((term) => <button key={term} onClick={() => handleSearch(term, '')} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:text-primary">{term}</button>)}
            </div>

            <div className="mt-16 grid gap-4 md:grid-cols-[1.4fr_1fr_1fr]">
              <div className="rounded-[24px] bg-slate-950 p-6 text-white"><Globe2 className="mb-10 h-6 w-6 text-blue-300" /><p className="text-2xl font-black tracking-tight">One search, many boards.</p><p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">Bring scattered opportunities together without opening a dozen tabs.</p></div>
              <div className="rounded-[24px] border border-slate-200 bg-white p-6"><Clock3 className="mb-10 h-6 w-6 text-primary" /><p className="text-xl font-black tracking-tight">Fresh listings</p><p className="mt-2 text-sm leading-6 text-slate-500">Find recent roles before they disappear into crowded job feeds.</p></div>
              <div className="rounded-[24px] border border-slate-200 bg-white p-6"><MapPin className="mb-10 h-6 w-6 text-primary" /><p className="text-xl font-black tracking-tight">Nigeria + remote</p><p className="mt-2 text-sm leading-6 text-slate-500">Search by city or keep your options open with remote roles.</p></div>
            </div>
          </section>
        ) : (
          <section>
            <div className="mx-auto max-w-5xl"><SearchBar onSearch={handleSearch} isLoading={isLoading} initialQuery={query} initialLocation={location} compact /></div>

            <div className="mt-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">{savedOnly ? 'Your shortlist' : 'Search results'}</p><h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-slate-950">{savedOnly ? 'Saved jobs' : query || 'Jobs'} <span className="text-slate-400">{!savedOnly && `· ${visibleJobs.length}`}</span></h2><p className="mt-1 text-sm text-slate-500">{savedOnly ? 'Keep interesting roles here while you compare opportunities.' : location ? `Showing opportunities around ${location}.` : 'Showing opportunities across Nigeria and remote boards.'}</p></div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setFilterOpen((open) => !open)} className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-bold transition ${filterOpen || activeFilterCount ? 'border-primary bg-blue-50 text-primary' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}><Filter className="h-4 w-4" /> Filters {activeFilterCount > 0 && <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-white">{activeFilterCount}</span>}<ChevronDown className="h-4 w-4" /></button>
                <button type="button" onClick={() => { setFilters(EMPTY_FILTERS); setSavedOnly(false) }} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-600 transition hover:border-slate-300">Clear</button>
              </div>
            </div>

            {filterOpen && (
              <div className="mt-5 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid gap-5 md:grid-cols-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Source<select value={filters.source} onChange={(e) => setFilters({ ...filters, source: e.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-slate-700 outline-none focus:border-primary"><option value="all">All sources</option>{sources.filter(Boolean).filter((source) => source !== 'all').map((source) => <option key={source}>{source}</option>)}</select></label>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Work mode<select value={filters.workMode} onChange={(e) => setFilters({ ...filters, workMode: e.target.value as JobFilters['workMode'] })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-slate-700 outline-none focus:border-primary"><option value="all">All locations</option><option value="remote">Remote only</option><option value="onsite">On-site / hybrid</option></select></label>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Posted<select value={filters.postedWithin} onChange={(e) => setFilters({ ...filters, postedWithin: e.target.value as JobFilters['postedWithin'] })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-slate-700 outline-none focus:border-primary"><option value="all">Any time</option><option value="24h">Past 24 hours</option><option value="7d">Past 7 days</option><option value="30d">Past 30 days</option></select></label>
                </div>
              </div>
            )}

            <div className="mt-7">
              {isLoading && <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map((i) => <div key={i} className="min-h-[330px] animate-pulse rounded-[22px] border border-slate-200 bg-white p-5"><div className="h-10 w-10 rounded-xl bg-slate-100" /><div className="mt-8 h-5 w-3/4 rounded bg-slate-100" /><div className="mt-3 h-4 w-1/2 rounded bg-slate-100" /><div className="mt-12 h-4 w-2/3 rounded bg-slate-100" /><div className="mt-20 h-10 rounded-xl bg-slate-100" /></div>)}</div>}

              {!isLoading && error && <div className="mx-auto max-w-2xl rounded-[22px] border border-amber-200 bg-amber-50 p-6 text-center"><RefreshCw className="mx-auto h-6 w-6 text-amber-600" /><h3 className="mt-3 font-black text-amber-950">Search needs another try</h3><p className="mt-1 text-sm text-amber-800">{error}</p><button onClick={() => search(query, location)} className="mt-4 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white">Try again</button></div>}

              {!isLoading && !error && visibleJobs.length === 0 && <div className="mx-auto max-w-lg rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center"><Search className="mx-auto h-9 w-9 text-slate-300" /><h3 className="mt-4 text-xl font-black text-slate-950">Nothing matches these filters</h3><p className="mt-2 text-sm leading-6 text-slate-500">Try a broader location, remove a filter, or search for a different role.</p><button onClick={() => setFilters(EMPTY_FILTERS)} className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white">Reset filters</button></div>}

              {!isLoading && visibleJobs.length > 0 && <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{visibleJobs.map((job) => <JobCard key={job.id} job={job} saved={saved.some((item) => item.id === job.id)} onToggleSave={toggleSave} onView={setSelectedJob} />)}</div>}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-8"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><span>Built for a simpler Nigerian job search.</span><a href="https://github.com/0xlawal/job-aggregator-nigerian" target="_blank" rel="noreferrer" className="font-bold text-slate-600 hover:text-primary">Open source on GitHub ↗</a></div></footer>

      {selectedJob && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedJob(null) }}><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-[28px] bg-white p-6 shadow-2xl sm:rounded-[28px] sm:p-8"><div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><div className="company-mark">{selectedJob.company?.charAt(0)?.toUpperCase() || 'J'}</div><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{selectedJob.company}</p><p className="mt-1 text-xs text-slate-400">{selectedJob.source}</p></div></div><button onClick={() => setSelectedJob(null)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><h2 className="mt-7 text-3xl font-black leading-tight tracking-[-0.04em] text-slate-950">{selectedJob.title}</h2><div className="mt-4 flex flex-wrap gap-2"><span className="tag tag-neutral"><MapPin className="mr-1 inline h-3 w-3" />{selectedJob.location}</span>{selectedJob.salary && <span className="tag tag-green">{selectedJob.salary}</span>}</div><div className="mt-7 border-t border-slate-100 pt-6"><h3 className="font-black text-slate-950">About this role</h3><p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{selectedJob.description || 'Open the original listing to see the full job description, requirements, and application instructions.'}</p></div><div className="mt-8 flex flex-col gap-3 sm:flex-row"><a href={selectedJob.url} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 py-3 font-bold text-white hover:bg-primary">Open original listing <ExternalLink className="h-4 w-4" /></a><button onClick={() => toggleSave(selectedJob)} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50"><Bookmark className="h-4 w-4" />{saved.some((item) => item.id === selectedJob.id) ? 'Saved' : 'Save job'}</button></div></div></div>}
    </div>
  )
}
