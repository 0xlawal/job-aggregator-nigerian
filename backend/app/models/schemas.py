from pydantic import BaseModel, Field
from typing import Optional, List

class JobSearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=200)
    location: Optional[str] = Field(None, max_length=100)

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

class JobSearchResponse(BaseModel):
    jobs: List[Job]
    total: int
    query: str
    location: Optional[str] = None
    cached: bool = False

class MatchRequest(BaseModel):
    profile: str = Field(..., min_length=10, max_length=5000)
    query: str = Field(..., min_length=1, max_length=200)

class MatchScore(BaseModel):
    job_id: str
    score: int
    reason: str
    skill_gaps: List[str] = []