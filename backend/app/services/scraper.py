import httpx
import logging
import hashlib
import re
from typing import List, Dict, Optional
from urllib.parse import quote_plus
from app.config import settings

logger = logging.getLogger(__name__)

# A generic User-Agent is still good practice for API requests
HEADERS = {
    "User-Agent": "JobAggregator/1.0 (https://github.com/0xlawal/job-aggregator-nigerian)"
}


def extract_posted_date(item: Dict) -> Optional[str]:
    """Read the common date fields exposed by the different job APIs."""
    for key in ("posted_date", "publication_date", "created_at", "date", "pubDate", "jobPosted", "postedAt"):
        value = item.get(key)
        if value:
            return str(value)
    return None

async def fetch_hotnigerianjobs(query: str, location: str = "") -> List[Dict]:
    """
    Fetch jobs from HotNigerianJobs via the Parse.bot API.
    Requires an API key from https://parse.bot.
    """
    jobs = []
    api_key = settings.HOTNIGERIANJOBS_API_KEY
    if not api_key:
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
                "posted_date": extract_posted_date(item),
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

        query_terms = tokenize(query)
        for item in data.get("data", []):
            title = item.get("title", "")
            description = item.get("description", "")
            if matches_query(query_terms, f"{title} {description}"):
                jobs.append({
                    "id": f"arn-{item.get('slug', hash(item.get('url', '')) % 10000000)}",
                    "title": item.get("title", "No Title"),
                    "company": item.get("company_name", "Unknown"),
                    "location": item.get("location", "Remote"),
                    "description": item.get("description"),
                    "salary": None, # Arbeitnow API doesn't provide salary
                    "url": item.get("url", ""),
                    "source": "Arbeitnow",
                    "posted_date": extract_posted_date(item),
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
                "posted_date": extract_posted_date(item),
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
                "posted_date": extract_posted_date(item),
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
                "posted_date": extract_posted_date(item),
            })
        logger.info(f"Himalayas: fetched {len(jobs)} jobs")
    except Exception as e:
        logger.error(f"Himalayas fetch failed: {e}")
    return jobs


async def fetch_from_adzuna(query: str, location: str = "") -> List[Dict]:
    """Fetch Nigerian jobs from Adzuna's public API when credentials are configured."""
    jobs = []
    if not settings.ADZUNA_APP_ID or not settings.ADZUNA_APP_KEY:
        logger.info("Adzuna credentials not configured. Skipping this source.")
        return jobs

    try:
        # Adzuna's Nigeria feed is useful for local roles and complements the remote boards.
        url = "https://api.adzuna.com/v1/api/jobs/ng/search/1"
        params = {
            "app_id": settings.ADZUNA_APP_ID,
            "app_key": settings.ADZUNA_APP_KEY,
            "results_per_page": 50,
            "what": query,
        }
        if location.strip():
            params["where"] = location.strip()

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(url, params=params, headers=HEADERS)
            response.raise_for_status()
            data = response.json()

        for item in data.get("results", []):
            company = item.get("company") or {}
            location_data = item.get("location") or {}
            jobs.append({
                "id": f"adz-{item.get('id', hash(item.get('redirect_url', '')) % 10000000)}",
                "title": item.get("title", "No Title"),
                "company": company.get("display_name", "Unknown"),
                "location": location_data.get("display_name", location or "Nigeria"),
                "description": item.get("description"),
                "salary": _format_salary(item),
                "url": item.get("redirect_url", ""),
                "source": "Adzuna",
                "posted_date": extract_posted_date(item),
            })
        logger.info(f"Adzuna: fetched {len(jobs)} jobs")
    except Exception as e:
        logger.error(f"Adzuna fetch failed: {e}")
    return jobs


def _format_salary(item: Dict) -> Optional[str]:
    minimum = item.get("salary_min")
    maximum = item.get("salary_max")
    if minimum and maximum:
        return f"₦{minimum:,.0f}–₦{maximum:,.0f}"
    if minimum:
        return f"From ₦{minimum:,.0f}"
    if maximum:
        return f"Up to ₦{maximum:,.0f}"
    return None

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
        fetch_from_adzuna(query, location),
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

    unique_jobs = deduplicate_jobs(all_jobs)

    logger.info(f"Total aggregated jobs after de-duplication: {len(unique_jobs)}")
    return unique_jobs


def tokenize(value: str) -> List[str]:
    return [token for token in re.findall(r"[a-z0-9+#.-]+", value.lower()) if len(token) > 1]


def matches_query(tokens: List[str], text: str) -> bool:
    if not tokens:
        return True
    normalized = re.sub(r"[^a-z0-9+#.-]+", " ", text.lower())
    return all(token in normalized for token in tokens) or any(token in normalized for token in tokens)


def canonical_url(url: str) -> str:
    return re.sub(r"[?#].*$", "", (url or "").strip().lower()).rstrip("/")


def normalized_text(value: Optional[str]) -> str:
    return re.sub(r"\s+", " ", (value or "").strip().lower())


def stable_id(job: Dict) -> str:
    identity = "|".join([
        canonical_url(job.get("url", "")),
        normalized_text(job.get("title")),
        normalized_text(job.get("company")),
    ])
    return f"job-{hashlib.sha1(identity.encode('utf-8')).hexdigest()[:16]}"


def deduplicate_jobs(jobs: List[Dict]) -> List[Dict]:
    """Collapse reposts across boards while retaining the richest record."""
    unique: Dict[str, Dict] = {}
    aliases: Dict[tuple, str] = {}

    for raw in jobs:
        job = dict(raw)
        for field, fallback in (("title", "No Title"), ("company", "Unknown"), ("location", "Nigeria")):
            job[field] = re.sub(r"\s+", " ", (job.get(field) or fallback)).strip()
        job["url"] = (job.get("url") or "").strip()
        job["id"] = stable_id(job)

        url_key = canonical_url(job["url"])
        fingerprint = (normalized_text(job["title"]), normalized_text(job["company"]))
        key = url_key or "|".join(fingerprint)
        existing_key = aliases.get(fingerprint) or key

        if existing_key in unique:
            existing = unique[existing_key]
            if len(job.get("description") or "") > len(existing.get("description") or ""):
                existing["description"] = job["description"]
            for field in ("salary", "posted_date", "location", "url"):
                if not existing.get(field) and job.get(field):
                    existing[field] = job[field]
            existing["sources"] = sorted(set(existing.get("sources", []) + [job.get("source", "Unknown")]))
            continue

        job["sources"] = [job.get("source", "Unknown")]
        unique[key] = job
        aliases[fingerprint] = key

    return list(unique.values())
