import { MapPin, Building2, ExternalLink } from 'lucide-react'
import type { Job } from '../types'

export default function JobCard({ job }: { job: Job }) {
  const sourceColors: Record<string, string> = {
    Jobberman: 'bg-blue-100 text-blue-700',
    Indeed: 'bg-indigo-100 text-indigo-700',
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg hover:border-primary/30 transition-all flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-dark leading-tight line-clamp-2">{job.title}</h3>
        </div>
        {job.source && (
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shrink-0 ${
              sourceColors[job.source] || 'bg-gray-100 text-gray-700'
            }`}
          >
            {job.source}
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4 flex-1">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
          <span className="line-clamp-1">{job.company}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
          <span className="line-clamp-1">{job.location}</span>
        </div>
        {job.salary && (
          <div className="text-sm font-bold text-action">{job.salary}</div>
        )}
      </div>

      <a
        href={job.url}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2 h-10 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition text-sm"
      >
        View Job <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  )
}