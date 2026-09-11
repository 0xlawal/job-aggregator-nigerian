import httpx
import logging
from typing import List, Dict
from urllib.parse import quote_plus

logger = logging.getLogger(__name__)

# A generic User-Agent is still good practice for API requests
HEADERS = {
    "User-Agent": "JobAggregator/1.0 (https://github.com/0xlawal/job-aggregator-nigerian)"
}

async def fetch_hotnigerianjobs(query: str, location: str = "") -> List[Dict]:
    """
    Fetch jobs from HotNigerianJobs via the Parse.bot API.
    Requires an API key from https://parse.bot.
    """
    jobs = []
    api_key = "pmx_b3c2074f12ea8cd8ce8bdb64743019f3"
    if not api_key or api_key == "pmx_b3c2074f12ea8cd8ce8bdb64743019f3":
        logger.warning("HotNigerianJobs API key not configured. Skipping this source.")
        return jobs

    try:
        url = f"https://api.parse.bot/scraper/d41feb62-afc3-401a-a12e-3bf6c0b5cf31/search_jobs?query={quote_plus(query)}"
        headers = {"X-API-Key": api_key}

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()

        # The API response structure should be checked on parse.bot.
        # This assumes a 'jobs' key in the JSON response.
        for item in data.get("jobs", []):
            jobs.append({
                "id": f"hnj-{item.get('id', hash(item.get('url', '')) % 10000000)}",
                "title": item.get("title", "No Title"),
                "company": item.get("company", "Unknown"),
                "location": item.get("location", location or "Nigeria"),
                "description": item.get("description"),
                "salary": item.get("salary"),
                "url": item.get("url", ""),
                "source": "HotNigerianJobs",
            })
        logger.info(f"HotNigerianJobs: fetched {len(jobs)} jobs")
    except Exception as e:
        logger.error(f"HotNigerianJobs fetch failed: {e}")
    return jobs

async def fetch_from_arbeitnow(query: str) -> List[Dict]:
    """
    Fetch jobs from Arbeitnow's free, public, no-auth API.
    Docs: https://www.arbeitnow.com/api/job-board-api
    """
    jobs = []
    try:
        # The Arbeitnow API returns all jobs; we'll filter client-side.
        url = "https://www.arbeitnow.com/api/job-board-api"
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(url, headers=HEADERS)
            response.raise_for_status()
            data = response.json()

        query_lower = query.lower()
        for item in data.get("data", []):
            # Filter by query to find relevant jobs
            if query_lower in item.get("title", "").lower() or \
               query_lower in item.get("description", "").lower():
                jobs.append({
                    "id": f"arn-{item.get('slug', hash(item.get('url', '')) % 10000000)}",
                    "title": item.get("title", "No Title"),
                    "company": item.get("company_name", "Unknown"),
                    "location": item.get("location", "Remote"),
                    "description": item.get("description"),
                    "salary": None, # Arbeitnow API doesn't provide salary
                    "url": item.get("url", ""),
                    "source": "Arbeitnow",
                })
        logger.info(f"Arbeitnow: fetched {len(jobs)} jobs for query '{query}'")
    except Exception as e:
        logger.error(f"Arbeitnow fetch failed: {e}")
    return jobs

async def fetch_from_remotive(query: str) -> List[Dict]:
    """
    Fetch jobs from Remotive's free, public, no-auth API.
    Docs: https://remotive.com/api/remote-jobs
    """
    jobs = []
    try:
        # The Remotive API supports a search query parameter.
        url = f"https://remotive.com/api/remote-jobs?search={quote_plus(query)}"
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(url, headers=HEADERS)
            response.raise_for_status()
            data = response.json()

        for item in data.get("jobs", []):
            jobs.append({
                "id": f"rem-{item.get('id', hash(item.get('url', '')) % 10000000)}",
                "title": item.get("title", "No Title"),
                "company": item.get("company_name", "Unknown"),
                "location": item.get("candidate_required_location", "Remote"),
                "description": item.get("description"),
                "salary": item.get("salary"),
                "url": item.get("url", ""),
                "source": "Remotive",
            })
        logger.info(f"Remotive: fetched {len(jobs)} jobs")
    except Exception as e:
        logger.error(f"Remotive fetch failed: {e}")
    return jobs

async def fetch_from_jobicy(query: str) -> List[Dict]:
    """
    Fetch jobs from Jobicy's free, public, no-auth API.
    Docs: https://github.com/Jobicy/remote-jobs-api
    """
    jobs = []
    try:
        # Jobicy API can take a 'tag' parameter for the query.
        url = f"https://jobicy.com/api/v2/remote-jobs?count=50&tag={quote_plus(query)}"
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(url, headers=HEADERS)
            response.raise_for_status()
            data = response.json()

        for item in data.get("jobs", []):
            jobs.append({
                "id": f"jcy-{item.get('id', hash(item.get('url', '')) % 10000000)}",
                "title": item.get("jobTitle", "No Title"),
                "company": item.get("companyName", "Unknown"),
                "location": item.get("jobGeo", "Remote"),
                "description": item.get("jobExcerpt"),
                "salary": None, # Jobicy API doesn't provide salary
                "url": item.get("url", ""),
                "source": "Jobicy",
            })
        logger.info(f"Jobicy: fetched {len(jobs)} jobs")
    except Exception as e:
        logger.error(f"Jobicy fetch failed: {e}")
    return jobs

async def fetch_from_himalayas(query: str) -> List[Dict]:
    """
    Fetch jobs from Himalayas' free, public, no-auth API.
    Docs: https://himalayas.app/docs/remote-jobs-api
    """
    jobs = []
    try:
        # The Himalayas API has a search endpoint.
        url = f"https://himalayas.app/jobs/api/search?q={quote_plus(query)}"
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(url, headers=HEADERS)
            response.raise_for_status()
            data = response.json()

        for item in data.get("jobs", []):
            jobs.append({
                "id": f"him-{item.get('id', hash(item.get('applicationLink', '')) % 10000000)}",
                "title": item.get("title", "No Title"),
                "company": item.get("companyName", "Unknown"),
                "location": item.get("location", "Remote"),
                "description": item.get("description"),
                "salary": item.get("salary"),
                "url": item.get("applicationLink", ""),
                "source": "Himalayas",
            })
        logger.info(f"Himalayas: fetched {len(jobs)} jobs")
    except Exception as e:
        logger.error(f"Himalayas fetch failed: {e}")
    return jobs

def filter_by_location(jobs: List[Dict], location: str) -> List[Dict]:
    """Filter jobs by location. Keeps remote jobs and matches location text."""
    if not location or not location.strip():
        return jobs

    loc_lower = location.strip().lower()
    matched = []
    remote_jobs = []

    for job in jobs:
        job_loc = (job.get("location") or "").lower()
        if loc_lower in job_loc:
            matched.append(job)
        elif "remote" in job_loc or "anywhere" in job_loc or "worldwide" in job_loc:
            remote_jobs.append(job)

    # If we found local matches, return those + remote
    if matched:
        return matched + remote_jobs
    # Otherwise, just return remote jobs (better than nothing)
    return remote_jobs if remote_jobs else jobs

async def scrape_all(query: str, location: str = "") -> List[Dict]:
    """
    Aggregate jobs from multiple reliable, free API sources.
    """
    all_jobs = []
    import asyncio
    tasks = [
        fetch_hotnigerianjobs(query, location),
        fetch_from_arbeitnow(query),
        fetch_from_remotive(query),
        fetch_from_jobicy(query),
        fetch_from_himalayas(query),
    ]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    for result in results:
        if isinstance(result, Exception):
            logger.error(f"A job source failed: {result}")
        elif result:
            all_jobs.extend(result)

    # ✅ Filter by location
    all_jobs = filter_by_location(all_jobs, location)

    # De-duplicate
    seen = set()
    unique_jobs = []
    for job in all_jobs:
        key = (job["title"].lower(), job["company"].lower())
        if key not in seen:
            seen.add(key)
            unique_jobs.append(job)

    logger.info(f"Total aggregated jobs after de-duplication: {len(unique_jobs)}")
    return unique_jobs