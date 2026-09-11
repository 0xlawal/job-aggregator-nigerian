import logging
from anthropic import Anthropic
from app.config import settings
from typing import Optional

logger = logging.getLogger(__name__)

client = Anthropic(api_key=settings.CLAUDE_API_KEY) if settings.CLAUDE_API_KEY else None

async def score_job_match(profile: str, job_title: str, job_description: str = "") -> dict:
    """Score a job match using Claude API."""
    if not client:
        logger.warning("Claude API not configured – returning default score")
        return {"score": 50, "reason": "Claude API not configured", "skill_gaps": []}

    prompt = f"""You are a job matching assistant. Rate how well this candidate matches this job.

CANDIDATE PROFILE:
{profile}

JOB TITLE: {job_title}
JOB DESCRIPTION: {job_description or 'Not provided'}

Return ONLY valid JSON (no markdown) in this exact format:
{{
  "score": <integer 0-100>,
  "reason": "<one sentence explaining the score>",
  "skill_gaps": ["<missing skill 1>", "<missing skill 2>"]
}}

Score guide:
- 90-100: Excellent match (most skills + experience align)
- 70-89: Good match (some alignment, minor gaps)
- 50-69: Fair match (partial alignment)
- 0-49: Poor match (significant gaps)
"""

    try:
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}],
        )
        import json
        text = response.content[0].text.strip()
        # Strip any accidental markdown
        if text.startswith("```"):
            text = text.split("```")[1].replace("json", "").strip()
        return json.loads(text)
    except Exception as e:
        logger.error(f"Claude API error: {e}")
        return {"score": 50, "reason": "Matching unavailable", "skill_gaps": []}