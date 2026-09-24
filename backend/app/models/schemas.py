from pydantic import BaseModel, Field
from typing import Optional, List, Literal

class JobSearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=200)
    location: Optional[str] = Field(None, max_length=100)
    page: int = Field(1, ge=1, le=1000)
    page_size: int = Field(24, ge=1, le=60)
    source: Optional[str] = Field(None, max_length=80)
    work_mode: Literal["all", "remote", "onsite"] = "all"
    posted_within: Literal["all", "24h", "7d", "30d"] = "all"
    sort: Literal["relevance", "newest"] = "relevance"

class Job(BaseModel):
    id: str
    title: str
    company: str
    location: str
    description: Optional[str] = None
    salary: Optional[str] = None
    url: str
    source: str
    posted_date: Optional[str] = None
    relevance_score: int = 0

class JobSearchResponse(BaseModel):
    jobs: List[Job]
    total: int
    query: str
    location: Optional[str] = None
    cached: bool = False
    page: int = 1
    page_size: int = 24
    has_more: bool = False
    sources: List[str] = Field(default_factory=list)

class MatchRequest(BaseModel):
    profile: str = Field(..., min_length=10, max_length=5000)
    query: str = Field(..., min_length=1, max_length=200)

class MatchScore(BaseModel):
    job_id: str
    score: int
    reason: str
    skill_gaps: List[str] = Field(default_factory=list)
