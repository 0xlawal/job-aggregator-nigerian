import { Bookmark, Building2, ExternalLink, MapPin } from 'lucide-react'
import type { Job } from '../types'

interface JobCardProps {
  job: Job
  saved: boolean
  onToggleSave: (job: Job) => void
  onView: (job: Job) => void
}

function postedLabel(date?: string) {
  if (!date) return 'Recently posted'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  const days = Math.max(0, Math.floor((Date.now() - parsed.getTime()) / 86400000))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  return parsed.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function JobCard({ job, saved, onToggleSave, onView }: JobCardProps) {
  const remote = /remote/i.test(`${job.location} ${job.title}`)

  return (
    <article className="job-card group">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="company-mark">{job.company?.trim()?.charAt(0)?.toUpperCase() || 'J'}</div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{job.company}</p>
            <p className="mt-1 text-xs font-medium text-slate-400">{job.source || 'Job board'}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onToggleSave(job)}
          aria-label={saved ? 'Remove saved job' : 'Save job'}
          className={`save-button ${saved ? 'save-button-active' : ''}`}
        >
          <Bookmark className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>

      <button type="button" onClick={() => onView(job)} className="block w-full text-left">
        <h3 className="line-clamp-2 text-[17px] font-bold leading-6 tracking-[-0.02em] text-slate-950 transition group-hover:text-primary">{job.title}</h3>
      </button>

      <div className="mt-4 flex flex-wrap gap-2">
        {remote && <span className="tag tag-green">Remote</span>}
        {job.salary && <span className="tag tag-neutral">{job.salary}</span>}
      </div>

      <div className="mt-5 space-y-2 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="truncate">{job.location || 'Nigeria'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
          <span>{postedLabel(job.posted_date)}</span>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4">
        <button type="button" onClick={() => onView(job)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50">
          Details
        </button>
        <a href={job.url} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 py-2.5 text-sm font-bold text-white transition hover:bg-primary">
          Apply <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </article>
  )
}
