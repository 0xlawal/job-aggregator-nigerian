import { ArrowUpRight, Bookmark, Building2, MapPin } from 'lucide-react'
import type { Job } from '../types'

interface JobCardProps {
  job: Job
  index: number
  saved: boolean
  onToggleSave: (job: Job) => void
  onView: (job: Job) => void
}

function postedLabel(date?: string) {
  if (!date) return 'Recently listed'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  const days = Math.max(0, Math.floor((Date.now() - parsed.getTime()) / 86400000))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  return parsed.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function JobCard({ job, index, saved, onToggleSave, onView }: JobCardProps) {
  const remote = /remote|anywhere|worldwide/i.test(`${job.location} ${job.title}`)
  return (
    <article className="job-row" style={{ animationDelay: `${Math.min(index * 45, 300)}ms` }}>
      <span className="job-index">{String(index + 1).padStart(2, '0')}</span>
      <button type="button" className="job-main" onClick={() => onView(job)}>
        <span className="job-company-line"><span className="company-mark">{job.company?.trim()?.charAt(0)?.toUpperCase() || 'J'}</span><span>{job.company || 'Unknown company'}</span>{job.source && <small>{job.source}</small>}</span>
        <strong>{job.title}</strong>
        <span className="job-meta"><span><MapPin className="h-3.5 w-3.5" />{job.location || 'Nigeria'}</span><span><Building2 className="h-3.5 w-3.5" />{postedLabel(job.posted_date)}</span>{remote && <b>Remote</b>}{job.salary && <b>{job.salary}</b>}</span>
      </button>
      <div className="job-actions">
        <button type="button" onClick={() => onToggleSave(job)} className={`icon-action ${saved ? 'icon-action-active' : ''}`} aria-label={saved ? 'Remove saved job' : 'Save job'}><Bookmark className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} /></button>
        <button type="button" onClick={() => onView(job)} className="details-action">View <ArrowUpRight className="h-4 w-4" /></button>
      </div>
    </article>
  )
}
