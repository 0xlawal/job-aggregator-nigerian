from fastapi import APIRouter, HTTPException
from app.models.schemas import JobSearchRequest, JobSearchResponse, Job
from app.services.scraper import scrape_all
from app.services.matcher import score_job_match
from app.config import settings
from datetime import datetime, timedelta, timezone
import asyncio
import logging
from typing import Dict, Tuple

logger = logging.getLogger(__name__)
router = APIRouter()
_cache: Dict[str, Tuple[datetime, list[Job]]] = {}
_cache_lock = asyncio.Lock()


def is_remote(job: Job) -> bool:
    value = f"{job.location} {job.title}".lower()
    return "remote" in value or "anywhere" in value or "worldwide" in value


def posted_at(job: Job):
    if not job.posted_date:
        return None
    try:
        value = datetime.fromisoformat(job.posted_date.replace("Z", "+00:00"))
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    except ValueError:
        return None


async def get_jobs(query: str, location: str) -> tuple[list[Job], bool]:
    key = f"{query.strip().lower()}::{location.strip().lower()}"
    now = datetime.now(timezone.utc)
    async with _cache_lock:
        cached = _cache.get(key)
        if cached and now - cached[0] < timedelta(seconds=settings.CACHE_TTL_SECONDS):
            return cached[1], True

    raw_jobs = await scrape_all(query, location)
    jobs = [Job(**j) for j in raw_jobs][: settings.MAX_RESULTS]
    async with _cache_lock:
        _cache[key] = (now, jobs)
        if len(_cache) > 100:
            oldest = min(_cache, key=lambda item: _cache[item][0])
            _cache.pop(oldest, None)
    return jobs, False

@router.post("/search", response_model=JobSearchResponse)
async def search_jobs(request: JobSearchRequest):
    try:
        logger.info(f"Search: query='{request.query}' location='{request.location}'")
        jobs, cached = await get_jobs(request.query, request.location or "")
        if request.source:
            jobs = [job for job in jobs if job.source.lower() == request.source.lower()]
        if request.work_mode == "remote":
            jobs = [job for job in jobs if is_remote(job)]
        elif request.work_mode == "onsite":
            jobs = [job for job in jobs if not is_remote(job)]
        if request.posted_within != "all":
            hours = {"24h": 24, "7d": 168, "30d": 720}[request.posted_within]
            cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
            jobs = [job for job in jobs if (posted_at(job) or datetime.min.replace(tzinfo=timezone.utc)) >= cutoff]
        if request.sort == "newest":
            jobs.sort(key=lambda job: posted_at(job) or datetime.min.replace(tzinfo=timezone.utc), reverse=True)

        total = len(jobs)
        start = (request.page - 1) * request.page_size
        end = start + request.page_size
        page_jobs = jobs[start:end]
        sources = sorted({job.source for job in jobs if job.source})

        return JobSearchResponse(
            jobs=page_jobs,
            total=total,
            query=request.query,
            location=request.location,
            cached=cached,
            page=request.page,
            page_size=request.page_size,
            has_more=end < total,
            sources=sources,
        )
    except Exception as e:
        logger.error(f"Search failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Search failed. Please try again.")

@router.post("/match")
async def match_jobs(profile: str, job_title: str, job_description: str = ""):
    """Score a job match against a candidate profile."""
    try:
        result = await score_job_match(profile, job_title, job_description)
        return result
    except Exception as e:
        logger.error(f"Match failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Matching failed.")
