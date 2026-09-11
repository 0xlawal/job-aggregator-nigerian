from fastapi import APIRouter, HTTPException
from app.models.schemas import JobSearchRequest, JobSearchResponse, Job
from app.services.scraper import scrape_all
from app.services.matcher import score_job_match
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/search", response_model=JobSearchResponse)
async def search_jobs(request: JobSearchRequest):
    try:
        logger.info(f"Search: query='{request.query}' location='{request.location}'")
        raw_jobs = await scrape_all(request.query, request.location or "")

        jobs = [Job(**j) for j in raw_jobs]

        return JobSearchResponse(
            jobs=jobs,
            total=len(jobs),
            query=request.query,
            location=request.location,
            cached=False,
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